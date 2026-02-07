'use client';

import { useEffect, useState } from 'react';

export function Topbar() {
    const [currentDate, setCurrentDate] = useState<string>('');

    useEffect(() => {
        const date = new Date();
        setCurrentDate(date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
    }, []);

    return (
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Breadcrumb replacement for now */}
                <span className="text-slate-500 text-sm font-medium">Welcome back, Admin</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500 font-medium">{currentDate}</span>
            </div>
        </header>
    );
}
