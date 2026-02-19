"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Database,
  Trash2,
  Pencil,
  Loader2,
  CheckCircle2,
  XCircle,
  ServerCrash,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DatabaseRecord {
  id: string;
  name: string;
  type: "postgres" | "mysql";
  host: string;
  port: number;
  username: string;
  database_name: string;
  ssl: boolean;
  schedule_cron: string | null;
  retention_days: number;
  next_backup_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FormState {
  name: string;
  type: "postgres" | "mysql";
  host: string;
  port: string;
  username: string;
  password: string;
  database_name: string;
  ssl: boolean;
}

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

const DEFAULT_PORTS: Record<"postgres" | "mysql", string> = {
  postgres: "5432",
  mysql: "3306",
};

const EMPTY_FORM: FormState = {
  name: "",
  type: "postgres",
  host: "",
  port: "5432",
  username: "",
  password: "",
  database_name: "",
  ssl: false,
};

// ─── Toast ───────────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }): React.JSX.Element {
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DatabasesPage(): React.JSX.Element {
  const [databases, setDatabases] = useState<DatabaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingDb, setEditingDb] = useState<DatabaseRecord | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [testingNew, setTestingNew] = useState(false);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchDatabases = useCallback(async () => {
    try {
      const res = await fetch("/api/databases");
      if (!res.ok) throw new Error("Failed to load databases");
      const data = (await res.json()) as { databases: DatabaseRecord[] };
      setDatabases(data.databases ?? []);
    } catch {
      addToast("error", "Failed to load databases");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void fetchDatabases();
  }, [fetchDatabases]);

  const openAdd = useCallback(() => {
    setEditingDb(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback((db: DatabaseRecord) => {
    setEditingDb(db);
    setForm({
      name: db.name,
      type: db.type,
      host: db.host,
      port: String(db.port),
      username: db.username,
      password: "",
      database_name: db.database_name,
      ssl: db.ssl,
    });
    setSheetOpen(true);
  }, []);

  const handleTypeChange = useCallback((type: "postgres" | "mysql") => {
    setForm((prev) => ({
      ...prev,
      type,
      port: prev.port === DEFAULT_PORTS[prev.type] ? DEFAULT_PORTS[type] : prev.port,
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.name || !form.host || !form.username || !form.database_name) {
      addToast("error", "Please fill in all required fields");
      return;
    }
    if (!editingDb && !form.password) {
      addToast("error", "Password is required");
      return;
    }
    setSaving(true);
    try {
      const url = editingDb
        ? `/api/databases/${editingDb.id}`
        : "/api/databases";
      const method = editingDb ? "PATCH" : "POST";
      const body: Record<string, unknown> = {
        name: form.name,
        type: form.type,
        host: form.host,
        port: parseInt(form.port, 10),
        username: form.username,
        database_name: form.database_name,
        ssl: form.ssl,
      };
      if (!editingDb || form.password) {
        body.password = form.password;
      }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Failed to save database");
      }
      addToast("success", editingDb ? "Database updated" : "Database connected");
      setSheetOpen(false);
      await fetchDatabases();
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }, [form, editingDb, addToast, fetchDatabases]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Delete this database connection?")) return;
      setDeletingId(id);
      try {
        const res = await fetch(`/api/databases/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        addToast("success", "Database removed");
        setDatabases((prev) => prev.filter((d) => d.id !== id));
      } catch {
        addToast("error", "Failed to delete database");
      } finally {
        setDeletingId(null);
      }
    },
    [addToast]
  );

  const handleTestExisting = useCallback(
    async (id: string) => {
      setTesting(id);
      try {
        const res = await fetch(`/api/databases/${id}/test`, { method: "POST" });
        const data = (await res.json()) as { success: boolean; message?: string; error?: string };
        if (data.success) {
          addToast("success", data.message ?? "Connection successful");
        } else {
          addToast("error", data.error ?? "Connection failed");
        }
      } catch {
        addToast("error", "Connection test failed");
      } finally {
        setTesting(null);
      }
    },
    [addToast]
  );

  const handleTestNew = useCallback(async () => {
    // For new connections, we save first then test, or we can do a lightweight check
    // Since we don't have a saved ID yet, just validate fields
    if (!form.host || !form.port || !form.username || !form.password || !form.database_name) {
      addToast("error", "Fill in all connection fields first");
      return;
    }
    setTestingNew(true);
    // Save temporarily, test, then allow user to confirm save
    try {
      const saveRes = await fetch("/api/databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name || `${form.type}-test`,
          type: form.type,
          host: form.host,
          port: parseInt(form.port, 10),
          username: form.username,
          password: form.password,
          database_name: form.database_name,
          ssl: form.ssl,
        }),
      });
      if (!saveRes.ok) {
        const err = (await saveRes.json()) as { error?: string };
        throw new Error(err.error ?? "Could not save for test");
      }
      const saved = (await saveRes.json()) as { database: { id: string } };
      const testRes = await fetch(`/api/databases/${saved.database.id}/test`, {
        method: "POST",
      });
      const testData = (await testRes.json()) as { success: boolean; message?: string; error?: string };
      // Clean up temp record
      await fetch(`/api/databases/${saved.database.id}`, { method: "DELETE" });
      if (testData.success) {
        addToast("success", testData.message ?? "Connection successful ✓");
      } else {
        addToast("error", testData.error ?? "Connection failed");
      }
    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Test failed");
    } finally {
      setTestingNew(false);
    }
  }, [form, addToast]);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Databases
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your connected databases and backup schedules
            </p>
          </div>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Connect Database
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : databases.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 mb-4">
              <HardDrive className="h-7 w-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Connect your first database
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Connect a PostgreSQL or MySQL database to start automating backups
              and tracking schema changes.
            </p>
            <Button onClick={openAdd} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Connect Database
            </Button>
          </div>
        ) : (
          /* Database table */
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Backup</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {databases.map((db) => (
                  <TableRow key={db.id} className="border-border">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-400" />
                        <span className="font-medium text-foreground">{db.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {db.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {db.host}:{db.port}
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">
                        <ServerCrash className="h-3 w-3 mr-1" />
                        Unknown
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(db.next_backup_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void handleTestExisting(db.id)}
                          disabled={testing === db.id}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                          {testing === db.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Test"
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(db)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void handleDelete(db.id)}
                          disabled={deletingId === db.id}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          {deletingId === db.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Connection Form Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[440px] sm:max-w-[440px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>
              {editingDb ? "Edit Database" : "Connect Database"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="db-name">Connection Name *</Label>
              <Input
                id="db-name"
                placeholder="My Production DB"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Database Type *</Label>
              <div className="flex gap-2">
                {(["postgres", "mysql"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={cn(
                      "flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                      form.type === t
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
                    )}
                  >
                    {t === "postgres" ? "PostgreSQL" : "MySQL"}
                  </button>
                ))}
              </div>
            </div>

            {/* Host + Port */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="db-host">Host *</Label>
                <Input
                  id="db-host"
                  placeholder="localhost"
                  value={form.host}
                  onChange={(e) => setForm((p) => ({ ...p, host: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="db-port">Port *</Label>
                <Input
                  id="db-port"
                  type="number"
                  placeholder="5432"
                  value={form.port}
                  onChange={(e) => setForm((p) => ({ ...p, port: e.target.value }))}
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="db-username">Username *</Label>
              <Input
                id="db-username"
                placeholder="postgres"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="db-password">
                Password {editingDb ? "(leave blank to keep current)" : "*"}
              </Label>
              <Input
                id="db-password"
                type="password"
                placeholder={editingDb ? "••••••••" : "Enter password"}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
            </div>

            {/* Database Name */}
            <div className="space-y-2">
              <Label htmlFor="db-dbname">Database Name *</Label>
              <Input
                id="db-dbname"
                placeholder="myapp"
                value={form.database_name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, database_name: e.target.value }))
                }
              />
            </div>

            {/* SSL */}
            <div className="flex items-center gap-3 py-1">
              <input
                id="db-ssl"
                type="checkbox"
                checked={form.ssl}
                onChange={(e) => setForm((p) => ({ ...p, ssl: e.target.checked }))}
                className="h-4 w-4 rounded border-border accent-blue-500"
              />
              <Label htmlFor="db-ssl" className="cursor-pointer">
                Use SSL/TLS
              </Label>
            </div>

            {/* Test Connection (for new connections) */}
            {!editingDb && (
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleTestNew()}
                disabled={testingNew}
                className="w-full gap-2"
              >
                {testingNew ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Testing connection...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
            )}
          </div>

          <SheetFooter className="mt-6 flex-row gap-2">
            <SheetClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </SheetClose>
            <Button
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex-1 gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingDb ? (
                "Save Changes"
              ) : (
                "Connect"
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
