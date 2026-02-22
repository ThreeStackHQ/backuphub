"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HomePage;
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("@/lib/navigation");
function HomePage() {
    return (<div className="flex min-h-screen flex-col items-center justify-center px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-6 flex justify-center">
          <lucide_react_1.Database className="h-12 w-12 text-brand"/>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          BackupHub Documentation
        </h1>
        <p className="mb-10 text-lg text-muted-foreground">
          Learn how to set up automated database backups, manage connections, and
          restore your data with confidence.
        </p>
        <link_1.default href="/docs/getting-started" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Get Started
          <lucide_react_1.ArrowRight className="h-4 w-4"/>
        </link_1.default>
      </div>

      <div className="mx-auto mt-16 grid max-w-3xl gap-4 sm:grid-cols-2">
        {navigation_1.docsNavigation.map((item) => (<link_1.default key={item.href} href={item.href} className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent">
            <h2 className="mb-2 font-semibold group-hover:text-primary">
              {item.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          </link_1.default>))}
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map