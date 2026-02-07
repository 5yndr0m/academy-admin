'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2 sticky top-0">
                    <Sidebar />
                </div>
            </div>
            <div className="flex flex-col min-w-0">
                <Topbar />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-slate-50 dark:bg-background overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
