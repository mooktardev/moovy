"use client";

import { motion, useReducedMotion } from "motion/react";

import { formatRating } from "@/lib/format";

interface RatingRingProps {
  /** Note TMDB sur 10. */
  vote: number;
  /** Taille d'affichage en pixels. */
  size?: number;
}

/** Couleur de l'anneau selon la note, mêmes seuils que TMDB — guide §6. */
function ratingColor(vote: number): string {
  if (vote >= 7) return "var(--rating-good)";
  if (vote >= 4) return "var(--rating)";
  return "var(--danger)";
}

/**
 * Anneau de progression autour de la note, façon TMDB : l'arc se remplit
 * proportionnellement au score, la couleur traduit le verdict (voir,
 * moyen, mauvais). Le score est présent dès le SSR ; seul l'arc s'anime
 * côté client, désactivé si moins de mouvement demandé (§9).
 */
export function RatingRing({ vote, size = 64 }: RatingRingProps) {
  const percent = Math.min(100, Math.max(0, Math.round(vote * 10)));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const arc = (percent / 100) * circumference;
  const reduceMotion = useReducedMotion();
  const label = `Note des spectateurs : ${formatRating(vote)} sur 10`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className="shrink-0"
    >
      {/* Piste */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        strokeWidth="9"
        className="stroke-border"
      />
      {/* Arc de progression, départ en haut, remplissage animé */}
      <motion.circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        strokeWidth="9"
        strokeLinecap="round"
        stroke={ratingColor(vote)}
        strokeDasharray={circumference}
        initial={{
          strokeDashoffset: reduceMotion ? circumference - arc : circumference,
        }}
        whileInView={{ strokeDashoffset: circumference - arc }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        transform="rotate(-90 50 50)"
      />
      {/* Score au format français */}
      <text
        x="50"
        y="47"
        textAnchor="middle"
        fontSize="26"
        fontWeight="700"
        className="font-display fill-foreground"
      >
        {formatRating(vote)}
      </text>
      <text
        x="50"
        y="68"
        textAnchor="middle"
        fontSize="14"
        className="fill-muted"
      >
        / 10
      </text>
    </svg>
  );
}
