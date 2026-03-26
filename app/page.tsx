"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAsyncData } from "@/lib/hooks/useAsyncData";
import { dashboardService, conflictService, semesterService } from "@/lib/data";
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
  mockAttendanceTrend,
  mockLectureHours,
  mockClassroomUtilization,
  mockTeacherUtilization,
  mockAlerts,
  mockClassEnrollmentStats,
} from "@/lib/mock-data";
import type {
  DashboardKPIs,
  TodaySession,
  RevenueSnapshotData,
  ConflictSummary,
  ClassroomAllocationRow,
  TeacherAssignmentRow,
} from "@/types";

// Static mock data for charts that require historical/computed aggregates
// TODO: wire these once backend analytics endpoints return the needed shape
const attendance      = mockAttendanceTrend();
const lectureHrs      = mockLectureHours();
const utilizationData = mockClassroomUtilization();
const teacherUtil     = mockTeacherUtilization();
const alerts          = mockAlerts();
const enrollmentStats = mockClassEnrollmentStats();

export default function Home() {
  const { role } = useAuth();

  const { data: dashboard }      = useAsyncData(() => dashboardService.get(), []);
  const { data: conflictsData }  = useAsyncData(() => conflictService.getAll({ status: "PENDING" }), []);
  const { data: activeSemester } = useAsyncData(() => semesterService.getActive(), []);

  // ── KPI Cards ───────────────────────────────────────────────────────────────
  const kpis = useMemo((): DashboardKPIs => {
    if (!dashboard) return {
      enrolledStudents: 0, enrolledStudentsDelta: 0,
      activeLecturers: 0,  activeLecturersDelta: 0,
      todaysSessions: 0,
      todaysSessionsBreakdown: { scheduled: 0, active: 0, completed: 0, cancelled: 0 },
      occupiedClassrooms: 0, totalClassrooms: 0,
    };
    const occupied = dashboard.classroom_status.filter((r) => r.is_occupied).length;
    return {
      enrolledStudents:      dashboard.counts.students,
      enrolledStudentsDelta: 0,
      activeLecturers:       dashboard.counts.teachers,
      activeLecturersDelta:  0,
      todaysSessions:        dashboard.today_sessions.length,
      todaysSessionsBreakdown: { scheduled: dashboard.today_sessions.length, active: 0, completed: 0, cancelled: 0 },
      occupiedClassrooms:    occupied,
      totalClassrooms:       dashboard.classroom_status.length,
    };
  }, [dashboard]);

  // ── Today's Schedule ────────────────────────────────────────────────────────
  const todaySched = useMemo((): TodaySession[] => {
    if (!dashboard) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dashboard.today_sessions.map((s: any) => ({
      sessionId:    s.id,
      subjectName:  s.class?.subject?.name   ?? "—",
      lecturerName: s.class?.teacher?.full_name ?? "—",
      classroom:    s.classroom?.name        ?? "—",
      startTime:    s.start_time,
      endTime:      s.end_time,
      status:       s.status ?? "SCHEDULED",
      enrolledCount: 0,
    }));
  }, [dashboard]);

  // ── Revenue Snapshot ────────────────────────────────────────────────────────
  const revenue = useMemo((): RevenueSnapshotData => {
    const fs = dashboard?.financial_summary as Record<string, number> | null | undefined;
    return {
      studentRevenue:   fs?.total_collected         ?? 0,
      teacherPayouts:   fs?.total_teacher_payouts   ?? 0,
      staffCommissions: fs?.total_staff_commissions ?? 0,
      expenses:         fs?.total_expenses          ?? 0,
      netIncome:        fs?.net_income              ?? 0,
    };
  }, [dashboard]);

  // ── Conflicts ────────────────────────────────────────────────────────────────
  const conflicts = useMemo((): ConflictSummary[] => {
    if (!conflictsData?.conflicts) return [];
    return conflictsData.conflicts.map((c) => ({
      id:          c.id,
      type:        c.type,
      severity:    c.severity,
      status:      c.status,
      className:   c.session_a_class ?? "—",
      teacherName: "—",
      roomName:    "—",
      day:         c.session_a_date  ?? "—",
      timeSlot:    c.session_a_time  ?? "—",
    }));
  }, [conflictsData]);

  // ── Semester Progress ────────────────────────────────────────────────────────
  const semester = useMemo(() => {
    if (!activeSemester) return null;
    const startYear = new Date(activeSemester.start_date).getFullYear();
    const endYear   = new Date(activeSemester.end_date).getFullYear();
    return {
      name:         activeSemester.name,
      academicYear: startYear === endYear ? String(startYear) : `${startYear} / ${endYear}`,
      startDate:    activeSemester.start_date,
      endDate:      activeSemester.end_date,
      batches:      [] as { label: string; year: 1 | 2 | 3 | 4; studentCount: number; isActive: boolean }[],
    };
  }, [activeSemester]);

  // ── Classroom Allocation Table ───────────────────────────────────────────────
  const roomAllocation = useMemo((): ClassroomAllocationRow[] => {
    if (!dashboard) return [];
    const rows: ClassroomAllocationRow[] = [];
    const dayAbbr: Record<string, string> = {
      Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
      Thursday: "Thu", Friday: "Fri", Saturday: "Sat",
    };
    Object.entries(dashboard.weekly_schedule).forEach(([day, schedules]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (schedules as any[]).forEach((s) => {
        if (!s.classroom || !s.class) return;
        rows.push({
          room:               s.classroom.name,
          capacity:           s.classroom.capacity ?? 0,
          className:          s.class.name,
          teacherName:        s.class.teacher?.full_name ?? "—",
          day:                dayAbbr[day] ?? day,
          time:               `${s.start_time}–${s.end_time}`,
          studentsCount:      0,
          utilizationPercent: 0,
        });
      });
    });
    return rows;
  }, [dashboard]);

  // ── Teacher Assignment Table ─────────────────────────────────────────────────
  const teacherAssign = useMemo((): TeacherAssignmentRow[] => {
    if (!dashboard) return [];
    const rows: TeacherAssignmentRow[] = [];
    const dayAbbr: Record<string, string> = {
      Sunday: "Sun", Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
      Thursday: "Thu", Friday: "Fri", Saturday: "Sat",
    };
    Object.entries(dashboard.weekly_schedule).forEach(([day, schedules]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (schedules as any[]).forEach((s) => {
        if (!s.class) return;
        rows.push({
          teacherName:  s.class.teacher?.full_name  ?? "—",
          subject:      s.class.subject?.name       ?? "—",
          className:    s.class.name,
          day:          dayAbbr[day] ?? day,
          time:         `${s.start_time}–${s.end_time}`,
          room:         s.classroom?.name ?? "—",
          studentsCount: 0,
        });
      });
    });
    return rows;
  }, [dashboard]);

  return (
    <div className="space-y-6 p-6">

      {/* Row 1 — KPI Cards */}
      <KPICards data={kpis} />

      {/* Row 2 — Classroom Utilization + Attendance Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassroomUtilizationChart data={utilizationData} />
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
      <WeekTimetable weeklySchedule={dashboard?.weekly_schedule ?? {}} />

      {/* Row 6 — Semester Progress + Conflict Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {semester && <SemesterProgress data={semester} />}
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
        <ActivityFeed logs={dashboard?.recent_audit_logs ?? []} />
      </div>

    </div>
  );
}
