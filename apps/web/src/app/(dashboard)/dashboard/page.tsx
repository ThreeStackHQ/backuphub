import type { Metadata } from "next";
import { OverviewCards, SectionHeader } from "@/components/dashboard/overview-cards";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your database backup infrastructure
        </p>
      </div>

      {/* Overview cards */}
      <div className="space-y-3">
        <SectionHeader
          title="Overview"
          description="At-a-glance stats for your workspace"
        />
        <OverviewCards />
      </div>

      {/* Recent activity placeholder */}
      <div className="space-y-3">
        <SectionHeader
          title="Recent Activity"
          description="Latest backup events and status"
        />
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No recent activity. Connect a database to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
