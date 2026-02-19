"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  Archive,
  GitCompare,
  Settings,
  ChevronLeft,
  ChevronRight,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: "Databases",
    href: "/databases",
    icon: Database,
  },
  {
    label: "Backups",
    href: "/backups",
    icon: Archive,
  },
  {
    label: "Schema Diff",
    href: "/schema-diff",
    icon: GitCompare,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({
  collapsed,
  onToggle,
}: AppSidebarProps): React.JSX.Element {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-[60px]" : "w-[240px]"
        )}
      >
        {/* Logo / Brand */}
        <div
          className={cn(
            "flex h-14 items-center border-b border-sidebar-border px-3",
            collapsed ? "justify-center" : "gap-2 px-4"
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand">
            <HardDrive className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground">
              BackupHub
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                        isActive
                          ? "bg-brand/20 text-brand"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                  isActive
                    ? "bg-brand/20 text-brand font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Separator + Collapse toggle */}
        <div className="p-2">
          <Separator className="mb-2 bg-sidebar-border" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-9 w-full text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              collapsed ? "w-9" : "justify-end px-2"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <span className="mr-1 text-xs">Collapse</span>
                <ChevronLeft className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
