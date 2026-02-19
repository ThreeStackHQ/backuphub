import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schema Diff",
};

export default function SchemaDiffPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Schema Diff
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compare database schemas across versions
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Monaco-powered diff viewer. Coming in Sprint 2.6.
        </p>
      </div>
    </div>
  );
}
