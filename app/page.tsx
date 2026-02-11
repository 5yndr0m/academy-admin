'use client';

import { useEffect, useState } from 'react';
import { StatsCards } from "@/components/dashboard/StatsCards";
import { UpcomingClasses } from "@/components/dashboard/UpcomingClasses";
import { ClassroomStatusGrid } from "@/components/dashboard/ClassroomStatusGrid";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { mockDataService } from '@/lib/data';
import { Classroom } from '@/types';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeekTimetable } from "@/components/dashboard/WeekTimetable";

export default function Home() {
    const [stats, setStats] = useState({
        students: 0,
        teachers: 0,
        classroomsTotal: 0,
        classroomsInUse: 0,
        monthlyCollections: 0,
        totalOutstanding: 0
    });
    const [schedule, setSchedule] = useState<any[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            const [statsData, scheduleData, classroomsData] = await Promise.all([
                mockDataService.getDashboardStats(),
                mockDataService.getTodaySchedule(),
                mockDataService.getClassrooms(),
            ]);

            // Augment stats with mock financial data
            setStats({
                ...statsData,
                monthlyCollections: 8520,
                totalOutstanding: 2150
            });
            setSchedule(scheduleData);
            setClassrooms(classroomsData);
            setLoading(false);
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <StatsCards stats={stats} />

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="week">Week Schedule</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <UpcomingClasses schedule={schedule} />
                            <ClassroomStatusGrid classrooms={classrooms} />
                        </div>
                        <div className="lg:col-span-1">
                            <ActivityFeed />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="week">
                    <WeekTimetable />
                </TabsContent>
            </Tabs>
        </div>
    );
}