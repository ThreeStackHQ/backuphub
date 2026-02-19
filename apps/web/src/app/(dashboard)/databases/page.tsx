import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Databases",
};

export default function DatabasesPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Databases
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your connected databases
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No databases connected yet. Coming in Sprint 2.4.
        </p>
      </div>
    </div>
  );
}
