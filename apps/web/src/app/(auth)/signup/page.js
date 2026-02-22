"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SignupPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const react_2 = require("next-auth/react");
const link_1 = __importDefault(require("next/link"));
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function SignupPage() {
    const router = (0, navigation_1.useRouter)();
    const [name, setName] = (0, react_1.useState)('');
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // Create account
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Failed to create account');
                return;
            }
            // Auto sign-in after signup
            const result = await (0, react_2.signIn)('credentials', {
                email,
                password,
                redirect: false,
            });
            if (result?.error) {
                setError('Account created but sign-in failed. Please sign in manually.');
                router.push('/login');
            }
            else {
                router.push('/dashboard');
                router.refresh();
            }
        }
        catch {
            setError('Something went wrong. Please try again.');
        }
        finally {
            setLoading(false);
        }
    }
    return (<div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-card p-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <lucide_react_1.Database className="h-7 w-7 text-blue-500"/>
            <span className="text-2xl font-bold tracking-tight text-foreground">BackupHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Create your account — free forever
          </p>
        </div>

        {/* Error */}
        {error && (<div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive border border-destructive/20">
            {error}
          </div>)}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Full name
            </label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required autoComplete="name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"/>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"/>
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"/>
          </div>

          <button_1.Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Creating account...' : 'Create account'}
          </button_1.Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <link_1.default href="/login" className="font-medium text-blue-500 hover:text-blue-400 underline underline-offset-4">
            Sign in
          </link_1.default>
        </p>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map