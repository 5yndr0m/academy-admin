'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut } from "lucide-react";

export function Topbar() {
    const [currentDate, setCurrentDate] = useState<string>('');
    const { user, logout } = useAuth();

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
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px] justify-between">
            <div className="flex items-center gap-2 font-medium">
                {currentDate}
            </div>

            <div className="flex items-center gap-4">
                <div className="text-sm font-medium hidden sm:block">
                    Welcome, {user}
                </div>
                <ModeToggle />
                <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
