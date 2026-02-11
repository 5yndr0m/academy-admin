'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueBreakdown } from "@/components/finance/RevenueBreakdown";
import { DollarSign, TrendingUp, AlertCircle, Calendar } from 'lucide-react';

export function DashboardFinanceSummary() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MTD Collections</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">$12,450</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">15.2% vs last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">$3,120</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">24 invoices outstanding</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projected Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">$18,900</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Based on active enrollments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Next Payroll Run</CardTitle>
                        <Calendar className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">Feb 28</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Estimated: $9,400</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueBreakdown />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                            <CardDescription>Financial shortcuts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <p className="text-xs text-muted-foreground mb-1">Billing Operations</p>
                                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm border flex items-center justify-between group">
                                    <span>Run Monthly Billing</span>
                                    <span className="text-[10px] font-mono bg-muted px-1.5 rounded group-hover:bg-background">Alt+B</span>
                                </button>
                                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm border flex items-center justify-between group">
                                    <span>Generate Tax Reports</span>
                                    <span className="text-[10px] font-mono bg-muted px-1.5 rounded group-hover:bg-background">Alt+T</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
