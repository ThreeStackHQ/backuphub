"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { docsNavigation } from "@/lib/navigation";

interface DocsSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function DocsSidebar({
  open,
  onClose,
}: DocsSidebarProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:sticky md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Database className="h-5 w-5 text-brand" />
            <span>BackupHub Docs</span>
          </Link>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {docsNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-4 py-3">
          <Link
            href="https://backuphub.threestack.io"
            className="text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/70"
          >
            backuphub.threestack.io
          </Link>
        </div>
      </aside>
    </>
  );
}
