"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsSidebar = DocsSidebar;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const navigation_2 = require("@/lib/navigation");
function DocsSidebar({ open, onClose, }) {
    const pathname = (0, navigation_1.usePathname)();
    return (<>
      {/* Mobile overlay */}
      {open && (<div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={onClose}/>)}

      <aside className={(0, utils_1.cn)("fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:sticky md:z-auto md:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <link_1.default href="/" className="flex items-center gap-2 font-semibold">
            <lucide_react_1.Database className="h-5 w-5 text-brand"/>
            <span>BackupHub Docs</span>
          </link_1.default>
          <button onClick={onClose} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent md:hidden" aria-label="Close sidebar">
            <lucide_react_1.X className="h-4 w-4"/>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navigation_2.docsNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (<li key={item.href}>
                  <link_1.default href={item.href} onClick={onClose} className={(0, utils_1.cn)("block rounded-md px-3 py-2 text-sm transition-colors", isActive
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground")}>
                    {item.title}
                  </link_1.default>
                </li>);
        })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-4 py-3">
          <link_1.default href="https://backuphub.threestack.io" className="text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground/70">
            backuphub.threestack.io
          </link_1.default>
        </div>
      </aside>
    </>);
}
//# sourceMappingURL=DocsSidebar.js.map