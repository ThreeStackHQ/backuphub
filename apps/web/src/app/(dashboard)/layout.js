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
exports.default = DashboardLayout;
const React = __importStar(require("react"));
const react_1 = require("react");
const app_sidebar_1 = require("@/components/sidebar/app-sidebar");
const mobile_sidebar_1 = require("@/components/sidebar/mobile-sidebar");
const top_header_1 = require("@/components/header/top-header");
function DashboardLayout({ children, }) {
    const [collapsed, setCollapsed] = (0, react_1.useState)(false);
    const [mobileOpen, setMobileOpen] = (0, react_1.useState)(false);
    return (<div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <app_sidebar_1.AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)}/>
      </div>

      {/* Mobile sidebar (Sheet) */}
      <mobile_sidebar_1.MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)}/>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <top_header_1.TopHeader workspaceName="My Workspace" onMobileMenuOpen={() => setMobileOpen(true)}/>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>);
}
//# sourceMappingURL=layout.js.map