'use client';

import { useState, useEffect } from 'react';
import { Users, ShieldAlert, BarChart3, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffList } from "@/components/finance/StaffList";
import { AttendanceReport } from "@/components/finance/AttendanceReport";
import { mockDataService } from '@/lib/data';
import { Staff } from '@/types';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';

export default function OperationsPage() {
    const { role } = useAuth();

    if (role !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
                <ShieldAlert className="h-16 w-16 text-destructive animate-pulse" />
                <h1 className="text-2xl font-bold font-mono">ACCESS_DENIED</h1>
                <p className="text-muted-foreground max-w-xs">You do not have administrative privileges to access the operational module.</p>
                <Link href="/" className="text-primary hover:underline text-sm font-medium">Return to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Institutional Operations</h2>
                    <p className="text-muted-foreground">
                        Manage staff members and monitor classroom attendance performance.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="staff" className="space-y-4">
                <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
                    <TabsList className="bg-muted/60 p-1 inline-flex w-full justify-start md:w-fit">
                        <TabsTrigger value="staff" className="flex items-center gap-2 whitespace-nowrap">
                            <Users className="h-4 w-4" /> Staff Management
                        </TabsTrigger>
                        <TabsTrigger value="attendance" className="flex items-center gap-2 whitespace-nowrap">
                            <BarChart3 className="h-4 w-4" /> Attendance Insights
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex items-center gap-2 whitespace-nowrap">
                            <Settings className="h-4 w-4" /> System Settings
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="staff" className="space-y-4">
                    <StaffList />
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                    <AttendanceReport />
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <div className="border rounded-lg p-12 text-center bg-muted/20">
                        <p className="text-muted-foreground italic text-sm">System configuration modules coming soon...</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
