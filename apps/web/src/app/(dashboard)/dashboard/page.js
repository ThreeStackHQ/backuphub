"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = DashboardPage;
const overview_cards_1 = require("@/components/dashboard/overview-cards");
exports.metadata = {
    title: "Dashboard",
};
function DashboardPage() {
    return (<div className="space-y-6">
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
        <overview_cards_1.SectionHeader title="Overview" description="At-a-glance stats for your workspace"/>
        <overview_cards_1.OverviewCards />
      </div>

      {/* Recent activity placeholder */}
      <div className="space-y-3">
        <overview_cards_1.SectionHeader title="Recent Activity" description="Latest backup events and status"/>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No recent activity. Connect a database to get started.
          </p>
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map