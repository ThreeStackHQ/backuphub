"use client";

import Link from "next/link";
import { Database, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface DocsHeaderProps {
  onMenuClick: () => void;
}

export function DocsHeader({ onMenuClick }: DocsHeaderProps): React.JSX.Element {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <button
        onClick={onMenuClick}
        className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <Link
        href="/"
        className="flex items-center gap-2 font-semibold md:hidden"
      >
        <Database className="h-5 w-5 text-brand" />
        <span>BackupHub Docs</span>
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href="https://backuphub.threestack.io"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Dashboard
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
