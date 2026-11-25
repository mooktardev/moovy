import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { formatRating } from "@/lib/format";
import { SITE_DESCRIPTION } from "@/lib/seo";
import { isTmdbNotFound, parseTmdbId } from "@/lib/tmdb-errors";

/** Format Open Graph recommandé (Facebook, LinkedIn, X, Slack…). */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const COLORS = {
  background: "#0b0b0f",
  surface: "#15151c",
  foreground: "#f4f4f5",
  muted: "#a1a1aa",
  primary: "#e11d48",
  rating: "#f59e0b",
  ratingGood: "#22c55e",
};

/**
 * Outfit (police d'affichage du site, licence OFL : assets/fonts/OFL.txt),
 * lue une seule fois. Fournir des polices remplace celle par défaut de
 * next/og, qui n'a qu'une graisse et ignore donc `fontWeight: 700`.
 * Chemins littéraux obligatoires : un chemin calculé (template) fait
 * surveiller tout le projet par Turbopack, et `next dev` boucle alors en
 * rechargements complets.
 */
const fontsPromise = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/outfit-latin-400-normal.woff")),
  readFile(join(process.cwd(), "assets/fonts/outfit-latin-700-normal.woff")),
]).then(([regular, bold]) => [
  {
    name: "Outfit",
    weight: 400 as const,
    style: "normal" as const,
    data: regular,
  },
  {
    name: "Outfit",
    weight: 700 as const,
    style: "normal" as const,
    data: bold,
  },
]);

async function imageOptions() {
  return { ...OG_SIZE, fonts: await fontsPromise };
}

/** Logo (public/logo.svg) en data URI : aucun accès disque ni réseau. */
const LOGO = `data:image/svg+xml,${encodeURIComponent(
  '<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fb7185"/><stop offset="1" stop-color="#e11d48"/></linearGradient></defs><rect width="128" height="128" rx="28" fill="url(#g)"/><path d="M28 96 V36 L52 62 L64 47 L76 62 L100 36 V96 H82 V68 L64 89 L46 68 V96 Z" fill="#0b0b0f" fill-rule="evenodd"/><path d="M58 44 L82 30 L82 58 Z" fill="#0b0b0f"/></svg>',
)}`;

function Brand({ size = 44 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.3 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendu Satori, pas le DOM */}
      <img src={LOGO} width={size} height={size} alt="" />
      <span
        style={{
          fontSize: size * 0.75,
          fontWeight: 700,
          color: COLORS.foreground,
        }}
      >
        Moovy
      </span>
    </div>
  );
}

/** Carte générique du site : accueil, catalogues, fiches introuvables. */
export async function brandImage({
  title = "Films & séries",
  subtitle = SITE_DESCRIPTION,
}: { title?: string; subtitle?: string } = {}): Promise<ImageResponse> {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 96,
        gap: 36,
        color: COLORS.foreground,
        backgroundColor: COLORS.background,
        backgroundImage: `radial-gradient(circle at 85% 15%, ${COLORS.primary}55 0%, transparent 55%)`,
      }}
    >
      <Brand size={96} />
      <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>
        {title}
      </div>
      <div
        style={{
          fontSize: 32,
          color: COLORS.muted,
          lineHeight: 1.35,
          maxWidth: 900,
        }}
      >
        {subtitle}
      </div>
    </div>,
    await imageOptions(),
  );
}

export interface MediaCard {
  title: string;
  /** Ligne secondaire, ex. « 1999 • Drame » ou « Acteur ». */
  subtitle: string | null;
  /** Note sur 10 ; null pour une personne ou sans votes. */
  rating: number | null;
  /** Affiche ou photo (URL TMDB). */
  poster: string | null;
  /** Image de fond (URL TMDB). */
  backdrop: string | null;
}

/** Carte d'une fiche : fond flouté, affiche, titre, infos et note. */
export async function mediaImage({
  title,
  subtitle,
  rating,
  poster,
  backdrop,
}: MediaCard): Promise<ImageResponse> {
  const ratingColor =
    rating !== null && rating >= 7 ? COLORS.ratingGood : COLORS.rating;
  const titleSize = title.length > 40 ? 52 : title.length > 22 ? 64 : 76;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        color: COLORS.foreground,
        backgroundColor: COLORS.background,
      }}
    >
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element -- rendu Satori
        <img
          src={backdrop}
          alt=""
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          style={{
            position: "absolute",
            inset: 0,
            objectFit: "cover",
            opacity: 0.35,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage: `linear-gradient(90deg, ${COLORS.background} 30%, ${COLORS.background}99 70%, ${COLORS.background}55 100%)`,
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "64px 72px",
          width: "100%",
        }}
      >
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element -- rendu Satori
          <img
            src={poster}
            alt=""
            width={330}
            height={495}
            style={{ borderRadius: 20, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 330,
              height: 495,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: COLORS.surface,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- rendu Satori */}
            <img src={LOGO} width={120} height={120} alt="" />
          </div>
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: 495,
            flex: 1,
          }}
        >
          <Brand />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 700,
                lineHeight: 1.05,
                display: "flex",
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 32, color: COLORS.muted }}>
                {subtitle}
              </div>
            )}
          </div>
          <div style={{ display: "flex", minHeight: 72 }}>
            {rating !== null && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 24px",
                  borderRadius: 999,
                  backgroundColor: COLORS.surface,
                  border: `3px solid ${ratingColor}`,
                  fontSize: 36,
                  fontWeight: 700,
                }}
              >
                <svg width="34" height="34" viewBox="0 0 24 24">
                  <path
                    fill={ratingColor}
                    d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
                  />
                </svg>
                <span>{formatRating(rating)}</span>
                <span style={{ color: COLORS.muted, fontSize: 26 }}>/ 10</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    await imageOptions(),
  );
}

/**
 * Image d'une fiche : carte du média, ou carte générique pour un id
 * invalide ou un 404 TMDB. Une panne est relancée : l'image n'est alors
 * pas mise en cache et sera regénérée à la prochaine demande.
 */
export async function detailImage<T>(
  rawId: string,
  load: (id: number) => Promise<T>,
  toCard: (data: T) => MediaCard,
): Promise<ImageResponse> {
  const id = parseTmdbId(rawId);
  if (id === null) return brandImage();
  try {
    return await mediaImage(toCard(await load(id)));
  } catch (error) {
    if (isTmdbNotFound(error)) return brandImage();
    throw error;
  }
}
