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
exports.TopHeader = TopHeader;
const React = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const avatar_1 = require("@/components/ui/avatar");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const button_1 = require("@/components/ui/button");
const theme_toggle_1 = require("@/components/theme-toggle");
function TopHeader({ workspaceName = "My Workspace", onMobileMenuOpen, }) {
    return (<header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button_1.Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onMobileMenuOpen} aria-label="Open menu">
          <lucide_react_1.Menu className="h-4 w-4"/>
        </button_1.Button>

        {/* Workspace name */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {workspaceName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <theme_toggle_1.ThemeToggle />

        {/* User menu */}
        <dropdown_menu_1.DropdownMenu>
          <dropdown_menu_1.DropdownMenuTrigger asChild>
            <button_1.Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User menu">
              <avatar_1.Avatar className="h-8 w-8">
                <avatar_1.AvatarImage src="/avatar.png" alt="User avatar"/>
                <avatar_1.AvatarFallback className="bg-brand/20 text-brand text-xs font-semibold">
                  U
                </avatar_1.AvatarFallback>
              </avatar_1.Avatar>
            </button_1.Button>
          </dropdown_menu_1.DropdownMenuTrigger>

          <dropdown_menu_1.DropdownMenuContent className="w-56" align="end" forceMount>
            <dropdown_menu_1.DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">User</p>
                <p className="text-xs leading-none text-muted-foreground">
                  user@example.com
                </p>
              </div>
            </dropdown_menu_1.DropdownMenuLabel>
            <dropdown_menu_1.DropdownMenuSeparator />
            <dropdown_menu_1.DropdownMenuGroup>
              <dropdown_menu_1.DropdownMenuItem>
                <lucide_react_1.Settings className="mr-2 h-4 w-4"/>
                <span>Settings</span>
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuGroup>
            <dropdown_menu_1.DropdownMenuSeparator />
            <dropdown_menu_1.DropdownMenuItem className="text-destructive focus:text-destructive">
              <lucide_react_1.LogOut className="mr-2 h-4 w-4"/>
              <span>Sign out</span>
            </dropdown_menu_1.DropdownMenuItem>
          </dropdown_menu_1.DropdownMenuContent>
        </dropdown_menu_1.DropdownMenu>
      </div>
    </header>);
}
//# sourceMappingURL=top-header.js.map