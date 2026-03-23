/**
 * ICBT Mock Data — Phase 0
 *
 * All dashboard components source from here during Phase 0.
 * When real API endpoints are ready (Phase 1–4), replace these
 * calls in lib/data.ts — components remain unchanged.
 */

import type {
  DashboardKPIs,
  ClassroomUtilizationData,
  AttendanceTrendPoint,
  LectureHoursData,
  RevenueSnapshotData,
  TodaySession,
  QuickSearchResult,
  AuditLog,
  WeeklySchedule,
  ConflictSummary,
  ClassEnrollmentStat,
  ClassroomAllocationRow,
  TeacherUtilizationData,
  TeacherAssignmentRow,
} from "@/types";
import type { DashboardAlert } from "@/components/dashboard/AlertsPanel";

export function mockDashboardKPIs(): DashboardKPIs {
  return {
    enrolledStudents: 347,
    enrolledStudentsDelta: 4.2,
    activeLecturers: 18,
    activeLecturersDelta: 0,
    todaysSessions: 9,
    todaysSessionsBreakdown: {
      scheduled: 3,
      active: 2,
      completed: 3,
      cancelled: 1,
    },
    occupiedClassrooms: 4,
    totalClassrooms: 7,
  };
}

export function mockClassroomUtilization(): ClassroomUtilizationData[] {
  return [
    { classroomName: "LH-01",      utilizationPercent: 84, sessionsHeld: 21, totalCapacityHours: 50 },
    { classroomName: "LH-02",      utilizationPercent: 76, sessionsHeld: 19, totalCapacityHours: 50 },
    { classroomName: "LH-03",      utilizationPercent: 62, sessionsHeld: 15, totalCapacityHours: 48 },
    { classroomName: "Lab-01",     utilizationPercent: 91, sessionsHeld: 23, totalCapacityHours: 50 },
    { classroomName: "Lab-02",     utilizationPercent: 58, sessionsHeld: 14, totalCapacityHours: 48 },
    { classroomName: "Tutorial-A", utilizationPercent: 43, sessionsHeld: 11, totalCapacityHours: 50 },
    { classroomName: "Seminar-01", utilizationPercent: 29, sessionsHeld: 7,  totalCapacityHours: 48 },
  ];
}

export function mockAttendanceTrend(): AttendanceTrendPoint[] {
  return [
    { week: "W6",  attendancePercent: 81, sessionCount: 12 },
    { week: "W7",  attendancePercent: 79, sessionCount: 14 },
    { week: "W8",  attendancePercent: 85, sessionCount: 13 },
    { week: "W9",  attendancePercent: 83, sessionCount: 15 },
    { week: "W10", attendancePercent: 88, sessionCount: 14 },
    { week: "W11", attendancePercent: 72, sessionCount: 13 },
    { week: "W12", attendancePercent: 86, sessionCount: 16 },
    { week: "W13", attendancePercent: 90, sessionCount: 15 },
  ];
}

export function mockLectureHours(): LectureHoursData[] {
  return [
    { lecturerName: "Dr. Perera",      subject: "Data Structures",   allocatedHours: 40, conductedHours: 34 },
    { lecturerName: "Ms. Fernando",    subject: "Database Systems",   allocatedHours: 36, conductedHours: 36 },
    { lecturerName: "Mr. Silva",       subject: "Computer Networks",  allocatedHours: 40, conductedHours: 28 },
    { lecturerName: "Dr. Jayawardena", subject: "Software Eng.",      allocatedHours: 44, conductedHours: 40 },
    { lecturerName: "Ms. Wijesinghe",  subject: "Mathematics",        allocatedHours: 48, conductedHours: 44 },
    { lecturerName: "Mr. Bandara",     subject: "OOP Programming",    allocatedHours: 40, conductedHours: 32 },
    { lecturerName: "Dr. Ranasinghe",  subject: "Machine Learning",   allocatedHours: 32, conductedHours: 30 },
  ];
}

export function mockRevenueSnapshot(): RevenueSnapshotData {
  return {
    studentRevenue:   1_240_000,
    teacherPayouts:     496_000,
    staffCommissions:    74_400,
    expenses:           118_500,
    netIncome:          551_100,
  };
}

export function mockTodaySchedule(): TodaySession[] {
  return [
    { sessionId: "s1", subjectName: "Data Structures",   lecturerName: "Dr. Perera",      classroom: "LH-01",      startTime: "08:00", endTime: "10:00", status: "COMPLETED", enrolledCount: 42 },
    { sessionId: "s2", subjectName: "Database Systems",  lecturerName: "Ms. Fernando",    classroom: "Lab-01",     startTime: "09:00", endTime: "11:00", status: "COMPLETED", enrolledCount: 38 },
    { sessionId: "s3", subjectName: "Computer Networks", lecturerName: "Mr. Silva",        classroom: "LH-02",      startTime: "10:00", endTime: "12:00", status: "ACTIVE",    enrolledCount: 45 },
    { sessionId: "s4", subjectName: "Mathematics",       lecturerName: "Ms. Wijesinghe",  classroom: "LH-03",      startTime: "11:00", endTime: "13:00", status: "ACTIVE",    enrolledCount: 51 },
    { sessionId: "s5", subjectName: "OOP Programming",   lecturerName: "Mr. Bandara",     classroom: "Lab-02",     startTime: "13:00", endTime: "15:00", status: "SCHEDULED", enrolledCount: 39 },
    { sessionId: "s6", subjectName: "Software Eng.",     lecturerName: "Dr. Jayawardena", classroom: "LH-01",      startTime: "14:00", endTime: "16:00", status: "SCHEDULED", enrolledCount: 47 },
    { sessionId: "s7", subjectName: "Machine Learning",  lecturerName: "Dr. Ranasinghe",  classroom: "Seminar-01", startTime: "15:00", endTime: "17:00", status: "SCHEDULED", enrolledCount: 28 },
    { sessionId: "s8", subjectName: "English for IT",    lecturerName: "Ms. Dissanayake", classroom: "Tutorial-A", startTime: "08:00", endTime: "09:00", status: "COMPLETED", enrolledCount: 55 },
    { sessionId: "s9", subjectName: "Digital Logic",     lecturerName: "Mr. Karunaratne", classroom: "LH-02",      startTime: "16:00", endTime: "18:00", status: "CANCELLED", enrolledCount: 33 },
  ];
}

export function mockWeeklySchedule(): WeeklySchedule {
  const now = new Date().toISOString();

  const s = (
    id: string, dayOfWeek: number, start: string, end: string,
    classId: string, className: string, teacherName: string,
    classroomId: string, classroomName: string, subjectName: string,
  ) => ({
    id,
    day_of_week: dayOfWeek,
    start_time: start,
    end_time: end,
    class_id: classId,
    classroom_id: classroomId,
    created_by: "admin",
    created_at: now,
    updated_at: now,
    class: {
      id: classId,
      name: className,
      base_monthly_fee: 8500,
      payout_percentage: 40,
      status: "ACTIVE" as const,
      teacher_id: `t-${teacherName}`,
      subject_id: `sub-${subjectName}`,
      created_by: "admin",
      created_at: now,
      updated_at: now,
      teacher: {
        id: `t-${teacherName}`,
        full_name: teacherName,
        contact_number: "",
        status: "ACTIVE" as const,
        created_by: "admin",
        created_at: now,
        updated_at: now,
      },
      subject: {
        id: `sub-${subjectName}`,
        name: subjectName,
        status: "ACTIVE" as const,
        created_by: "admin",
        created_at: now,
        updated_at: now,
      },
    },
    classroom: {
      id: classroomId,
      name: classroomName,
      capacity: 50,
      is_usable: true,
      created_by: "admin",
      created_at: now,
      updated_at: now,
    },
  });

  return {
    Monday: [
      s("m1", 1, "08:00", "10:00", "cls1", "Data Structures",   "Dr. Nuwan Perera",       "cr1", "LH-01",      "Data Structures"),
      s("m2", 1, "09:00", "11:00", "cls2", "Database Systems",  "Ms. Dilani Fernando",    "cr4", "Lab-01",     "Database Systems"),
      s("m3", 1, "11:00", "13:00", "cls5", "Mathematics",       "Ms. Priyanka Wijesinghe","cr3", "LH-03",      "Mathematics"),
      s("m4", 1, "14:00", "16:00", "cls4", "Software Eng.",     "Dr. Suresh Jayawardena", "cr1", "LH-01",      "Software Engineering"),
      s("m5", 1, "15:00", "17:00", "cls6", "OOP Programming",   "Mr. Ruwan Bandara",      "cr4", "Lab-01",     "OOP Programming"),
    ],
    Tuesday: [
      s("t1", 2, "08:00", "10:00", "cls3", "Computer Networks", "Mr. Chathura Silva",     "cr2", "LH-02",      "Computer Networks"),
      s("t2", 2, "10:00", "12:00", "cls7", "Machine Learning",  "Dr. Asanka Ranasinghe",  "cr7", "Seminar-01", "Machine Learning"),
      s("t3", 2, "11:00", "13:00", "cls1", "Data Structures",   "Dr. Nuwan Perera",       "cr1", "LH-01",      "Data Structures"),
      s("t4", 2, "14:00", "15:00", "cls8", "English for IT",    "Ms. Sanduni Dissanayake","cr6", "Tutorial-A", "English for IT"),
      s("t5", 2, "15:00", "17:00", "cls5", "Mathematics",       "Ms. Priyanka Wijesinghe","cr3", "LH-03",      "Mathematics"),
    ],
    Wednesday: [
      s("w1", 3, "08:00", "10:00", "cls2", "Database Systems",  "Ms. Dilani Fernando",    "cr4", "Lab-01",     "Database Systems"),
      s("w2", 3, "09:00", "11:00", "cls6", "OOP Programming",   "Mr. Ruwan Bandara",      "cr5", "Lab-02",     "OOP Programming"),
      s("w3", 3, "11:00", "13:00", "cls4", "Software Eng.",     "Dr. Suresh Jayawardena", "cr2", "LH-02",      "Software Engineering"),
      s("w4", 3, "14:00", "16:00", "cls3", "Computer Networks", "Mr. Chathura Silva",     "cr1", "LH-01",      "Computer Networks"),
      s("w5", 3, "16:00", "17:00", "cls8", "English for IT",    "Ms. Sanduni Dissanayake","cr6", "Tutorial-A", "English for IT"),
    ],
    Thursday: [
      s("th1", 4, "08:00", "10:00", "cls1", "Data Structures",  "Dr. Nuwan Perera",       "cr2", "LH-02",      "Data Structures"),
      s("th2", 4, "10:00", "12:00", "cls5", "Mathematics",      "Ms. Priyanka Wijesinghe","cr1", "LH-01",      "Mathematics"),
      s("th3", 4, "11:00", "13:00", "cls7", "Machine Learning", "Dr. Asanka Ranasinghe",  "cr7", "Seminar-01", "Machine Learning"),
      s("th4", 4, "14:00", "16:00", "cls2", "Database Systems", "Ms. Dilani Fernando",    "cr4", "Lab-01",     "Database Systems"),
    ],
    Friday: [
      s("f1", 5, "08:00", "10:00", "cls4", "Software Eng.",     "Dr. Suresh Jayawardena", "cr1", "LH-01",      "Software Engineering"),
      s("f2", 5, "09:00", "11:00", "cls6", "OOP Programming",   "Mr. Ruwan Bandara",      "cr5", "Lab-02",     "OOP Programming"),
      s("f3", 5, "11:00", "13:00", "cls3", "Computer Networks", "Mr. Chathura Silva",     "cr3", "LH-03",      "Computer Networks"),
      s("f4", 5, "14:00", "16:00", "cls1", "Data Structures",   "Dr. Nuwan Perera",       "cr2", "LH-02",      "Data Structures"),
      s("f5", 5, "15:00", "17:00", "cls7", "Machine Learning",  "Dr. Asanka Ranasinghe",  "cr7", "Seminar-01", "Machine Learning"),
    ],
    Saturday: [
      s("sa1", 6, "09:00", "11:00", "cls5", "Mathematics",      "Ms. Priyanka Wijesinghe","cr1", "LH-01",      "Mathematics"),
      s("sa2", 6, "10:00", "12:00", "cls2", "Database Systems", "Ms. Dilani Fernando",    "cr4", "Lab-01",     "Database Systems"),
      s("sa3", 6, "13:00", "15:00", "cls6", "OOP Programming",  "Mr. Ruwan Bandara",      "cr5", "Lab-02",     "OOP Programming"),
    ],
    Sunday: [],
  };
}

export function mockSemester() {
  return {
    name: "Semester 2",
    academicYear: "2025 / 2026",
    startDate: "2026-01-06",
    endDate: "2026-05-30",
    batches: [
      { label: "2025/26 Intake", year: 1 as const, studentCount: 92,  isActive: true },
      { label: "2024/25 Intake", year: 2 as const, studentCount: 88,  isActive: true },
      { label: "2023/24 Intake", year: 3 as const, studentCount: 81,  isActive: true },
      { label: "2022/23 Intake", year: 4 as const, studentCount: 74,  isActive: true },
    ],
  };
}

export function mockAlerts(): DashboardAlert[] {
  return [
    {
      id: "al1",
      severity: "critical",
      icon: "attendance",
      title: "Sessions missing attendance",
      detail: "3 completed sessions today have no attendance records. Mark before end of day.",
      count: 3,
    },
    {
      id: "al2",
      severity: "critical",
      icon: "report",
      title: "Daily reports not submitted",
      detail: "Mr. Chathura Silva and Dr. Asanka Ranasinghe have not submitted today's lecture report.",
      count: 2,
    },
    {
      id: "al3",
      severity: "warning",
      icon: "maintenance",
      title: "Pending maintenance requests",
      detail: "Lab-01 projector and LH-03 AC unit are awaiting repair. Classes still running.",
      count: 2,
    },
    {
      id: "al4",
      severity: "warning",
      icon: "student",
      title: "Low attendance students",
      detail: "14 students have fallen below 80% attendance threshold this semester.",
      count: 14,
    },
    {
      id: "al5",
      severity: "info",
      icon: "attendance",
      title: "Digital Logic session cancelled",
      detail: "Mr. Karunaratne's 16:00 session was cancelled. 33 enrolled students not notified.",
      count: 1,
    },
  ];
}

export function mockActivityFeed(): AuditLog[] {
  const now = new Date();
  const ago = (mins: number) => new Date(now.getTime() - mins * 60_000).toISOString();
  return [
    { id: "a1", action: "SESSION_STARTED",   entity_type: "SESSION",    entity_id: "s3", performed_by: "Mr. Silva",       description: "Computer Networks — LH-02 started",         ip_address: "192.168.1.10", created_at: ago(8)   },
    { id: "a2", action: "ATTENDANCE_MARKED", entity_type: "ATTENDANCE", entity_id: "s2", performed_by: "Ms. Fernando",    description: "38 students marked for Database Systems",    ip_address: "192.168.1.12", created_at: ago(22)  },
    { id: "a3", action: "SESSION_COMPLETED", entity_type: "SESSION",    entity_id: "s2", performed_by: "Ms. Fernando",    description: "Database Systems — Lab-01 completed",        ip_address: "192.168.1.12", created_at: ago(35)  },
    { id: "a4", action: "SESSION_COMPLETED", entity_type: "SESSION",    entity_id: "s1", performed_by: "Dr. Perera",      description: "Data Structures — LH-01 completed",          ip_address: "192.168.1.11", created_at: ago(62)  },
    { id: "a5", action: "STUDENT_ENROLLED",  entity_type: "STUDENT",    entity_id: "st8",performed_by: "admin",           description: "Lakshan Gunawardena enrolled in OOP Prog.",  ip_address: "192.168.1.1",  created_at: ago(90)  },
    { id: "a6", action: "SESSION_CANCELLED", entity_type: "SESSION",    entity_id: "s9", performed_by: "admin",           description: "Digital Logic cancelled — lecturer absent",  ip_address: "192.168.1.1",  created_at: ago(110) },
  ];
}

export function mockConflicts(): ConflictSummary[] {
  return [
    { id: "cf1", type: "TEACHER_OVERLAP", severity: "HIGH",   status: "PENDING",  className: "Data Structures Y2",  teacherName: "Dr. Nuwan Perera",        roomName: "LH-01",      day: "Monday",    timeSlot: "08:00–10:00" },
    { id: "cf2", type: "ROOM_CONFLICT",   severity: "HIGH",   status: "PENDING",  className: "Database Systems Y1",  teacherName: "Ms. Dilani Fernando",     roomName: "Lab-01",     day: "Thursday",  timeSlot: "14:00–16:00" },
    { id: "cf3", type: "DOUBLE_BOOKING",  severity: "MEDIUM", status: "PENDING",  className: "Mathematics Y3",       teacherName: "Ms. Priyanka Wijesinghe", roomName: "LH-03",      day: "Wednesday", timeSlot: "11:00–13:00" },
    { id: "cf4", type: "TEACHER_OVERLAP", severity: "LOW",    status: "RESOLVED", className: "OOP Programming Y1",   teacherName: "Mr. Ruwan Bandara",       roomName: "Lab-02",     day: "Friday",    timeSlot: "09:00–11:00" },
  ];
}

export function mockClassEnrollmentStats(): ClassEnrollmentStat[] {
  return [
    { className: "Data Structures",   enrolled: 52, capacity: 60, fillStatus: "FULL"      },
    { className: "Database Systems",  enrolled: 38, capacity: 40, fillStatus: "FULL"      },
    { className: "Computer Networks", enrolled: 45, capacity: 60, fillStatus: "HALF_FULL" },
    { className: "Software Eng.",     enrolled: 47, capacity: 60, fillStatus: "HALF_FULL" },
    { className: "Mathematics",       enrolled: 44, capacity: 50, fillStatus: "FULL"      },
    { className: "OOP Programming",   enrolled: 36, capacity: 40, fillStatus: "FULL"      },
    { className: "English for IT",    enrolled: 24, capacity: 30, fillStatus: "HALF_FULL" },
    { className: "Machine Learning",  enrolled: 11, capacity: 25, fillStatus: "LOW"       },
  ];
}

export function mockClassroomAllocation(): ClassroomAllocationRow[] {
  return [
    { room: "LH-01",      capacity: 60, className: "Data Structures",   teacherName: "Dr. Nuwan Perera",        day: "Mon", time: "08:00–10:00", studentsCount: 52, utilizationPercent: 87 },
    { room: "LH-01",      capacity: 60, className: "Software Eng.",     teacherName: "Dr. Suresh Jayawardena",  day: "Mon", time: "14:00–16:00", studentsCount: 47, utilizationPercent: 78 },
    { room: "LH-02",      capacity: 60, className: "Computer Networks", teacherName: "Mr. Chathura Silva",      day: "Tue", time: "08:00–10:00", studentsCount: 45, utilizationPercent: 75 },
    { room: "LH-03",      capacity: 50, className: "Mathematics",       teacherName: "Ms. Priyanka Wijesinghe", day: "Mon", time: "11:00–13:00", studentsCount: 44, utilizationPercent: 88 },
    { room: "Lab-01",     capacity: 40, className: "Database Systems",  teacherName: "Ms. Dilani Fernando",     day: "Mon", time: "09:00–11:00", studentsCount: 38, utilizationPercent: 95 },
    { room: "Lab-02",     capacity: 40, className: "OOP Programming",   teacherName: "Mr. Ruwan Bandara",       day: "Mon", time: "15:00–17:00", studentsCount: 36, utilizationPercent: 90 },
    { room: "Seminar-01", capacity: 25, className: "Machine Learning",  teacherName: "Dr. Asanka Ranasinghe",   day: "Tue", time: "10:00–12:00", studentsCount: 11, utilizationPercent: 44 },
    { room: "Tutorial-A", capacity: 30, className: "English for IT",    teacherName: "Ms. Sanduni Dissanayake", day: "Tue", time: "14:00–15:00", studentsCount: 24, utilizationPercent: 80 },
  ];
}

export function mockTeacherUtilization(): TeacherUtilizationData[] {
  return [
    { teacherName: "Dr. Nuwan Perera",        subject: "Data Structures",  assignedHours: 40, conductedHours: 34, utilizationPercent: 85 },
    { teacherName: "Ms. Dilani Fernando",     subject: "Database Systems",  assignedHours: 36, conductedHours: 36, utilizationPercent: 100 },
    { teacherName: "Mr. Chathura Silva",      subject: "Computer Networks", assignedHours: 40, conductedHours: 28, utilizationPercent: 70 },
    { teacherName: "Dr. Suresh Jayawardena",  subject: "Software Eng.",     assignedHours: 44, conductedHours: 40, utilizationPercent: 91 },
    { teacherName: "Ms. Priyanka Wijesinghe", subject: "Mathematics",       assignedHours: 48, conductedHours: 44, utilizationPercent: 92 },
    { teacherName: "Mr. Ruwan Bandara",       subject: "OOP Programming",   assignedHours: 40, conductedHours: 32, utilizationPercent: 80 },
    { teacherName: "Dr. Asanka Ranasinghe",   subject: "Machine Learning",  assignedHours: 32, conductedHours: 30, utilizationPercent: 94 },
  ];
}

export function mockTeacherAssignments(): TeacherAssignmentRow[] {
  return [
    { teacherName: "Dr. Nuwan Perera",        subject: "Data Structures",  className: "DS Year 2",  day: "Mon", time: "08:00–10:00", room: "LH-01",      studentsCount: 52 },
    { teacherName: "Dr. Nuwan Perera",        subject: "Data Structures",  className: "DS Year 2",  day: "Tue", time: "11:00–13:00", room: "LH-01",      studentsCount: 52 },
    { teacherName: "Dr. Nuwan Perera",        subject: "Data Structures",  className: "DS Year 2",  day: "Thu", time: "08:00–10:00", room: "LH-02",      studentsCount: 52 },
    { teacherName: "Ms. Dilani Fernando",     subject: "Database Systems",  className: "DB Year 1",  day: "Mon", time: "09:00–11:00", room: "Lab-01",     studentsCount: 38 },
    { teacherName: "Ms. Dilani Fernando",     subject: "Database Systems",  className: "DB Year 1",  day: "Wed", time: "08:00–10:00", room: "Lab-01",     studentsCount: 38 },
    { teacherName: "Mr. Chathura Silva",      subject: "Computer Networks", className: "CN Year 2",  day: "Tue", time: "08:00–10:00", room: "LH-02",      studentsCount: 45 },
    { teacherName: "Mr. Chathura Silva",      subject: "Computer Networks", className: "CN Year 2",  day: "Wed", time: "14:00–16:00", room: "LH-01",      studentsCount: 45 },
    { teacherName: "Dr. Suresh Jayawardena",  subject: "Software Eng.",     className: "SE Year 3",  day: "Mon", time: "14:00–16:00", room: "LH-01",      studentsCount: 47 },
    { teacherName: "Dr. Suresh Jayawardena",  subject: "Software Eng.",     className: "SE Year 3",  day: "Wed", time: "11:00–13:00", room: "LH-02",      studentsCount: 47 },
    { teacherName: "Ms. Priyanka Wijesinghe", subject: "Mathematics",       className: "Maths Y1",   day: "Mon", time: "11:00–13:00", room: "LH-03",      studentsCount: 44 },
    { teacherName: "Ms. Priyanka Wijesinghe", subject: "Mathematics",       className: "Maths Y1",   day: "Tue", time: "15:00–17:00", room: "LH-03",      studentsCount: 44 },
    { teacherName: "Mr. Ruwan Bandara",       subject: "OOP Programming",   className: "OOP Year 1", day: "Mon", time: "15:00–17:00", room: "Lab-02",     studentsCount: 36 },
    { teacherName: "Mr. Ruwan Bandara",       subject: "OOP Programming",   className: "OOP Year 1", day: "Wed", time: "09:00–11:00", room: "Lab-02",     studentsCount: 36 },
    { teacherName: "Dr. Asanka Ranasinghe",   subject: "Machine Learning",  className: "ML Year 4",  day: "Tue", time: "10:00–12:00", room: "Seminar-01", studentsCount: 11 },
    { teacherName: "Dr. Asanka Ranasinghe",   subject: "Machine Learning",  className: "ML Year 4",  day: "Thu", time: "11:00–13:00", room: "Seminar-01", studentsCount: 11 },
  ];
}

export function mockSearch(query: string): QuickSearchResult {
  const q = query.toLowerCase();

  const allStudents = [
    { id: "st1", name: "Kasun Rajapaksa",    admissionNo: "ICBT-2024-001", programme: "BSc Computer Science" },
    { id: "st2", name: "Nimasha Perera",     admissionNo: "ICBT-2024-002", programme: "BSc Computer Science" },
    { id: "st3", name: "Ravindu Fernando",   admissionNo: "ICBT-2024-003", programme: "BEng Software Engineering" },
    { id: "st4", name: "Sachini Wijeratne",  admissionNo: "ICBT-2024-004", programme: "BSc IT" },
    { id: "st5", name: "Dulith Bandara",     admissionNo: "ICBT-2024-005", programme: "BEng Software Engineering" },
    { id: "st6", name: "Thisara Jayasundara",admissionNo: "ICBT-2023-041", programme: "BSc Computer Science" },
    { id: "st7", name: "Amaya Silva",        admissionNo: "ICBT-2023-042", programme: "BSc IT" },
    { id: "st8", name: "Lakshan Gunawardena",admissionNo: "ICBT-2022-018", programme: "BEng Software Engineering" },
  ];

  const allLecturers = [
    { id: "l1", name: "Dr. Nuwan Perera",        subjects: ["Data Structures", "Algorithms"] },
    { id: "l2", name: "Ms. Dilani Fernando",      subjects: ["Database Systems", "SQL"] },
    { id: "l3", name: "Mr. Chathura Silva",       subjects: ["Computer Networks"] },
    { id: "l4", name: "Dr. Suresh Jayawardena",   subjects: ["Software Engineering", "Design Patterns"] },
    { id: "l5", name: "Ms. Priyanka Wijesinghe",  subjects: ["Mathematics", "Statistics"] },
    { id: "l6", name: "Mr. Ruwan Bandara",        subjects: ["OOP Programming", "Java"] },
    { id: "l7", name: "Dr. Asanka Ranasinghe",    subjects: ["Machine Learning", "AI"] },
    { id: "l8", name: "Ms. Sanduni Dissanayake",  subjects: ["English for IT"] },
  ];

  const allClassrooms = [
    { id: "c1", name: "LH-01",      capacity: 60, currentStatus: "In Use" },
    { id: "c2", name: "LH-02",      capacity: 60, currentStatus: "In Use" },
    { id: "c3", name: "LH-03",      capacity: 50, currentStatus: "Free" },
    { id: "c4", name: "Lab-01",     capacity: 40, currentStatus: "In Use" },
    { id: "c5", name: "Lab-02",     capacity: 40, currentStatus: "Free" },
    { id: "c6", name: "Tutorial-A", capacity: 30, currentStatus: "Free" },
    { id: "c7", name: "Seminar-01", capacity: 25, currentStatus: "Free" },
  ];

  if (!q) return { students: [], lecturers: [], classrooms: [] };

  return {
    students:   allStudents.filter(s =>
      s.name.toLowerCase().includes(q) || s.admissionNo.toLowerCase().includes(q) || s.programme.toLowerCase().includes(q)
    ).slice(0, 4),
    lecturers:  allLecturers.filter(l =>
      l.name.toLowerCase().includes(q) || l.subjects.some(sub => sub.toLowerCase().includes(q))
    ).slice(0, 4),
    classrooms: allClassrooms.filter(c =>
      c.name.toLowerCase().includes(q) || c.currentStatus.toLowerCase().includes(q)
    ).slice(0, 3),
  };
}
