'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const data = [
    { label: 'Standard Monthly', value: 65, color: 'bg-blue-500' },
    { label: 'Intensive Monthly', value: 25, color: 'bg-indigo-500' },
    { label: 'Other', value: 10, color: 'bg-slate-300' },
];

export function RevenueBreakdown() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                <CardDescription>Distribution of income by class package.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex h-4 w-full rounded-full overflow-hidden mb-6">
                    {data.map((item, i) => (
                        <div
                            key={i}
                            className={cn("h-full transition-all hover:opacity-80", item.color)}
                            style={{ width: `${item.value}%` }}
                            title={`${item.label}: ${item.value}%`}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {data.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={cn("h-3 w-3 rounded-sm", item.color)} />
                            <span className="text-xs font-medium">{item.label}</span>
                            <span className="text-xs text-muted-foreground ml-auto">{item.value}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
