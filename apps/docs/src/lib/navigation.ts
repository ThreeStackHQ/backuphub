export interface NavItem {
  title: string;
  href: string;
  description: string;
}

export const docsNavigation: NavItem[] = [
  {
    title: "Getting Started",
    href: "/docs/getting-started",
    description: "Sign up, create your first backup, and explore the dashboard",
  },
  {
    title: "Connection Setup",
    href: "/docs/connection-setup",
    description: "Connect PostgreSQL and MySQL databases securely",
  },
  {
    title: "Backup Scheduling",
    href: "/docs/backup-scheduling",
    description: "Configure automated backup schedules with cron syntax",
  },
  {
    title: "Restore Guide",
    href: "/docs/restore-guide",
    description: "Download and restore backups to your databases",
  },
  {
    title: "API Reference",
    href: "/docs/api-reference",
    description: "Complete REST API documentation with examples",
  },
];
