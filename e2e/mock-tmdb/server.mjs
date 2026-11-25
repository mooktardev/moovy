/**
 * Faux serveur TMDB pour les tests e2e. L'application l'interroge à la
 * place de l'API réelle via `TMDB_API_URL` : les tests ne dépendent ni du
 * réseau ni d'une clé, et leurs données ne bougent pas.
 *
 * Cas particuliers :
 * - un id inconnu répond 404, comme TMDB (fiche introuvable) ;
 * - l'id 503 répond 503 (panne TMDB → page d'erreur, pas 404).
 *
 * Usage : node e2e/mock-tmdb/server.mjs [port]  (défaut 4010)
 */
import { createServer } from "node:http";

import {
  CAST,
  GENRES,
  MOVIES,
  PEOPLE,
  PROVIDERS,
  REVIEWS,
  SHOWS,
} from "./fixtures.mjs";

const PORT = Number(process.argv[2] ?? process.env.MOCK_TMDB_PORT ?? 4010);
const OUTAGE_ID = 503;

const movieItem = (movie) => ({ ...movie, media_type: "movie" });
const tvItem = (show) => ({ ...show, media_type: "tv" });
const personItem = (person) => ({ ...person, media_type: "person" });

function page(results) {
  return {
    page: 1,
    results,
    total_pages: 1,
    total_results: results.length,
  };
}

const allMovies = () => Object.values(MOVIES).map(movieItem);
const allShows = () => Object.values(SHOWS).map(tvItem);

function movieDetails(movie) {
  const others = allMovies().filter((item) => item.id !== movie.id);
  return {
    ...movie,
    credits: { cast: CAST },
    videos: { results: [] },
    similar: page(others),
    "watch/providers": { results: PROVIDERS },
  };
}

function tvDetails(show) {
  return {
    ...show,
    credits: { cast: CAST },
    videos: { results: [] },
    similar: page([]),
    "watch/providers": { results: PROVIDERS },
  };
}

function personDetails(person) {
  return {
    ...person,
    combined_credits: {
      cast: [{ ...movieItem(MOVIES[550]), character: "Tyler Durden" }],
    },
  };
}

function search(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return page([]);
  const matches = [
    ...allMovies(),
    ...allShows(),
    ...Object.values(PEOPLE).map(personItem),
  ].filter((item) => (item.title ?? item.name).toLowerCase().includes(needle));
  return page(matches);
}

/** Table des routes : [motif, gestionnaire(params, url) → [statut, corps]]. */
const ROUTES = [
  [
    /^\/trending\/(all|movie|tv)\/(day|week)$/,
    ([kind]) => [
      200,
      page(
        kind === "tv"
          ? allShows()
          : kind === "movie"
            ? allMovies()
            : [allMovies()[0], ...allShows(), ...allMovies().slice(1)],
      ),
    ],
  ],
  [
    /^\/movie\/(popular|top_rated|now_playing|upcoming)$/,
    () => [200, page(allMovies())],
  ],
  [/^\/tv\/(popular|top_rated|on_the_air)$/, () => [200, page(allShows())]],
  [/^\/discover\/movie$/, () => [200, page(allMovies())]],
  [/^\/discover\/tv$/, () => [200, page(allShows())]],
  [/^\/genre\/(movie|tv)\/list$/, ([kind]) => [200, { genres: GENRES[kind] }]],
  [
    /^\/search\/multi$/,
    (_, url) => [200, search(url.searchParams.get("query") ?? "")],
  ],
  [/^\/person\/popular$/, () => [200, page(Object.values(PEOPLE))]],
  [
    /^\/(movie|tv)\/(\d+)\/reviews$/,
    ([, id]) => [200, page(Number(id) === 550 ? REVIEWS : [])],
  ],
  [
    /^\/movie\/(\d+)$/,
    ([id]) => detail(MOVIES[id] && movieDetails(MOVIES[id]), id),
  ],
  [/^\/tv\/(\d+)$/, ([id]) => detail(SHOWS[id] && tvDetails(SHOWS[id]), id)],
  [
    /^\/person\/(\d+)$/,
    ([id]) => detail(PEOPLE[id] && personDetails(PEOPLE[id]), id),
  ],
];

function detail(data, id) {
  if (Number(id) === OUTAGE_ID) {
    return [503, { status_code: 9, status_message: "Service offline." }];
  }
  return data
    ? [200, data]
    : [
        404,
        {
          status_code: 34,
          status_message: "The resource you requested could not be found.",
        },
      ];
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
  const path = url.pathname.replace(/^\/3/, "");
  let status = 404;
  let body = {
    status_code: 34,
    status_message: `Route inconnue du faux TMDB : ${path}`,
  };

  if (!request.headers.authorization && !url.searchParams.has("api_key")) {
    status = 401;
    body = { status_code: 7, status_message: "Invalid API key." };
  } else {
    for (const [pattern, handler] of ROUTES) {
      const match = path.match(pattern);
      if (match) {
        [status, body] = handler(match.slice(1), url);
        break;
      }
    }
    if (status === 404 && body.status_message.startsWith("Route inconnue")) {
      console.warn(`[faux TMDB] ${body.status_message}`);
    }
  }

  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[faux TMDB] http://127.0.0.1:${PORT}/3`);
});
