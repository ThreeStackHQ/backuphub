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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSidebar = AppSidebar;
const React = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const button_1 = require("@/components/ui/button");
const tooltip_1 = require("@/components/ui/tooltip");
const separator_1 = require("@/components/ui/separator");
const navItems = [
    {
        label: "Databases",
        href: "/databases",
        icon: lucide_react_1.Database,
    },
    {
        label: "Backups",
        href: "/backups",
        icon: lucide_react_1.Archive,
    },
    {
        label: "Schema Diff",
        href: "/schema-diff",
        icon: lucide_react_1.GitCompare,
    },
    {
        label: "Settings",
        href: "/settings",
        icon: lucide_react_1.Settings,
    },
];
function AppSidebar({ collapsed, onToggle, }) {
    const pathname = (0, navigation_1.usePathname)();
    return (<tooltip_1.TooltipProvider delayDuration={0}>
      <aside className={(0, utils_1.cn)("flex h-full flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300", collapsed ? "w-[60px]" : "w-[240px]")}>
        {/* Logo / Brand */}
        <div className={(0, utils_1.cn)("flex h-14 items-center border-b border-sidebar-border px-3", collapsed ? "justify-center" : "gap-2 px-4")}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand">
            <lucide_react_1.HardDrive className="h-4 w-4 text-white"/>
          </div>
          {!collapsed && (<span className="text-sm font-semibold text-sidebar-foreground">
              BackupHub
            </span>)}
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            if (collapsed) {
                return (<tooltip_1.Tooltip key={item.href}>
                  <tooltip_1.TooltipTrigger asChild>
                    <link_1.default href={item.href} className={(0, utils_1.cn)("flex h-9 w-9 items-center justify-center rounded-md transition-colors", isActive
                        ? "bg-brand/20 text-brand"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                      <Icon className="h-4 w-4"/>
                      <span className="sr-only">{item.label}</span>
                    </link_1.default>
                  </tooltip_1.TooltipTrigger>
                  <tooltip_1.TooltipContent side="right">{item.label}</tooltip_1.TooltipContent>
                </tooltip_1.Tooltip>);
            }
            return (<link_1.default key={item.href} href={item.href} className={(0, utils_1.cn)("flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors", isActive
                    ? "bg-brand/20 text-brand font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                <Icon className="h-4 w-4 shrink-0"/>
                <span>{item.label}</span>
              </link_1.default>);
        })}
        </nav>

        {/* Separator + Collapse toggle */}
        <div className="p-2">
          <separator_1.Separator className="mb-2 bg-sidebar-border"/>
          <button_1.Button variant="ghost" size="icon" onClick={onToggle} className={(0, utils_1.cn)("h-9 w-full text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground", collapsed ? "w-9" : "justify-end px-2")} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? (<lucide_react_1.ChevronRight className="h-4 w-4"/>) : (<>
                <span className="mr-1 text-xs">Collapse</span>
                <lucide_react_1.ChevronLeft className="h-4 w-4"/>
              </>)}
          </button_1.Button>
        </div>
      </aside>
    </tooltip_1.TooltipProvider>);
}
//# sourceMappingURL=app-sidebar.js.map