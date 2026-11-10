import Image from "next/image";
import Link from "next/link";

import { tmdbImage } from "@/lib/images";
import type { WatchProviders as WatchProvidersData } from "@/types/tmdb";

interface WatchProvidersProps {
  providers: Record<string, WatchProvidersData | undefined> | undefined;
  /** Code pays des offres affichées. */
  countryCode?: string;
}

/** Groupe d'offres : logo + nom accessible. */
function ProviderList({
  label,
  providers,
}: {
  label: string;
  providers: {
    provider_id: number;
    provider_name: string;
    logo_path: string | null;
  }[];
}) {
  return (
    <div>
      <h3 className="text-muted text-xs font-medium tracking-widest uppercase">
        {label}
      </h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {providers.map((provider) => {
          const logo = tmdbImage(provider.logo_path, "w92");
          return (
            <li
              key={provider.provider_id}
              title={provider.provider_name}
              className="border-border bg-surface-2 size-12 overflow-hidden rounded-lg border"
            >
              {logo && (
                <Image
                  src={logo}
                  alt={`Logo ${provider.provider_name}`}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * « Où regarder » : offres de streaming du pays choisi, données
 * `/watch/providers`. TMDB exige le lien JustWatch en attribution.
 * Rend le contenu seul (sans titre de section) : le titre appartient
 * à la mise en page hôte.
 */
export function WatchProviders({
  providers,
  countryCode = "FR",
}: WatchProvidersProps) {
  const data = providers?.[countryCode];
  if (!data) return null;

  const groups = [
    { label: "Abonnement", items: data.flatrate ?? [] },
    { label: "Location", items: data.rent ?? [] },
    { label: "Achat", items: data.buy ?? [] },
  ].filter((group) => group.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <div>
      <div className="mt-4 space-y-4">
        {groups.map((group) => (
          <ProviderList
            key={group.label}
            label={group.label}
            providers={group.items}
          />
        ))}
      </div>
      {data.link && (
        <Link
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-foreground focus-visible:ring-primary mt-4 inline-block text-xs underline-offset-4 transition duration-200 ease-out hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Offres de streaming en France — détails sur JustWatch
        </Link>
      )}
    </div>
  );
}

/**
 * Indique si des offres existent pour le pays donné — permet à la mise
 * en page hôte de décider de la colonne avant le rendu.
 */
export function hasWatchProviders(
  providers: Record<string, WatchProvidersData | undefined> | undefined,
  countryCode = "FR",
): boolean {
  const data = providers?.[countryCode];
  if (!data) return false;
  return [data.flatrate, data.rent, data.buy].some(
    (group) => group && group.length > 0,
  );
}
