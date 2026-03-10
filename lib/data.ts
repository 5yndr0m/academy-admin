import { apiClient } from "./api-client";
import type {
  User,
  Teacher,
  Subject,
  Classroom,
  Class,
  ClassSchedule,
  ClassSession,
  Student,
  Enrollment,
  Attendance,
  AttendanceSummary,
  SessionWithAttendance,
  Invoice,
  InvoiceType,
  InvoiceStatus,
  Expense,
  ExpenseCategory,
  NotificationLog,
  MonthlyReport,
  MonthlyFinancialSummary,
  Template,
  TemplateType,
  DashboardData,
  SearchResult,
  AuditLog,
} from "@/types";

export const authService = {
  login: (username: string, password: string) =>
    apiClient.post<{ token: string; role: string; username: string }>(
      "/auth/login",
      { username, password },
    ),
};

export const userService = {
  getAll: () => apiClient.get<User[]>("/admin/users"),

  getById: (id: string) => apiClient.get<User>(`/admin/users/${id}`),

  register: (data: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: "ADMIN" | "STAFF";
    contact_number: string;
    commission_percentage?: number;
  }) => apiClient.post<User>("/admin/register", data),

  update: (
    id: string,
    data: {
      name: string;
      email: string;
      contact_number: string;
      commission_percentage: number;
    },
  ) => apiClient.put<User>(`/admin/users/${id}`, data),

  toggleStatus: (id: string) =>
    apiClient.patch<{ message: string; id: string; status: string }>(
      `/admin/users/${id}/toggle`,
    ),
};

export const subjectService = {
  getAll: () => apiClient.get<Subject[]>("/subjects"),

  create: (name: string) => apiClient.post<Subject>("/subjects", { name }),
};

export const teacherService = {
  getAll: () => apiClient.get<Teacher[]>("/teachers"),

  getById: (id: string) =>
    apiClient.get<{ teacher: Teacher; subjects: Subject[]; classes: Class[] }>(
      `/teachers/${id}`,
    ),

  create: (data: {
    full_name: string;
    contact_number: string;
    subject_ids: string[];
  }) => apiClient.post<Teacher>("/teachers", data),

  update: (
    id: string,
    data: {
      full_name: string;
      contact_number: string;
    },
  ) => apiClient.put<Teacher>(`/teachers/${id}`, data),

  search: (q: string) =>
    apiClient.get<SearchResult<Teacher>>(
      `/search/teachers?q=${encodeURIComponent(q)}`,
    ),
};

export const classroomService = {
  getAll: () => apiClient.get<Classroom[]>("/classrooms"),

  getAvailable: (date?: string, startTime?: string, endTime?: string) => {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (startTime) params.set("start_time", startTime);
    if (endTime) params.set("end_time", endTime);
    const qs = params.toString();
    return apiClient.get<Classroom[]>(
      `/classrooms/available${qs ? "?" + qs : ""}`,
    );
  },

  create: (data: { name: string; capacity: number; is_usable: boolean }) =>
    apiClient.post<Classroom>("/classrooms", data),

  update: (
    id: string,
    data: {
      name: string;
      capacity: number;
      is_usable: boolean;
    },
  ) => apiClient.put<Classroom>(`/classrooms/${id}`, data),

  // NOTE: was PUT /classrooms/${id}/toggle-status → fixed to PATCH /classrooms/${id}/usable
  toggleUsability: (id: string) =>
    apiClient.patch<{ message: string; id: string; is_usable: boolean }>(
      `/classrooms/${id}/usable`,
    ),
};

export const classService = {
  getAll: () => apiClient.get<Class[]>("/classes"),

  getById: (id: string) => apiClient.get<Class>(`/classes/${id}`),

  create: (data: {
    name: string;
    base_monthly_fee: number;
    payout_percentage: number;
    teacher_id: string;
    subject_id: string;
  }) => apiClient.post<Class>("/classes", data),

  update: (
    id: string,
    data: {
      name: string;
      base_monthly_fee: number;
      payout_percentage: number;
      teacher_id: string;
      subject_id: string;
    },
  ) => apiClient.put<Class>(`/classes/${id}`, data),

  toggleStatus: (id: string) =>
    apiClient.patch<{ message: string; id: string; status: string }>(
      `/classes/${id}/status`,
    ),
};

export const scheduleService = {
  // NOTE: was POST /teachers/${teacherId}/schedule → fixed to POST /schedules
  create: (data: {
    class_id: string;
    classroom_id: string;
    day_of_week: number;
    start_time: string; // "HH:mm"
    end_time: string; // "HH:mm"
  }) => apiClient.post<ClassSchedule>("/schedules", data),

  getByClass: (classId: string) =>
    apiClient.get<ClassSchedule[]>(`/schedules/class/${classId}`),

  getWeekly: () =>
    apiClient.get<Record<string, ClassSchedule[]>>("/schedules/weekly"),
};

export const sessionService = {
  create: (data: {
    class_id: string;
    classroom_id: string;
    session_date: string; // "YYYY-MM-DD"
    start_time: string;
    end_time: string;
    schedule_id?: string | null;
  }) => apiClient.post<ClassSession>("/sessions", data),

  getByClass: (classId: string) =>
    apiClient.get<ClassSession[]>(`/sessions/class/${classId}`),

  getToday: () => apiClient.get<ClassSession[]>("/sessions/today"),
};

export const studentService = {
  getAll: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.get<Student[]>(`/students${qs}`);
  },

  getById: (id: string) =>
    apiClient.get<{ student: Student; enrollments: Enrollment[] }>(
      `/students/${id}`,
    ),

  // NOTE: old addStudent shape was very different → new shape matches backend DTO
  create: (data: {
    admission_no: string;
    full_name: string;
    nic_no: string;
    gender: "M" | "F";
    date_of_birth: string; // "YYYY-MM-DD"
    address: string;
    contact_number: string;
    guardian_name: string;
    guardian_contact: string;
    guardian_email: string;
    admission_fee_paid: boolean;
    registration_date: string;
    authorized_by: string;
  }) => apiClient.post<Student>("/students", data),

  update: (
    id: string,
    data: {
      full_name: string;
      address: string;
      contact_number: string;
      guardian_name: string;
      guardian_contact: string;
      guardian_email: string;
    },
  ) => apiClient.put<Student>(`/students/${id}`, data),

  search: (q: string) =>
    apiClient.get<SearchResult<Student>>(
      `/search/students?q=${encodeURIComponent(q)}`,
    ),
};

export const enrollmentService = {
  enroll: (student_id: string, class_id: string) =>
    apiClient.post<Enrollment>("/enrollments", { student_id, class_id }),

  drop: (enrollmentId: string) =>
    apiClient.patch<{ message: string; id: string }>(
      `/enrollments/${enrollmentId}/drop`,
    ),

  getByStudent: (studentId: string) =>
    apiClient.get<Enrollment[]>(`/enrollments/student/${studentId}`),

  getByClass: (classId: string) =>
    apiClient.get<Enrollment[]>(`/enrollments/class/${classId}`),
};

export const attendanceService = {
  mark: (data: {
    session_id: string;
    student_id: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }) => apiClient.post<Attendance>("/attendance", data),

  getBySession: (sessionId: string) =>
    apiClient.get<Attendance[]>(`/attendance/session/${sessionId}`),

  getStudentsForSession: (sessionId: string) =>
    apiClient.get<SessionWithAttendance[]>(
      `/attendance/session/${sessionId}/students`,
    ),

  getByStudent: (studentId: string, classId?: string, month?: string) => {
    const params = new URLSearchParams();
    if (classId) params.set("class_id", classId);
    if (month) params.set("month", month);
    const qs = params.toString();
    return apiClient.get<AttendanceSummary>(
      `/attendance/student/${studentId}${qs ? "?" + qs : ""}`,
    );
  },
};

export const invoiceService = {
  getAll: (filters?: {
    type?: InvoiceType;
    status?: InvoiceStatus;
    month?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.month) params.set("month", filters.month);
    const qs = params.toString();
    return apiClient.get<Invoice[]>(`/invoices${qs ? "?" + qs : ""}`);
  },

  getById: (id: string) => apiClient.get<Invoice>(`/invoices/${id}`),

  // NOTE: was apiClient.post(`/students/${studentId}/generate-bills`) →
  //       fixed to POST /invoices/generate with { billing_month }
  generateMonthly: (billing_month: string) =>
    apiClient.post<{ message: string; created: number; skipped: number }>(
      "/invoices/generate",
      { billing_month },
    ),

  createTeacherPayout: (data: {
    teacher_id: string;
    billing_month: string;
    total_amount: number;
    notes?: string;
  }) => apiClient.post<Invoice>("/invoices/teacher-payout", data),

  createStaffCommission: (data: {
    staff_id: string;
    billing_month: string;
    total_amount: number;
    notes?: string;
  }) => apiClient.post<Invoice>("/invoices/staff-commission", data),

  markPaid: (id: string, paid_at?: string) =>
    apiClient.patch(`/invoices/${id}/pay`, paid_at ? { paid_at } : undefined),

  downloadPDF: (id: string) =>
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/invoices/${id}/pdf`,

  getByStudent: (studentId: string) =>
    apiClient.get<Invoice[]>(`/invoices?student_id=${studentId}`),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<Invoice>(`/invoices/${id}/status`, { status }),
};

export const expenseService = {
  getAll: (filters?: { month?: string; category?: ExpenseCategory }) => {
    const params = new URLSearchParams();
    if (filters?.month) params.set("month", filters.month);
    if (filters?.category) params.set("category", filters.category);
    const qs = params.toString();
    return apiClient.get<{ expenses: Expense[]; total: number }>(
      `/expenses${qs ? "?" + qs : ""}`,
    );
  },

  create: (data: {
    description: string;
    amount: number;
    category: ExpenseCategory;
    expense_date: string; // "YYYY-MM-DD"
  }) => apiClient.post<Expense>("/expenses", data),
};

export const notificationService = {
  send: (data: {
    student_id: string;
    channel: "WHATSAPP" | "EMAIL";
    message: string;
    invoice_id?: string;
  }) => apiClient.post<NotificationLog>("/notifications", data),

  getLogs: (filters?: {
    student_id?: string;
    channel?: string;
    status?: string;
    month?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.student_id) params.set("student_id", filters.student_id);
    if (filters?.channel) params.set("channel", filters.channel);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.month) params.set("month", filters.month);
    const qs = params.toString();
    return apiClient.get<NotificationLog[]>(
      `/notifications${qs ? "?" + qs : ""}`,
    );
  },

  getByStudent: (studentId: string) =>
    apiClient.get<NotificationLog[]>(`/notifications?student_id=${studentId}`),
};

export const reportService = {
  getMonthly: (month: string) =>
    apiClient.get<MonthlyReport>(`/reports/monthly?month=${month}`),

  saveMonthly: (billing_month: string) =>
    apiClient.post<MonthlyFinancialSummary>("/reports/monthly/save", {
      billing_month,
    }),

  downloadPDF: (month: string) =>
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/reports/monthly/pdf?month=${month}`,
};

export const templateService = {
  getAll: (type?: TemplateType) => {
    const qs = type ? `?type=${type}` : "";
    return apiClient.get<Template[]>(`/templates${qs}`);
  },

  getById: (id: string) => apiClient.get<Template>(`/templates/${id}`),

  create: (data: {
    name: string;
    type: TemplateType;
    content: string;
    description?: string;
  }) => apiClient.post<Template>("/templates", data),

  update: (
    id: string,
    data: {
      name: string;
      content: string;
      description?: string;
    },
  ) => apiClient.put<Template>(`/templates/${id}`, data),

  setDefault: (id: string) => apiClient.patch(`/templates/${id}/default`),

  delete: (id: string) => apiClient.delete(`/templates/${id}`),

  preview: (template_id: string, data: Record<string, string>) =>
    apiClient.post<{ template_name: string; rendered: string }>(
      "/templates/preview",
      { template_id, data },
    ),
};

export const dashboardService = {
  get: () => apiClient.get<DashboardData>("/dashboard"),
};

export const auditService = {
  getRecent: async (): Promise<AuditLog[]> => {
    const dashboard = await dashboardService.get();
    return dashboard.recent_audit_logs;
  },
};
