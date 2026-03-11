"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { UpcomingClasses } from "@/components/dashboard/UpcomingClasses";
import { ClassroomStatusGrid } from "@/components/dashboard/ClassroomStatusGrid";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { WeekTimetable } from "@/components/dashboard/WeekTimetable";
import { DashboardFinanceSummary } from "@/components/dashboard/DashboardFinanceSummary";
import { dashboardService } from "@/lib/data";
import { DashboardData } from "@/types";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { role } = useAuth();

  const loadDashboard = () => {
    setLoading(true);
    dashboardService
      .get()
      .then((d) => {
        console.log("dashboard response:", JSON.stringify(d, null, 2));
        setData(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-sm text-destructive">
          Failed to load dashboard: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsCards counts={data.counts} financial={data.financial_summary} />

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="w-full overflow-x-auto pb-1 scrollbar-hide">
          <TabsList className="bg-muted/60 p-1 inline-flex w-full justify-start md:w-fit whitespace-nowrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="week">Week Schedule</TabsTrigger>
            {role === "ADMIN" && (
              <TabsTrigger value="financial">Financial Summary</TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <UpcomingClasses
                sessions={data.today_sessions || []}
                sessionGenerationNeeded={data.session_generation_needed}
                onRefresh={loadDashboard}
              />
              <ClassroomStatusGrid status={data.classroom_status ?? []} />
            </div>
            <div className="lg:col-span-1">
              <ActivityFeed logs={data.recent_audit_logs} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="week">
          <WeekTimetable weeklySchedule={data.weekly_schedule} />
        </TabsContent>

        {role === "ADMIN" && (
          <TabsContent value="financial">
            <DashboardFinanceSummary financial={data.financial_summary} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
