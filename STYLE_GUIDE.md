# Guide de style : Moovy

Un guide volontairement court, pensé pour un portfolio : peu de règles, mais appliquées partout.

## 1. Principes

- **Le contenu d'abord** : les affiches et les backdrops sont les vedettes, l'interface s'efface.
- **Ambiance cinéma** : thème sombre par défaut, fonds profonds, un seul accent de couleur.
- **Sobriété** : peu de couleurs, peu d'effets, des espacements généreux.
- **Cohérence** : mêmes rayons, mêmes ombres, mêmes transitions sur toute l'app.

## 2. Couleurs

Définies une seule fois comme tokens, jamais de couleur en dur dans les composants.

| Rôle                               | Token         | Valeur    |
| ---------------------------------- | ------------- | --------- |
| Fond principal                     | `background`  | `#0B0B0F` |
| Surface (cartes, navbar)           | `surface`     | `#15151C` |
| Surface élevée (survol, modales)   | `surface-2`   | `#1F1F29` |
| Bordure                            | `border`      | `#2A2A36` |
| Texte principal                    | `foreground`  | `#F4F4F5` |
| Texte secondaire                   | `muted`       | `#A1A1AA` |
| Accent (boutons, liens, focus)     | `primary`     | `#E11D48` |
| Note / étoile                      | `rating`      | `#F59E0B` |
| Bonne note (anneau de progression) | `rating-good` | `#22C55E` |
| Erreur                             | `danger`      | `#EF4444` |

Règles :

- L'accent `primary` est réservé aux actions principales et aux états actifs (favori, lien actif).
- `rating` sert uniquement aux notes.
- Contraste minimum de 4.5:1 pour le texte (`muted` sur `background` passe).
- Thème clair (bonus) : inverser `background`, `surface` et `foreground` via les mêmes tokens.

```css
/* app/globals.css (Tailwind v4) */
@import "tailwindcss";

@theme {
  --color-background: #0b0b0f;
  --color-surface: #15151c;
  --color-surface-2: #1f1f29;
  --color-border: #2a2a36;
  --color-foreground: #f4f4f5;
  --color-muted: #a1a1aa;
  --color-primary: #e11d48;
  --color-rating: #f59e0b;
  --color-rating-good: #22c55e;
  --color-danger: #ef4444;

  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-display: var(--font-outfit), system-ui, sans-serif;

  --radius-card: 0.75rem;
}
```

Avec Tailwind v3, les mêmes valeurs vont dans `theme.extend.colors` de `tailwind.config.ts`.

## 3. Typographie

Deux polices via `next/font/google` :

- **Outfit** pour les titres
- **Inter** pour le texte et l'interface

| Usage                      | Classes Tailwind                                 |
| -------------------------- | ------------------------------------------------ |
| Titre hero                 | `font-display text-4xl md:text-6xl font-bold`    |
| Titre de page (h1)         | `font-display text-3xl md:text-4xl font-bold`    |
| Titre de section (h2)      | `font-display text-xl md:text-2xl font-semibold` |
| Titre de carte             | `text-sm font-medium`                            |
| Texte courant              | `text-base leading-relaxed`                      |
| Texte secondaire           | `text-sm text-muted`                             |
| Métadonnées (année, durée) | `text-xs text-muted`                             |

Règles : un seul `h1` par page, `max-w-prose` pour les synopsis, titres longs tronqués avec `line-clamp-2`.

## 4. Espacements et mise en page

- Échelle Tailwind uniquement (`2, 4, 6, 8, 12, 16`), pas de valeurs arbitraires.
- Conteneur : `mx-auto max-w-7xl px-4 md:px-6`.
- Espace entre sections : `space-y-12`.
- Grille d'affiches : `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4`.
- **Mobile first** : écrire d'abord le mobile, puis `sm:`, `md:`, `lg:`.

## 5. Formes, ombres, mouvement

- **Rayons** : `rounded-card` pour les cartes et images, `rounded-full` pour les badges et boutons ronds, `rounded-lg` pour les boutons et champs.
- **Ombres** : quasi absentes en thème sombre ; les niveaux se distinguent par la surface et la bordure `border-border`.
- **Transitions** : `transition duration-200 ease-out` partout.
- **Survol des cartes** : `hover:scale-105` + `hover:ring-2 ring-primary/60`.
- **Skeletons** : `animate-pulse bg-surface-2 rounded-card`.
- Prévoir `motion-reduce:` pour désactiver les animations si demandé.

## 6. Composants

**Boutons**

- Primaire : `bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90`
- Secondaire : `bg-surface-2 text-foreground border border-border hover:bg-surface`
- Icône (favori) : `size-10 rounded-full bg-black/50 backdrop-blur` ; l'état actif passe le cœur en `text-primary`.

**MovieCard**

- Affiche au ratio `aspect-[2/3]`, `rounded-card`, `overflow-hidden`.
- Titre et année sous l'affiche ; `RatingBadge` en haut à gauche, bouton favori en haut à droite.

**RatingBadge**

- `bg-black/70 text-rating text-xs font-semibold px-2 py-1 rounded-full`, étoile + note sur 10 avec une décimale.

**RatingRing** (fiches détaillées)

- Anneau de progression SVG façon TMDB : arc coloré selon la note (`rating-good` ≥ 7, `rating` 4–7, `danger` < 4), piste en `border`, score au centre au format « 8,4 / 10 ».
- `role="img"` avec `aria-label` descriptif — la couleur ne porte jamais seule l'information (§9).

**Champs (recherche)**

- `bg-surface border border-border rounded-lg px-4 py-2.5 placeholder:text-muted focus:ring-2 focus:ring-primary`.

**Navbar**

- Sticky, `bg-background/80 backdrop-blur border-b border-border`, lien actif en `text-primary`.

**Hero**

- Backdrop pleine largeur avec dégradé `bg-gradient-to-t from-background via-background/60 to-transparent` pour la lisibilité du texte.

## 7. Images

- Tailles TMDB : `w342` (cartes), `w780` (détail), `w1280` ou `original` (hero uniquement).
- Toujours `next/image` avec `sizes` renseigné ; `priority` seulement sur le hero.
- Image manquante : placeholder `bg-surface-2` avec une icône de film.
- `alt` descriptif : « Affiche de {titre} ».

## 8. États de l'interface

- **Chargement** : skeletons de la même taille que le contenu final (pas de saut de mise en page).
- **Vide** : icône + phrase courte + action (« Aucun favori pour le moment. Explorer les films »).
- **Erreur** : message clair en `text-danger` + bouton « Réessayer ».
- **Focus** : `focus-visible:ring-2 focus-visible:ring-primary` sur tous les éléments interactifs, sans jamais supprimer l'outline sans remplaçant.

## 9. Accessibilité

- Zones cliquables d'au moins 40 px.
- Icônes seules avec `aria-label` (« Ajouter aux favoris »).
- La couleur ne porte jamais seule l'information (le favori change aussi d'icône : cœur plein ou vide).
- Navigation clavier complète, ordre de tabulation logique.

## 10. Ton éditorial et conventions

- Interface en français, ton direct et simple (« Rechercher un film », pas « Effectuer une recherche »).
- Notes affichées `7,8` (virgule), durées `2 h 15`, dates `12 mars 2024` via `Intl.DateTimeFormat('fr-FR')`.
- Composants en `PascalCase`, fichiers identiques (`MovieCard.tsx`), classes Tailwind triées (`prettier-plugin-tailwindcss`).
- Footer : logo TMDB et phrase d'attribution obligatoires.
