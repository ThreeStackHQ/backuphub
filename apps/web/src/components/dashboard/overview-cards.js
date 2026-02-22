"use strict";
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
exports.OverviewCards = OverviewCards;
exports.SectionHeader = SectionHeader;
const React = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/lib/utils");
function StatCard({ title, value, description, icon: Icon, }) {
    return (<div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
          <Icon className="h-4 w-4 text-brand"/>
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        {description && (<p className="mt-1 text-xs text-muted-foreground">{description}</p>)}
      </div>
    </div>);
}
function OverviewCards() {
    const stats = [
        {
            title: "Total Databases",
            value: "0",
            description: "No databases connected yet",
            icon: lucide_react_1.Database,
        },
        {
            title: "Total Backups",
            value: "0",
            description: "No backups taken yet",
            icon: lucide_react_1.Archive,
        },
        {
            title: "Last Backup",
            value: "—",
            description: "No backups taken yet",
            icon: lucide_react_1.Clock,
        },
        {
            title: "Storage Used",
            value: "0 B",
            description: "Across all databases",
            icon: lucide_react_1.HardDrive,
        },
    ];
    return (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (<StatCard key={stat.title} {...stat}/>))}
    </div>);
}
function SectionHeader({ title, description, children, }) {
    return (<div className={(0, utils_1.cn)("flex items-start justify-between")}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (<p className="mt-0.5 text-sm text-muted-foreground">{description}</p>)}
      </div>
      {children}
    </div>);
}
//# sourceMappingURL=overview-cards.js.map