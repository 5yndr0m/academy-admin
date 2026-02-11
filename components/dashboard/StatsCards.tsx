'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, School, DollarSign, AlertCircle } from "lucide-react";

interface StatsCardsProps {
    stats: {
        students: number;
        teachers: number;
        classroomsTotal: number;
        classroomsInUse: number;
        monthlyCollections: number;
        totalOutstanding: number;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Collections</CardTitle>
                    <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-700">${stats.monthlyCollections.toLocaleString()}</div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">MTD Actuals</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-red-700">${stats.totalOutstanding.toLocaleString()}</div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Awaiting Payment</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium italic">Enrolled Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.students}</div>
                    <p className="text-xs text-muted-foreground">Total across academy</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Staff & Rooms</CardTitle>
                    <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.teachers} / {stats.classroomsTotal}</div>
                    <p className="text-xs text-muted-foreground">Teachers / Rooms total</p>
                </CardContent>
            </Card>
        </div>
    );
}
