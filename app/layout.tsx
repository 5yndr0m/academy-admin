import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Academy Admin",
  description: "Educational Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {/* 
                We need a wrapper to conditionally render Sidebar/Topbar 
                Because login page doesn't need them.
                However, for simplicity in this task, we'll let AuthProvider handle redirect
                and we can use a client component wrapper or css to hide sidebar on login.
                Actually, let's keep it simple: Render Sidebar/Topbar, but 
                they will be empty/hidden if on login page via CSS or logic? 
                Better: Make a LayoutClient component.
            */}
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

// Simple internal wrapper to handle conditional rendering if needed
// or just standard layout.
// For now, let's just render standard layout. 
// Ideally, Login page should be outside the Sidebar layout.
// Let's do a quick check in a separate client component or just inline it here differently.
// Actually, Next.js Layouts nest. 
// A better approach for this project structure:
// app/login/page.tsx
// app/(authenticated)/layout.tsx -> Sidebar + Topbar
// app/(authenticated)/page.tsx ...
// But refactoring folders now might be risky/messy.
// Let's use a LayoutClient wrapper that checks pathname.

import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <LayoutWrapper>
      {children}
    </LayoutWrapper>
  );
}
