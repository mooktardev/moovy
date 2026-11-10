import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Outfit } from "next/font/google";
import { LINKS } from "@/lib/links";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WatchlistProvider } from "@/components/WatchlistProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Moovy — Films & séries",
    template: "%s | Moovy",
  },
  description:
    "Découvrez les films et séries du moment : tendances, fiches détaillées, casting et bandes-annonces.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <WatchlistProvider>
          {/*
           * usePathname() n'est connu qu'à l'exécution sur les routes dynamiques :
           * le shell est prerenderé avec un fallback sans état actif, puis la
           * navbar réelle arrive en streaming (Cache Components).
           */}
          <Suspense
            fallback={
              <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
                <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                  <span className="font-display text-xl font-bold tracking-tight">
                    Moovy
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2">
                    {LINKS.map((link) => (
                      <span
                        key={link.href}
                        className="text-muted rounded-lg px-3 py-2 text-sm font-medium"
                      >
                        {link.label}
                      </span>
                    ))}
                  </div>
                </nav>
              </header>
            }
          >
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </WatchlistProvider>
      </body>
    </html>
  );
}
