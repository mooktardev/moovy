"use client";

import { MotionConfig, motion } from "motion/react";

/**
 * Transition de page : léger fondu à chaque navigation — `template.tsx`
 * se remonte à chaque changement de route. `MotionConfig reducedMotion="user"`
 * désactive globalement les animations si le système le demande (§9).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
