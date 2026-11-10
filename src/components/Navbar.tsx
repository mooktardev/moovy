"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LINKS } from "@/lib/links";

/** Lien actif en text-primary (guide de style §6). */
function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`focus-visible:ring-primary rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ease-out focus-visible:ring-2 ${
        isActive ? "text-primary" : "text-muted hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link
          href="/"
          className="font-display text-foreground hover:text-primary focus-visible:ring-primary text-xl font-bold tracking-tight transition duration-200 ease-out focus-visible:ring-2"
        >
          Moovy
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </div>
      </nav>
    </header>
  );
}
