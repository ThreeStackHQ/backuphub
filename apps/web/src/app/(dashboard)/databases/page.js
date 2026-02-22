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
exports.default = DatabasesPage;
const React = __importStar(require("react"));
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const table_1 = require("@/components/ui/table");
const sheet_1 = require("@/components/ui/sheet");
const utils_1 = require("@/lib/utils");
const DEFAULT_PORTS = {
    postgres: "5432",
    mysql: "3306",
};
const EMPTY_FORM = {
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
function ToastContainer({ toasts, onRemove }) {
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
// ─── Page ────────────────────────────────────────────────────────────────────
function DatabasesPage() {
    const [databases, setDatabases] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [sheetOpen, setSheetOpen] = (0, react_1.useState)(false);
    const [editingDb, setEditingDb] = (0, react_1.useState)(null);
    const [form, setForm] = (0, react_1.useState)(EMPTY_FORM);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [testing, setTesting] = (0, react_1.useState)(null);
    const [deletingId, setDeletingId] = (0, react_1.useState)(null);
    const [toasts, setToasts] = (0, react_1.useState)([]);
    const [testingNew, setTestingNew] = (0, react_1.useState)(false);
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
    const fetchDatabases = (0, react_1.useCallback)(async () => {
        try {
            const res = await fetch("/api/databases");
            if (!res.ok)
                throw new Error("Failed to load databases");
            const data = (await res.json());
            setDatabases(data.databases ?? []);
        }
        catch {
            addToast("error", "Failed to load databases");
        }
        finally {
            setLoading(false);
        }
    }, [addToast]);
    (0, react_1.useEffect)(() => {
        void fetchDatabases();
    }, [fetchDatabases]);
    const openAdd = (0, react_1.useCallback)(() => {
        setEditingDb(null);
        setForm(EMPTY_FORM);
        setSheetOpen(true);
    }, []);
    const openEdit = (0, react_1.useCallback)((db) => {
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
    const handleTypeChange = (0, react_1.useCallback)((type) => {
        setForm((prev) => ({
            ...prev,
            type,
            port: prev.port === DEFAULT_PORTS[prev.type] ? DEFAULT_PORTS[type] : prev.port,
        }));
    }, []);
    const handleSave = (0, react_1.useCallback)(async () => {
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
            const body = {
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
                const err = (await res.json());
                throw new Error(err.error ?? "Failed to save database");
            }
            addToast("success", editingDb ? "Database updated" : "Database connected");
            setSheetOpen(false);
            await fetchDatabases();
        }
        catch (err) {
            addToast("error", err instanceof Error ? err.message : "Failed to save");
        }
        finally {
            setSaving(false);
        }
    }, [form, editingDb, addToast, fetchDatabases]);
    const handleDelete = (0, react_1.useCallback)(async (id) => {
        if (!confirm("Delete this database connection?"))
            return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/databases/${id}`, { method: "DELETE" });
            if (!res.ok)
                throw new Error("Failed to delete");
            addToast("success", "Database removed");
            setDatabases((prev) => prev.filter((d) => d.id !== id));
        }
        catch {
            addToast("error", "Failed to delete database");
        }
        finally {
            setDeletingId(null);
        }
    }, [addToast]);
    const handleTestExisting = (0, react_1.useCallback)(async (id) => {
        setTesting(id);
        try {
            const res = await fetch(`/api/databases/${id}/test`, { method: "POST" });
            const data = (await res.json());
            if (data.success) {
                addToast("success", data.message ?? "Connection successful");
            }
            else {
                addToast("error", data.error ?? "Connection failed");
            }
        }
        catch {
            addToast("error", "Connection test failed");
        }
        finally {
            setTesting(null);
        }
    }, [addToast]);
    const handleTestNew = (0, react_1.useCallback)(async () => {
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
                const err = (await saveRes.json());
                throw new Error(err.error ?? "Could not save for test");
            }
            const saved = (await saveRes.json());
            const testRes = await fetch(`/api/databases/${saved.database.id}/test`, {
                method: "POST",
            });
            const testData = (await testRes.json());
            // Clean up temp record
            await fetch(`/api/databases/${saved.database.id}`, { method: "DELETE" });
            if (testData.success) {
                addToast("success", testData.message ?? "Connection successful ✓");
            }
            else {
                addToast("error", testData.error ?? "Connection failed");
            }
        }
        catch (err) {
            addToast("error", err instanceof Error ? err.message : "Test failed");
        }
        finally {
            setTestingNew(false);
        }
    }, [form, addToast]);
    const formatDate = (dateStr) => {
        if (!dateStr)
            return "Never";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };
    return (<>
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
          <button_1.Button onClick={openAdd} className="gap-2">
            <lucide_react_1.Plus className="h-4 w-4"/>
            Connect Database
          </button_1.Button>
        </div>

        {/* Content */}
        {loading ? (<div className="flex items-center justify-center py-24">
            <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
          </div>) : databases.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 mb-4">
              <lucide_react_1.HardDrive className="h-7 w-7 text-blue-400"/>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Connect your first database
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Connect a PostgreSQL or MySQL database to start automating backups
              and tracking schema changes.
            </p>
            <button_1.Button onClick={openAdd} size="lg" className="gap-2">
              <lucide_react_1.Plus className="h-5 w-5"/>
              Connect Database
            </button_1.Button>
          </div>) : (
        /* Database table */
        <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table_1.Table>
              <table_1.TableHeader>
                <table_1.TableRow className="border-border hover:bg-transparent">
                  <table_1.TableHead>Name</table_1.TableHead>
                  <table_1.TableHead>Type</table_1.TableHead>
                  <table_1.TableHead>Host</table_1.TableHead>
                  <table_1.TableHead>Status</table_1.TableHead>
                  <table_1.TableHead>Last Backup</table_1.TableHead>
                  <table_1.TableHead className="text-right">Actions</table_1.TableHead>
                </table_1.TableRow>
              </table_1.TableHeader>
              <table_1.TableBody>
                {databases.map((db) => (<table_1.TableRow key={db.id} className="border-border">
                    <table_1.TableCell>
                      <div className="flex items-center gap-2">
                        <lucide_react_1.Database className="h-4 w-4 text-blue-400"/>
                        <span className="font-medium text-foreground">{db.name}</span>
                      </div>
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge variant="outline" className="capitalize text-xs">
                        {db.type}
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell className="text-muted-foreground font-mono text-xs">
                      {db.host}:{db.port}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <badge_1.Badge variant="warning">
                        <lucide_react_1.ServerCrash className="h-3 w-3 mr-1"/>
                        Unknown
                      </badge_1.Badge>
                    </table_1.TableCell>
                    <table_1.TableCell className="text-muted-foreground text-sm">
                      {formatDate(db.next_backup_at)}
                    </table_1.TableCell>
                    <table_1.TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <button_1.Button variant="ghost" size="sm" onClick={() => void handleTestExisting(db.id)} disabled={testing === db.id} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                          {testing === db.id ? (<lucide_react_1.Loader2 className="h-3 w-3 animate-spin"/>) : ("Test")}
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="icon" onClick={() => openEdit(db)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <lucide_react_1.Pencil className="h-4 w-4"/>
                          <span className="sr-only">Edit</span>
                        </button_1.Button>
                        <button_1.Button variant="ghost" size="icon" onClick={() => void handleDelete(db.id)} disabled={deletingId === db.id} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          {deletingId === db.id ? (<lucide_react_1.Loader2 className="h-3 w-3 animate-spin"/>) : (<lucide_react_1.Trash2 className="h-4 w-4"/>)}
                          <span className="sr-only">Delete</span>
                        </button_1.Button>
                      </div>
                    </table_1.TableCell>
                  </table_1.TableRow>))}
              </table_1.TableBody>
            </table_1.Table>
          </div>)}
      </div>

      {/* Connection Form Sheet */}
      <sheet_1.Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <sheet_1.SheetContent side="right" className="w-[440px] sm:max-w-[440px] overflow-y-auto">
          <sheet_1.SheetHeader className="mb-6">
            <sheet_1.SheetTitle>
              {editingDb ? "Edit Database" : "Connect Database"}
            </sheet_1.SheetTitle>
          </sheet_1.SheetHeader>

          <div className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <label_1.Label htmlFor="db-name">Connection Name *</label_1.Label>
              <input_1.Input id="db-name" placeholder="My Production DB" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}/>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <label_1.Label>Database Type *</label_1.Label>
              <div className="flex gap-2">
                {["postgres", "mysql"].map((t) => (<button key={t} type="button" onClick={() => handleTypeChange(t)} className={(0, utils_1.cn)("flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors", form.type === t
                ? "border-blue-500 bg-blue-500/10 text-blue-400"
                : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground")}>
                    {t === "postgres" ? "PostgreSQL" : "MySQL"}
                  </button>))}
              </div>
            </div>

            {/* Host + Port */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-2">
                <label_1.Label htmlFor="db-host">Host *</label_1.Label>
                <input_1.Input id="db-host" placeholder="localhost" value={form.host} onChange={(e) => setForm((p) => ({ ...p, host: e.target.value }))}/>
              </div>
              <div className="space-y-2">
                <label_1.Label htmlFor="db-port">Port *</label_1.Label>
                <input_1.Input id="db-port" type="number" placeholder="5432" value={form.port} onChange={(e) => setForm((p) => ({ ...p, port: e.target.value }))}/>
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label_1.Label htmlFor="db-username">Username *</label_1.Label>
              <input_1.Input id="db-username" placeholder="postgres" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}/>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label_1.Label htmlFor="db-password">
                Password {editingDb ? "(leave blank to keep current)" : "*"}
              </label_1.Label>
              <input_1.Input id="db-password" type="password" placeholder={editingDb ? "••••••••" : "Enter password"} value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}/>
            </div>

            {/* Database Name */}
            <div className="space-y-2">
              <label_1.Label htmlFor="db-dbname">Database Name *</label_1.Label>
              <input_1.Input id="db-dbname" placeholder="myapp" value={form.database_name} onChange={(e) => setForm((p) => ({ ...p, database_name: e.target.value }))}/>
            </div>

            {/* SSL */}
            <div className="flex items-center gap-3 py-1">
              <input id="db-ssl" type="checkbox" checked={form.ssl} onChange={(e) => setForm((p) => ({ ...p, ssl: e.target.checked }))} className="h-4 w-4 rounded border-border accent-blue-500"/>
              <label_1.Label htmlFor="db-ssl" className="cursor-pointer">
                Use SSL/TLS
              </label_1.Label>
            </div>

            {/* Test Connection (for new connections) */}
            {!editingDb && (<button_1.Button type="button" variant="outline" onClick={() => void handleTestNew()} disabled={testingNew} className="w-full gap-2">
                {testingNew ? (<>
                    <lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>
                    Testing connection...
                  </>) : ("Test Connection")}
              </button_1.Button>)}
          </div>

          <sheet_1.SheetFooter className="mt-6 flex-row gap-2">
            <sheet_1.SheetClose asChild>
              <button_1.Button variant="outline" className="flex-1">
                Cancel
              </button_1.Button>
            </sheet_1.SheetClose>
            <button_1.Button onClick={() => void handleSave()} disabled={saving} className="flex-1 gap-2">
              {saving ? (<>
                  <lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/>
                  Saving...
                </>) : editingDb ? ("Save Changes") : ("Connect")}
            </button_1.Button>
          </sheet_1.SheetFooter>
        </sheet_1.SheetContent>
      </sheet_1.Sheet>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast}/>
    </>);
}
//# sourceMappingURL=page.js.map