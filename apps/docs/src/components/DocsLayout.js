"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsLayout = DocsLayout;
const react_1 = require("react");
const DocsSidebar_1 = require("./DocsSidebar");
const DocsHeader_1 = require("./DocsHeader");
function DocsLayout({ children, }) {
    const [sidebarOpen, setSidebarOpen] = (0, react_1.useState)(false);
    return (<div className="flex min-h-screen">
      <DocsSidebar_1.DocsSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
      <div className="flex min-w-0 flex-1 flex-col">
        <DocsHeader_1.DocsHeader onMenuClick={() => setSidebarOpen(true)}/>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-10">{children}</div>
        </main>
      </div>
    </div>);
}
//# sourceMappingURL=DocsLayout.js.map