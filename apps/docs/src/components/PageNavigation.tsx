"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { docsNavigation } from "@/lib/navigation";

export function PageNavigation(): React.JSX.Element | null {
  const pathname = usePathname();
  const currentIndex = docsNavigation.findIndex(
    (item) => item.href === pathname
  );

  if (currentIndex === -1) return null;

  const prev = currentIndex > 0 ? docsNavigation[currentIndex - 1] : null;
  const next =
    currentIndex < docsNavigation.length - 1
      ? docsNavigation[currentIndex + 1]
      : null;

  return (
    <nav className="mt-12 flex items-center justify-between border-t border-border pt-6">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <span>{next.title}</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
