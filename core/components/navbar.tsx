import Link from "next/link";
import type { Route } from "next";

import { ThemeToggle } from "@/core/components/theme-toggle";
import { Button } from "@/core/ui/button";

const links: Array<{ href: Route; label: string }> = [
  { href: "/", label: "Home" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold tracking-[-0.03em]">
          Laboratory Tracking
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/item-logs">Open app</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
