'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockDataService } from '@/lib/data';
import { AuditLog } from '@/types';
import { Clock, User, ShieldCheck, CreditCard, CalendarCheck2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActivityFeed() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLogs = async () => {
            const data = await mockDataService.getAuditLogs();
            setLogs(data.slice(0, 10)); // Show last 10
            setLoading(false);
        };
        loadLogs();
    }, []);

    const getCategoryIcon = (category: AuditLog['category']) => {
        switch (category) {
            case 'Billing': return <CreditCard className="h-3 w-3" />;
            case 'Attendance': return <CalendarCheck2 className="h-3 w-3" />;
            case 'Staff': return <ShieldCheck className="h-3 w-3" />;
            default: return <Activity className="h-3 w-3" />;
        }
    };

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="p-4 text-center text-xs text-muted-foreground">Loading activity...</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Recent Activity
                </CardTitle>
                <CardDescription>Live audit log of system operations.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-0 text-sm">
                    {logs.map((log, i) => (
                        <div key={log.id} className={cn(
                            "flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors border-b last:border-0",
                            i === 0 && "bg-primary/5"
                        )}>
                            <div className={cn(
                                "mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                                log.category === 'Billing' ? "bg-green-100 text-green-700" :
                                    log.category === 'Attendance' ? "bg-amber-100 text-amber-700" :
                                        "bg-blue-100 text-blue-700"
                            )}>
                                {getCategoryIcon(log.category)}
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="font-medium leading-none">{log.action}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1 font-mono uppercase bg-muted px-1 rounded">
                                        <User className="h-2.5 w-2.5" /> {log.user}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-2.5 w-2.5" /> {formatTimestamp(log.timestamp)}
                                    </span>
                                </div>
                            </div>
                            {i === 0 && (
                                <Badge variant="secondary" className="text-[10px] h-4 px-1 animate-pulse">New</Badge>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
