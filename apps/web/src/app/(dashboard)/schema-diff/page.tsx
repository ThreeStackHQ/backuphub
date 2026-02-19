"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  GitCompare,
  Plus,
  Minus,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Dynamic import to avoid SSR issues with Monaco
const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading editor…
      </div>
    ),
  }
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface DatabaseRecord {
  id: string;
  name: string;
  type: "postgres" | "mysql";
}

interface SchemaDiffSummary {
  tables_added: number;
  tables_removed: number;
  columns_changed: number;
}

interface SchemaDiffData {
  baseline: string;
  current: string;
  summary: SchemaDiffSummary;
  fetched_at: string;
}

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: number) => void;
}): React.JSX.Element {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm",
            t.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          )}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{t.message}</span>
          <button
            onClick={() => onRemove(t.id)}
            className="ml-2 opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Summary Card ────────────────────────────────────────────────────────────

function SummaryCard({
  summary,
  fetchedAt,
}: {
  summary: SchemaDiffSummary;
  fetchedAt: string;
}): React.JSX.Element {
  const hasChanges =
    summary.tables_added > 0 ||
    summary.tables_removed > 0 ||
    summary.columns_changed > 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card px-4 py-3">
      {hasChanges ? (
        <>
          {summary.tables_added > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="success" className="gap-1">
                <Plus className="h-3 w-3" />
                {summary.tables_added} table
                {summary.tables_added !== 1 ? "s" : ""} added
              </Badge>
            </div>
          )}
          {summary.tables_removed > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="error" className="gap-1">
                <Minus className="h-3 w-3" />
                {summary.tables_removed} table
                {summary.tables_removed !== 1 ? "s" : ""} removed
              </Badge>
            </div>
          )}
          {summary.columns_changed > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="warning" className="gap-1">
                <Pencil className="h-3 w-3" />
                {summary.columns_changed} column
                {summary.columns_changed !== 1 ? "s" : ""} changed
              </Badge>
            </div>
          )}
        </>
      ) : (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          No schema changes detected
        </Badge>
      )}
      <span className="ml-auto text-xs text-muted-foreground">
        Refreshed {new Date(fetchedAt).toLocaleTimeString()}
      </span>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SchemaDiffPage(): React.JSX.Element {
  const [databases, setDatabases] = useState<DatabaseRecord[]>([]);
  const [selectedDb, setSelectedDb] = useState<string>("");
  const [diffData, setDiffData] = useState<SchemaDiffData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbsLoading, setDbsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const editorRef = useRef<unknown>(null);

  const addToast = useCallback(
    (type: "success" | "error", message: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load databases
  useEffect(() => {
    fetch("/api/databases")
      .then((r) => r.json())
      .then((data: unknown) => {
        const d = data as { databases?: DatabaseRecord[] };
        const dbs = d.databases ?? [];
        setDatabases(dbs);
        if (dbs.length > 0 && dbs[0]) {
          setSelectedDb(dbs[0].id);
        }
      })
      .catch(() => {
        // Non-fatal
      })
      .finally(() => setDbsLoading(false));
  }, []);

  const fetchDiff = useCallback(async () => {
    if (!selectedDb) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/schema-diff?database_id=${encodeURIComponent(selectedDb)}`
      );
      if (res.status === 404) {
        // No baseline yet
        setDiffData(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch schema diff");
      const data = (await res.json()) as SchemaDiffData;
      setDiffData(data);
      addToast("success", "Schema diff refreshed");
    } catch {
      // API not implemented yet — show empty state
      setDiffData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDb, addToast]);

  // Auto-fetch when db changes
  useEffect(() => {
    if (selectedDb) {
      void fetchDiff();
    }
  }, [selectedDb, fetchDiff]);

  // Monaco editor options
  const editorOptions = {
    readOnly: true,
    minimap: { enabled: false },
    renderSideBySide: true,
    fontSize: 13,
    lineNumbers: "on" as const,
    scrollBeyondLastLine: false,
    wordWrap: "on" as const,
    diffCodeLens: true,
    originalEditable: false,
  };

  return (
    <>
      <div className="flex h-[calc(100vh-theme(spacing.14)-theme(spacing.12))] flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Schema Diff
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Compare database schemas across backup versions
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Database selector */}
            {dbsLoading ? (
              <div className="h-9 w-48 rounded-md border border-input bg-muted animate-pulse" />
            ) : (
              <select
                value={selectedDb}
                onChange={(e) => setSelectedDb(e.target.value)}
                disabled={databases.length === 0}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 min-w-[180px]"
              >
                {databases.length === 0 ? (
                  <option value="">No databases connected</option>
                ) : (
                  databases.map((db) => (
                    <option key={db.id} value={db.id}>
                      {db.name}
                    </option>
                  ))
                )}
              </select>
            )}

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchDiff()}
              disabled={loading || !selectedDb}
              className="gap-2"
            >
              <RefreshCw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Summary */}
        {diffData && (
          <div className="shrink-0">
            <SummaryCard summary={diffData.summary} fetchedAt={diffData.fetched_at} />
          </div>
        )}

        {/* Editor area */}
        <div className="flex-1 min-h-0">
          {databases.length === 0 && !dbsLoading ? (
            /* No databases empty state */
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-card/50">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 mb-4">
                  <GitCompare className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No databases connected
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Connect a database first to view schema diffs.
                </p>
              </div>
            </div>
          ) : !diffData && !loading ? (
            /* No baseline empty state */
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border bg-card/50">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 mb-4">
                  <GitCompare className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  No baseline yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Run your first backup to establish a schema baseline. Once
                  you have a baseline, schema changes will appear here.
                </p>
              </div>
            </div>
          ) : loading && !diffData ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading schema diff…
              </div>
            </div>
          ) : diffData ? (
            /* Monaco Diff Editor */
            <div className="h-full rounded-xl border border-border overflow-hidden bg-card">
              {/* Column labels */}
              <div className="flex border-b border-border bg-muted/30">
                <div className="flex-1 px-4 py-2 text-xs font-medium text-muted-foreground border-r border-border">
                  Baseline
                </div>
                <div className="flex-1 px-4 py-2 text-xs font-medium text-muted-foreground">
                  Current
                </div>
              </div>

              <div className="h-[calc(100%-37px)]">
                <DiffEditor
                  original={diffData.baseline}
                  modified={diffData.current}
                  language="sql"
                  theme="vs-dark"
                  options={editorOptions}
                  onMount={(editor: unknown) => {
                    editorRef.current = editor;
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
