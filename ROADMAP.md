# 🎬 Moovy — Feuille de route

Application de découverte de films et séries propulsée par l'API [TheMovieDB (TMDB)](https://www.themoviedb.org/), construite avec **Next.js** (App Router) et **TailwindCSS**. Projet de portfolio : l'objectif est double — livrer une app fonctionnelle et soignée, et démontrer des compétences front-end / full-stack aux recruteurs.

---

## 🧭 Vue d'ensemble

| Phase | Contenu                                | Durée estimée |
| ----- | -------------------------------------- | :-----------: |
| 0     | Cadrage & préparation                  |     2–3 j     |
| 1     | Fondations techniques                  |     3–4 j     |
| 2     | Fonctionnalités principales (MVP)      |   1–2 sem.    |
| 3     | Expérience & fonctionnalités avancées  |   1–2 sem.    |
| 4     | Qualité, SEO & accessibilité           |     3–5 j     |
| 5     | Déploiement & mise en valeur portfolio |     2–3 j     |

> Les durées sont indicatives, pour un travail à temps partiel.

---

## Phase 0 — Cadrage & préparation

**Objectif :** poser les bases avant d'écrire la première ligne de code.

- [ ] Créer un compte TMDB et générer une **clé API** (gratuite, validation sous 24–48 h)
- [ ] Prendre connaissance des **conditions d'utilisation TMDB** (obligation d'afficher la mention « This product uses the TMDB API »)
- [ ] Explorer la documentation de l'API : `/trending`, `/movie/popular`, `/tv/top_rated`, `/search/multi`, `/movie/{id}` (credits, videos, similar, watch/providers)
- [ ] Définir le périmètre du MVP : quelles pages ? quelles fonctionnalités indispensables ?
- [x] Rédiger le **guide de style** → [`STYLE_GUIDE.md`](STYLE_GUIDE.md) : palette, typographie, composants, accessibilité
- [ ] S'inspirer d'apps de référence : Netflix, Letterboxd, JustWatch
- [ ] Nommer le projet, créer le dépôt Git et le README (ébauche)

**Livrable :** maquettes validées + clé API fonctionnelle + dépôt initialisé.

---

## Phase 1 — Fondations techniques

**Objectif :** un socle propre, typé et maintenable.

- [x] Initialiser Next.js (App Router, TypeScript) — **Next 16.4.6, React 19.3, Turbopack**
- [x] Configurer **TailwindCSS v4** (+ plugin `prettier-plugin-tailwindcss` pour l'ordre des classes)
- [x] Appliquer les tokens du [guide de style](STYLE_GUIDE.md) dans `globals.css` (`@theme inline`) : couleurs, polices **Outfit + Inter** via `next/font`, rayon `rounded-card`
- [x] Configurer ESLint + Prettier (script `npm run format`)
- [ ] (Optionnel) `husky` + `lint-staged` pour le lint au commit
- [x] Variables d'environnement : `TMDB_API_KEY` / `TMDB_ACCESS_TOKEN` dans `.env.local` + `.env.example` documenté _(clés à renseigner)_
- [x] Créer le **client API TMDB** : `src/lib/tmdb.ts` (auth v4 avec repli v3, langue `fr-FR`, cache 1 h, gestion d'erreurs)
- [x] Définir les **types TypeScript** des réponses TMDB : `src/types/tmdb.ts`
- [ ] Structurer les dossiers :
  ```
  src/
  ├── app/          # routes (App Router)
  ├── components/   # UI réutilisables
  ├── lib/          # client TMDB, helpers
  ├── types/        # types TS
  └── hooks/        # hooks personnalisés
  ```
- [x] Créer le layout global : `Navbar` (lien actif `text-primary`), `Footer` avec mention d'attribution TMDB, métadonnées FR
- [x] Configurer `next/image` avec `images.remotePatterns` pour `image.tmdb.org`

**Livrable :** l'app compile, layout de base en place, un appel API de test fonctionne.

---

## Phase 2 — Fonctionnalités principales (MVP) 🎯

**Objectif :** le cœur de l'application.

### 2.1 Page d'accueil ✅

- [x] Section **héros** : média n°1 des tendances avec backdrop + titre + accroche
- [x] Carrousels horizontaux : films populaires, mieux notés, séries populaires
- [x] Composant `MovieCard` (affiche `aspect-[2/3]`, titre, `RatingBadge`) et `RatingBadge` — cf. [guide de style §6](STYLE_GUIDE.md#6-composants)
- [x] États de chargement : skeletons animés via `Suspense` (fiches détaillées, shell prerenderé)

### 2.2 Catalogue / Découverte ✅

- [x] Page Films et page Séries avec **pagination** (liens `Link` indexables, filtres conservés)
- [x] Filtres : genre, année, tri (popularité, mieux notés, plus récents) — via `/discover`, l'URL est la source de vérité
- [x] Grille responsive adaptée aux cartes

### 2.3 Page détail film / série ✅

- [x] Bannière backdrop + affiche + méta-infos (durée, genres, note, slogan)
- [x] Synopsis et informations complémentaires
- [x] Section **casting** principal (scroll horizontal)
- [x] Bande-annonce YouTube via `/videos` (lien externe pour l'instant)
- [x] Recommandations / similaires
- [x] Routes dynamiques : `/movie/[id]`, `/tv/[id]` avec métadonnées dynamiques (`generateMetadata`)

### 2.4 Recherche ✅

- [x] Barre de recherche dans le header (endpoint `/search/multi`, debounce 300 ms)
- [x] Résultats en temps réel : navigation vers `/search?q=` (sans polluer l'historique sur la page recherche)
- [x] Gestion de l'état vide (aucun résultat) et des personnes renvoyées par `/search/multi`
- [x] Page `/search` en Partial Prerender : shell statique + résultats streamés sous `Suspense`

**Livrable :** l'app est navigable de bout en bout : accueil → catalogue → détail, avec recherche fonctionnelle.

---

## Phase 3 — Expérience & fonctionnalités avancées ✨

**Objectif :** se démarquer des autres projets portfolio.

- [x] **Ma liste / Watchlist** : ajout de favoris ✅ _(bouton cœur sur les cartes et les fiches, `localStorage` + contexte React, synchro inter-onglets)_
  - Version simple : `localStorage` + contexte React — **livrée**
  - Version avancée : authentification (NextAuth / Auth.js) + base de données (Supabase, Prisma…) — optionnelle
- [x] Mode **sombre / clair** ✅ _(tokens neutres redéfinis sous `.light`, bascule dans la navbar, choix persisté, script anti-flash)_
- [x] Page « Ma liste » (`/ma-liste`) avec gestion : retrait individuel, tout retirer, état vide avec action
- [x] Où regarder (streaming) via `/watch/providers` ✅ _(logos d'offres FR par groupe abonnement/location/achat + lien JustWatch, attribution TMDB)_
- [x] Notes détaillées : barre de progression colorée (comme sur TMDB) ✅ _(anneau SVG `RatingRing` sur les fiches : arc rempli au pourcentage du score, vert/ambre/rouge selon la note, format « 8,4 / 10 »)_
- [ ] Micro-interactions : transitions, hover sur les cartes, animations `framer-motion` (avec mesure)
- [ ] Page « Acteurs populaires » et page détail acteur (`/person/[id]`)
- [ ] Gestion des erreurs : `error.tsx`, page `not-found.tsx` personnalisées

**Livrable :** l'app a une vraie personnalité et au moins une fonctionnalité mémorable.

---

## Phase 4 — Qualité, SEO & accessibilité 🔍

**Objectif :** montrer du professionnalisme.

- [ ] **Performance** : profiler avec Lighthouse (objectif ≥ 90), `next/image` partout, `next/link` pour la prévisualisation
- [ ] **SEO** : métadonnées dynamiques par film/série, `sitemap.ts`, `robots.ts`, Open Graph images
- [ ] **Accessibilité** : navigation clavier, attributs `alt`, contrastes, `aria-label` sur les carrousels, focus visible
- [ ] Gestion des **rate limits** et des réponses API inattendues (fallbacks)
- [ ] Responsive testé sur mobile, tablette et desktop
- [ ] Tests (au minimum) : tests unitaires des helpers (`vitest`) + un test e2e smoke (`playwright`)
- [ ] Nettoyer le code : pas de `console.log`, pas de code mort, constantes extraites

**Livrable :** scores Lighthouse solides, app robuste et accessible.

---

## Phase 5 — Déploiement & valorisation portfolio 🚀

**Objectif :** que le projet vende le travail.

- [ ] Déployer sur **Vercel** (configurer les variables d'environnement en production)
- [ ] Vérifier la mention d'attribution TMDB visible dans l'app (obligatoire)
- [ ] **README soigné** : bannière/capture d'écran, démo en ligne, stack technique, fonctionnalités, choix d'architecture, guide de style, instructions d'installation locale
- [ ] Ajouter des captures d'écran dans le README (light/dark, mobile/desktop)
- [ ] Tester le parcours complet en production
- [ ] Partager : LinkedIn, CV, portfolio personnel

**Livrable :** app en ligne + README qui met en valeur le projet.

---

## ⚠️ Points d'attention

- **Attribution TMDB obligatoire** : « Ce produit utilise l'API TMDB mais n'est ni approuvé ni certifié par TMDB. »
- **Ne jamais exposer la clé API côté client** : passer par le serveur (Server Components / Route Handlers) ou utiliser un token bearer côté serveur.
- **Rate limits** TMDB (~50 requêtes/s) : prévoir un cache (les revalidations Next.js font très bien le travail via `revalidate`).
- **Images TMDB** : tailles à choisir selon le contexte (`w500` pour les affiches, `original` pour les backdrops).

## 🏗️ Idées d'évolutions (post-MVP)

- Profil utilisateur avec historique de visionnage
- Tri et listes personnalisées partagées
- Notifications de sortie de nouveaux épisodes
- Application PWA hors-ligne partielle
- Internationalisation (i18n) FR/EN
