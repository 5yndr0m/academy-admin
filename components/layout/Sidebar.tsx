'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Presentation,
    Users,
    User,
    CalendarDays
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Classrooms', href: '/classrooms', icon: Presentation },
    { name: 'Teachers', href: '/teachers', icon: User },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: CalendarDays },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <div className={cn("flex flex-col h-full", className)}>
            <div className="p-6">
                <h1 className="text-2xl font-bold tracking-tight">Academy</h1>
                <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                        AD
                    </div>
                    <div className="text-sm">
                        <p className="font-medium">Administrator</p>
                        <p className="text-xs text-muted-foreground">Log out</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
