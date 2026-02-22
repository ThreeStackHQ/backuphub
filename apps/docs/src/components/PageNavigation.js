"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageNavigation = PageNavigation;
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const navigation_2 = require("@/lib/navigation");
function PageNavigation() {
    const pathname = (0, navigation_1.usePathname)();
    const currentIndex = navigation_2.docsNavigation.findIndex((item) => item.href === pathname);
    if (currentIndex === -1)
        return null;
    const prev = currentIndex > 0 ? navigation_2.docsNavigation[currentIndex - 1] : null;
    const next = currentIndex < navigation_2.docsNavigation.length - 1
        ? navigation_2.docsNavigation[currentIndex + 1]
        : null;
    return (<nav className="mt-12 flex items-center justify-between border-t border-border pt-6">
      {prev ? (<link_1.default href={prev.href} className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <lucide_react_1.ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"/>
          <span>{prev.title}</span>
        </link_1.default>) : (<div />)}
      {next ? (<link_1.default href={next.href} className="group flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <span>{next.title}</span>
          <lucide_react_1.ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5"/>
        </link_1.default>) : (<div />)}
    </nav>);
}
//# sourceMappingURL=PageNavigation.js.map