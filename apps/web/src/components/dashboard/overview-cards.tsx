import * as React from "react";
import { Database, Archive, Clock, HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
          <Icon className="h-4 w-4 text-brand" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function OverviewCards(): React.JSX.Element {
  const stats: StatCardProps[] = [
    {
      title: "Total Databases",
      value: "0",
      description: "No databases connected yet",
      icon: Database,
    },
    {
      title: "Total Backups",
      value: "0",
      description: "No backups taken yet",
      icon: Archive,
    },
    {
      title: "Last Backup",
      value: "—",
      description: "No backups taken yet",
      icon: Clock,
    },
    {
      title: "Storage Used",
      value: "0 B",
      description: "Across all databases",
      icon: HardDrive,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  children,
}: SectionHeaderProps): React.JSX.Element {
  return (
    <div className={cn("flex items-start justify-between")}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
