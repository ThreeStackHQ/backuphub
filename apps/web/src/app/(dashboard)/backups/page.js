"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BackupsPage;
const React = __importStar(require("react"));
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const utils_1 = require("@/lib/utils");
const PAGE_SIZE = 20;
// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
    if (bytes === 0)
        return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}
function formatRelativeTime(dateStr) {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1)
        return "just now";
    if (diffMin < 60)
        return `${diffMin}m ago`;
    if (diffHr < 24)
        return `${diffHr}h ago`;
    return `${diffDay}d ago`;
}
function formatTimestamp(dateStr) {
    return new Date(dateStr).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
// ─── Toast ───────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove, }) {
    return (<div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (<div key={t.id} className={(0, utils_1.cn)("flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg text-sm", t.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-red-500/30 bg-red-500/10 text-red-400")}>
          {t.type === "success" ? (<lucide_react_1.CheckCircle2 className="h-4 w-4 shrink-0"/>) : (<lucide_react_1.XCircle className="h-4 w-4 shrink-0"/>)}
          <span>{t.message}</span>
          <button onClick={() => onRemove(t.id)} className="ml-2 opacity-60 hover:opacity-100">
            ×
          </button>
        </div>))}
    </div>);
}
// ─── Status Icon ─────────────────────────────────────────────────────────────
function StatusIcon({ status }) {
    if (status === "success")
        return <lucide_react_1.CheckCircle2 className="h-5 w-5 text-green-400"/>;
    if (status === "failed")
        return <lucide_react_1.XCircle className="h-5 w-5 text-red-400"/>;
    return <lucide_react_1.Loader2 className="h-5 w-5 text-blue-400 animate-spin"/>;
}
function StatusBadge({ status }) {
    if (status === "success")
        return <badge_1.Badge variant="success">Success</badge_1.Badge>;
    if (status === "failed")
        return <badge_1.Badge variant="error">Failed</badge_1.Badge>;
    return <badge_1.Badge variant="info">Running</badge_1.Badge>;
}
// ─── Page ────────────────────────────────────────────────────────────────────
function BackupsPage() {
    const [databases, setDatabases] = (0, react_1.useState)([]);
    const [backups, setBackups] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedDb, setSelectedDb] = (0, react_1.useState)("all");
    const [fromDate, setFromDate] = (0, react_1.useState)("");
    const [toDate, setToDate] = (0, react_1.useState)("");
    const [page, setPage] = (0, react_1.useState)(1);
    const [total, setTotal] = (0, react_1.useState)(0);
    const [downloading, setDownloading] = (0, react_1.useState)(null);
    const [toasts, setToasts] = (0, react_1.useState)([]);
    const addToast = (0, react_1.useCallback)((type, message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);
    const removeToast = (0, react_1.useCallback)((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    // Load databases for filter dropdown
    (0, react_1.useEffect)(() => {
        fetch("/api/databases")
            .then((r) => r.json())
            .then((data) => {
            const d = data;
            setDatabases(d.databases ?? []);
        })
            .catch(() => {
            // Non-fatal
        });
    }, []);
    const fetchBackups = (0, react_1.useCallback)(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedDb !== "all")
                params.set("databaseId", selectedDb);
            if (fromDate)
                params.set("from", fromDate);
            if (toDate)
                params.set("to", toDate);
            params.set("page", String(page));
            params.set("limit", String(PAGE_SIZE));
            const res = await fetch(`/api/backups?${params.toString()}`);
            if (!res.ok)
                throw new Error("Failed to load backups");
            const data = (await res.json());
            setBackups(data.backups ?? []);
            setTotal(data.total ?? 0);
        }
        catch {
            // API not yet implemented — show empty state gracefully
            setBackups([]);
            setTotal(0);
        }
        finally {
            setLoading(false);
        }
    }, [selectedDb, fromDate, toDate, page]);
    (0, react_1.useEffect)(() => {
        void fetchBackups();
    }, [fetchBackups]);
    const handleDownload = (0, react_1.useCallback)(async (backupId) => {
        setDownloading(backupId);
        try {
            const res = await fetch(`/api/backups/${backupId}/download`);
            if (!res.ok)
                throw new Error("Download failed");
            const data = (await res.json());
            if (data.url) {
                window.open(data.url, "_blank");
            }
            else {
                throw new Error("No download URL returned");
            }
        }
        catch (err) {
            addToast("error", err instanceof Error ? err.message : "Download failed");
        }
        finally {
            setDownloading(null);
        }
    }, [addToast]);
    const totalPages = Math.ceil(total / PAGE_SIZE);
    return (<>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Backups
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage your database backup history
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Database filter */}
          <select value={selectedDb} onChange={(e) => {
            setSelectedDb(e.target.value);
            setPage(1);
        }} className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="all">All databases</option>
            {databases.map((db) => (<option key={db.id} value={db.id}>
                {db.name}
              </option>))}
          </select>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <input type="date" value={fromDate} onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
        }} className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"/>
            <span className="text-muted-foreground text-sm">→</span>
            <input type="date" value={toDate} onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
        }} className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"/>
          </div>

          {/* Clear filters */}
          {(selectedDb !== "all" || fromDate || toDate) && (<button_1.Button variant="ghost" size="sm" onClick={() => {
                setSelectedDb("all");
                setFromDate("");
                setToDate("");
                setPage(1);
            }} className="text-muted-foreground hover:text-foreground">
              Clear filters
            </button_1.Button>)}
        </div>

        {/* Content */}
        {loading ? (<div className="flex items-center justify-center py-24">
            <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
          </div>) : backups.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 mb-4">
              <lucide_react_1.Archive className="h-7 w-7 text-blue-400"/>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No backups yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Connect a database to get started. Backups will appear here once
              they run.
            </p>
          </div>) : (
        /* Timeline */
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[2.75rem] top-0 bottom-0 w-px bg-border"/>

              <div className="divide-y divide-border">
                {backups.map((backup, idx) => (<div key={backup.id} className="relative flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                    {/* Timeline dot */}
                    <div className="relative z-10 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                      <StatusIcon status={backup.status}/>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={backup.status}/>
                          <span className="font-medium text-foreground text-sm">
                            {backup.database_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {backup.size_bytes > 0 && (<span className="flex items-center gap-1">
                              <lucide_react_1.DatabaseZap className="h-3 w-3"/>
                              {formatBytes(backup.size_bytes)}
                            </span>)}
                          {backup.duration_ms > 0 && (<span className="flex items-center gap-1">
                              <lucide_react_1.Clock className="h-3 w-3"/>
                              {formatDuration(backup.duration_ms)}
                            </span>)}
                          <span title={formatTimestamp(backup.created_at)} className="tabular-nums">
                            {formatRelativeTime(backup.created_at)}
                          </span>
                        </div>
                      </div>

                      {idx === 0 && (<p className="text-xs text-muted-foreground mt-0.5">
                          {formatTimestamp(backup.created_at)}
                        </p>)}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Restore placeholder */}
                      <button_1.Button variant="ghost" size="sm" disabled className="h-8 gap-1 text-xs text-muted-foreground" title="Restore — coming soon">
                        <lucide_react_1.RotateCcw className="h-3 w-3"/>
                        Restore
                      </button_1.Button>

                      {/* Download */}
                      {backup.status === "success" && (<button_1.Button variant="ghost" size="sm" onClick={() => void handleDownload(backup.id)} disabled={downloading === backup.id} className="h-8 gap-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                          {downloading === backup.id ? (<lucide_react_1.Loader2 className="h-3 w-3 animate-spin"/>) : (<lucide_react_1.Download className="h-3 w-3"/>)}
                          Download
                        </button_1.Button>)}
                    </div>
                  </div>))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (<div className="flex items-center justify-between border-t border-border px-6 py-3">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, total)} of {total} backups
                </p>
                <div className="flex items-center gap-1">
                  <button_1.Button variant="ghost" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8">
                    <lucide_react_1.ChevronLeft className="h-4 w-4"/>
                  </button_1.Button>
                  <span className="text-sm text-muted-foreground px-2">
                    {page} / {totalPages}
                  </span>
                  <button_1.Button variant="ghost" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8">
                    <lucide_react_1.ChevronRight className="h-4 w-4"/>
                  </button_1.Button>
                </div>
              </div>)}
          </div>)}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast}/>
    </>);
}
//# sourceMappingURL=page.js.map