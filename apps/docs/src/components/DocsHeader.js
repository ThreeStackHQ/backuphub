"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsHeader = DocsHeader;
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const theme_toggle_1 = require("./theme-toggle");
function DocsHeader({ onMenuClick }) {
    return (<header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <button onClick={onMenuClick} className="mr-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent md:hidden" aria-label="Open menu">
        <lucide_react_1.Menu className="h-4 w-4"/>
      </button>

      <link_1.default href="/" className="flex items-center gap-2 font-semibold md:hidden">
        <lucide_react_1.Database className="h-5 w-5 text-brand"/>
        <span>BackupHub Docs</span>
      </link_1.default>

      <div className="ml-auto flex items-center gap-3">
        <link_1.default href="https://backuphub.threestack.io" className="text-sm text-muted-foreground hover:text-foreground">
          Dashboard
        </link_1.default>
        <theme_toggle_1.ThemeToggle />
      </div>
    </header>);
}
//# sourceMappingURL=DocsHeader.js.map