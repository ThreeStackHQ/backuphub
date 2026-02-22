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
exports.MobileSidebar = MobileSidebar;
const React = __importStar(require("react"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
const sheet_1 = require("@/components/ui/sheet");
const navItems = [
    { label: "Databases", href: "/databases", icon: lucide_react_1.Database },
    { label: "Backups", href: "/backups", icon: lucide_react_1.Archive },
    { label: "Schema Diff", href: "/schema-diff", icon: lucide_react_1.GitCompare },
    { label: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
function MobileSidebar({ open, onClose, }) {
    const pathname = (0, navigation_1.usePathname)();
    return (<sheet_1.Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <sheet_1.SheetContent side="left" className="w-[280px] bg-sidebar p-0">
        <sheet_1.SheetHeader className="flex h-14 flex-row items-center gap-2 border-b border-sidebar-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand">
            <lucide_react_1.HardDrive className="h-4 w-4 text-white"/>
          </div>
          <sheet_1.SheetTitle className="text-sm font-semibold text-sidebar-foreground">
            BackupHub
          </sheet_1.SheetTitle>
        </sheet_1.SheetHeader>

        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (<link_1.default key={item.href} href={item.href} onClick={onClose} className={(0, utils_1.cn)("flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors", isActive
                    ? "bg-brand/20 text-brand font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                <Icon className="h-4 w-4 shrink-0"/>
                <span>{item.label}</span>
              </link_1.default>);
        })}
        </nav>
      </sheet_1.SheetContent>
    </sheet_1.Sheet>);
}
//# sourceMappingURL=mobile-sidebar.js.map