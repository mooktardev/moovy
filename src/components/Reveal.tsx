"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Délai en secondes (effet cascade sur une série d'éléments). */
  delay?: number;
  className?: string;
}

/**
 * Apparition douce au défilement, jouée une seule fois. Le contenu reste
 * présent dans le HTML (SEO) et l'animation est désactivée si l'utilisateur
 * demande moins de mouvement — guide de style §9.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
