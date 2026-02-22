"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeToggle = ThemeToggle;
const lucide_react_1 = require("lucide-react");
const next_themes_1 = require("next-themes");
function ThemeToggle() {
    const { setTheme, theme } = (0, next_themes_1.useTheme)();
    return (<button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground" aria-label="Toggle theme">
      <lucide_react_1.Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"/>
      <lucide_react_1.Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"/>
    </button>);
}
//# sourceMappingURL=theme-toggle.js.map