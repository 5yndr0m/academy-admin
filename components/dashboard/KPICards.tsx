"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CalendarDays, DoorOpen, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DashboardKPIs } from "@/types";

interface KPICardsProps {
  data: DashboardKPIs;
}

function Delta({ value }: { value: number }) {
  if (value === 0)
    return (
      <span className="flex items-center gap-1 text-muted-foreground text-xs">
        <Minus className="h-3 w-3" /> No change
      </span>
    );
  const positive = value > 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}{value.toFixed(1)}% vs last month
    </span>
  );
}

export function KPICards({ data }: KPICardsProps) {
  const classroomPct = Math.round((data.occupiedClassrooms / data.totalClassrooms) * 100);
  const { scheduled, active, completed, cancelled } = data.todaysSessionsBreakdown;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Enrolled Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-3xl font-bold">{data.enrolledStudents.toLocaleString()}</div>
          <Delta value={data.enrolledStudentsDelta} />
        </CardContent>
      </Card>

      {/* Active Lecturers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Lecturers</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-3xl font-bold">{data.activeLecturers}</div>
          <Delta value={data.activeLecturersDelta} />
        </CardContent>
      </Card>

      {/* Today's Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Sessions</CardTitle>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-3xl font-bold">{data.todaysSessions}</div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {active > 0 && <span className="text-emerald-600 font-medium">{active} active</span>}
            {scheduled > 0 && <span>{scheduled} upcoming</span>}
            {completed > 0 && <span>{completed} done</span>}
            {cancelled > 0 && <span className="text-red-400">{cancelled} cancelled</span>}
          </div>
        </CardContent>
      </Card>

      {/* Classroom Occupancy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Classrooms In Use</CardTitle>
          <DoorOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-3xl font-bold">
            {data.occupiedClassrooms}
            <span className="text-lg font-normal text-muted-foreground">/{data.totalClassrooms}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${classroomPct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{classroomPct}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
