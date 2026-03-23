"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { KPICards } from "@/components/dashboard/KPICards";
import { ClassroomUtilizationChart } from "@/components/dashboard/ClassroomUtilizationChart";
import { AttendanceTrendChart } from "@/components/dashboard/AttendanceTrendChart";
import { LectureProgressChart } from "@/components/dashboard/LectureProgressChart";
import { RevenueSnapshotChart } from "@/components/dashboard/RevenueSnapshotChart";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { WeekTimetable } from "@/components/dashboard/WeekTimetable";
import { SemesterProgress } from "@/components/dashboard/SemesterProgress";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { ConflictDetectionPanel } from "@/components/dashboard/ConflictDetectionPanel";
import { ClassStatsPieChart } from "@/components/dashboard/ClassStatsPieChart";
import { TeacherUtilizationChart } from "@/components/dashboard/TeacherUtilizationChart";
import { ClassroomAllocationTable } from "@/components/dashboard/ClassroomAllocationTable";
import { TeacherAssignmentTable } from "@/components/dashboard/TeacherAssignmentTable";
import {
  mockDashboardKPIs,
  mockClassroomUtilization,
  mockAttendanceTrend,
  mockLectureHours,
  mockRevenueSnapshot,
  mockTodaySchedule,
  mockActivityFeed,
  mockWeeklySchedule,
  mockSemester,
  mockAlerts,
  mockConflicts,
  mockClassEnrollmentStats,
  mockClassroomAllocation,
  mockTeacherUtilization,
  mockTeacherAssignments,
} from "@/lib/mock-data";

// Dashboard data sourced from mock-data.ts (Phase 0).
// Replace mock* calls with real API calls from lib/data.ts in Phase 1+.
const kpis            = mockDashboardKPIs();
const utilization     = mockClassroomUtilization();
const attendance      = mockAttendanceTrend();
const lectureHrs      = mockLectureHours();
const revenue         = mockRevenueSnapshot();
const todaySched      = mockTodaySchedule();
const activity        = mockActivityFeed();
const weekSchedule    = mockWeeklySchedule();
const semester        = mockSemester();
const alerts          = mockAlerts();
const conflicts       = mockConflicts();
const enrollmentStats = mockClassEnrollmentStats();
const roomAllocation  = mockClassroomAllocation();
const teacherUtil     = mockTeacherUtilization();
const teacherAssign   = mockTeacherAssignments();

export default function Home() {
  const { role } = useAuth();

  return (
    <div className="space-y-6 p-6">

      {/* Row 1 — KPI Cards */}
      <KPICards data={kpis} />

      {/* Row 2 — Classroom Utilization + Attendance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassroomUtilizationChart data={utilization} />
        <AttendanceTrendChart data={attendance} />
      </div>

      {/* Row 3 — Lecture Hours (full width) */}
      <LectureProgressChart data={lectureHrs} />

      {/* Row 4 — Today's Schedule + Revenue (admin only) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaySchedule data={todaySched} />
        {role === "ADMIN" && <RevenueSnapshotChart data={revenue} />}
      </div>

      {/* Row 5 — Week Timetable */}
      <WeekTimetable weeklySchedule={weekSchedule} />

      {/* Row 6 — Semester Progress + Conflict Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SemesterProgress data={semester} />
        <ConflictDetectionPanel conflicts={conflicts} />
      </div>

      {/* Row 7 — Class Enrollment Status + Teacher Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassStatsPieChart data={enrollmentStats} />
        <TeacherUtilizationChart data={teacherUtil} />
      </div>

      {/* Row 8 — Classroom Allocation Table */}
      <ClassroomAllocationTable data={roomAllocation} />

      {/* Row 9 — Teacher Assignment Table */}
      <TeacherAssignmentTable data={teacherAssign} />

      {/* Row 10 — Alerts + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel alerts={alerts} />
        <ActivityFeed logs={activity} />
      </div>

    </div>
  );
}
