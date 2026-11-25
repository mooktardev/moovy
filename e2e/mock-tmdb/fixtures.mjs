/**
 * Données factices au format de l'API TMDB, servies par le faux serveur
 * des tests e2e. Volontairement petites : de quoi parcourir l'accueil,
 * une fiche, la recherche, Ma liste et les erreurs.
 */

export const MOVIES = {
  550: {
    id: 550,
    title: "Fight Club",
    tagline: "Il y a des choses dont on ne parle pas.",
    overview:
      "Le narrateur, sans identité précise, vit seul, travaille seul et rencontre Tyler Durden.",
    poster_path: "/fight-club.jpg",
    backdrop_path: "/fight-club-backdrop.jpg",
    vote_average: 8.4,
    vote_count: 30000,
    release_date: "1999-10-15",
    runtime: 139,
    status: "Released",
    genres: [
      { id: 18, name: "Drame" },
      { id: 53, name: "Thriller" },
    ],
  },
  680: {
    id: 680,
    title: "Pulp Fiction",
    tagline: null,
    overview:
      "Les vies de deux hommes de main, d'un boxeur et d'un couple s'entremêlent.",
    poster_path: "/pulp-fiction.jpg",
    backdrop_path: null,
    vote_average: 8.5,
    vote_count: 28000,
    release_date: "1994-09-10",
    runtime: 154,
    status: "Released",
    genres: [{ id: 80, name: "Crime" }],
  },
};

export const SHOWS = {
  1399: {
    id: 1399,
    name: "Game of Thrones",
    tagline: "L'hiver vient.",
    overview: "Neuf familles nobles se disputent le contrôle de Westeros.",
    poster_path: "/got.jpg",
    backdrop_path: "/got-backdrop.jpg",
    vote_average: 8.5,
    vote_count: 25000,
    first_air_date: "2011-04-17",
    episode_run_time: [60],
    number_of_seasons: 8,
    number_of_episodes: 73,
    status: "Ended",
    genres: [{ id: 10765, name: "Science-Fiction & Fantastique" }],
  },
};

export const PEOPLE = {
  287: {
    id: 287,
    name: "Brad Pitt",
    biography: "Acteur et producteur américain.",
    birthday: "1963-12-18",
    deathday: null,
    place_of_birth: "Shawnee, Oklahoma, USA",
    profile_path: "/brad-pitt.jpg",
    known_for_department: "Acting",
  },
};

export const GENRES = {
  movie: [
    { id: 18, name: "Drame" },
    { id: 53, name: "Thriller" },
    { id: 80, name: "Crime" },
  ],
  tv: [{ id: 10765, name: "Science-Fiction & Fantastique" }],
};

export const CAST = [
  {
    id: 287,
    name: "Brad Pitt",
    character: "Tyler Durden",
    profile_path: "/brad-pitt.jpg",
    order: 0,
  },
];

export const REVIEWS = [
  {
    id: "r1",
    author: "cinephile",
    content: "Un classique, toujours aussi percutant.",
    created_at: "2024-05-01T10:00:00.000Z",
    url: null,
    author_details: { name: "Cinéphile", rating: 9 },
  },
];

export const PROVIDERS = {
  FR: {
    link: "https://www.themoviedb.org/movie/550/watch?locale=FR",
    flatrate: [
      { provider_id: 8, provider_name: "Netflix", logo_path: "/netflix.jpg" },
    ],
  },
};
