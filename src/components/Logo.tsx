/**
 * Logo Moovy : monogramme « M-Play » — un M dont le panneau central
 * forme un triangle play, sur carré arrondi dégradé (rose de l'app).
 *
 * Composant sans état ni hook : utilisable dans les composants serveur
 * (layout, footer) comme dans les composants clients (navbar).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      role="img"
      aria-label="Moovy"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="moovy-logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fb7185" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill="url(#moovy-logo-gradient)" />
      {/* M dont le creux central accueille le triangle play */}
      <path
        d="M28 96 V36 L52 62 L64 47 L76 62 L100 36 V96 H82 V68 L64 89 L46 68 V96 Z"
        fill="#0b0b0f"
        fillRule="evenodd"
      />
      <path d="M58 44 L82 30 L82 58 Z" fill="#0b0b0f" />
    </svg>
  );
}
