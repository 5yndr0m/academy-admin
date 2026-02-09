'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, CreditCard, Banknote, ShieldAlert, BarChart, FileDown, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { StaffList } from "@/components/finance/StaffList";
import { PayrollTable } from "@/components/finance/PayrollTable";
import { PackageList } from "@/components/finance/PackageList";
import { AttendanceReport } from "@/components/finance/AttendanceReport";
import { mockDataService } from '@/lib/data';
import { Staff } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FinancePage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const { role } = useAuth();

    useEffect(() => {
        if (role !== 'Admin') return;
        const loadFinanceData = async () => {
            const staffData = await mockDataService.getStaff();
            setStaff(staffData);
        };
        loadFinanceData();
    }, [role]);

    if (role !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
                <ShieldAlert className="h-16 w-16 text-destructive animate-pulse" />
                <h1 className="text-2xl font-bold font-mono">ACCESS_DENIED</h1>
                <p className="text-muted-foreground max-w-xs">You do not have administrative privileges to access the financial module.</p>
                <Link href="/" className="text-primary hover:underline text-sm font-medium">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finance & Operations</h2>
                    <p className="text-muted-foreground">
                        Manage staff, payroll, statutory contributions, and class packages.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="staff" className="space-y-4">
                <TabsList className="bg-muted/60 p-1">
                    <TabsTrigger value="staff" className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Staff Management
                    </TabsTrigger>
                    <TabsTrigger value="payroll" className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" /> Payroll & Statutory
                    </TabsTrigger>
                    <TabsTrigger value="packages" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Class Packages
                    </TabsTrigger>
                    <TabsTrigger value="reports" className="flex items-center gap-2">
                        <BarChart className="h-4 w-4" /> Reporting Hub
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="staff" className="space-y-4">
                    <StaffList />
                </TabsContent>

                <TabsContent value="payroll" className="space-y-4">
                    <div className="bg-card border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold">Monthly Salary Summary</h3>
                                <p className="text-sm text-muted-foreground">Overview of net pay and statutory contributions (EPF/ETF).</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => alert('Generating Statutory EPF/ETF Report PDF...')}>
                                <FileDown className="mr-2 h-4 w-4" /> Export Statutory Report
                            </Button>
                        </div>
                        <PayrollTable staff={staff} />
                    </div>
                </TabsContent>

                <TabsContent value="packages" className="space-y-4">
                    <PackageList />
                </TabsContent>

                <TabsContent value="reports" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium italic underline">Revenue (Est)</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold font-mono">$12,450</div>
                                <p className="text-xs text-muted-foreground">+12% from last month</p>
                            </CardContent>
                        </Card>
                        {/* More stats if needed */}
                    </div>
                    <AttendanceReport />
                </TabsContent>
            </Tabs>
        </div>
    );
}
