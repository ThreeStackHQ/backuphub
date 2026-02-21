"use client";

import { useState } from "react";
import { DocsSidebar } from "./DocsSidebar";
import { DocsHeader } from "./DocsHeader";

export function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <DocsSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DocsHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
