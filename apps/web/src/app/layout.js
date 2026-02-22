"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const google_1 = require("next/font/google");
const react_1 = require("next-auth/react");
const theme_provider_1 = require("@/components/theme-provider");
require("./globals.css");
const inter = (0, google_1.Inter)({ subsets: ['latin'] });
exports.metadata = {
    title: {
        template: '%s | BackupHub',
        default: 'BackupHub',
    },
    description: 'Database backup management platform',
};
function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <react_1.SessionProvider>
          <theme_provider_1.ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
          </theme_provider_1.ThemeProvider>
        </react_1.SessionProvider>
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map