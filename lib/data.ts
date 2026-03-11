import { apiClient } from "./api-client";
import type {
  User,
  Teacher,
  Subject,
  SubjectDependencies,
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
  InvoiceItem,
  MultiRecordInvoiceRequest,
  EnrollmentInvoiceRequest,
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
    apiClient.post<{
      token: string;
      role: string;
      username: string;
      user_id: string;
    }>("/auth/login", { username, password }),
};

export const userService = {
  getAll: (search?: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.get<User[]>(`/admin/users${params}`);
  },

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
  getAll: (search?: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.get<Subject[]>(`/subjects${params}`);
  },

  create: (name: string) => apiClient.post<Subject>("/subjects", { name }),

  getDependencies: (id: string) =>
    apiClient.get<SubjectDependencies>(`/subjects/${id}/dependencies`),

  archive: (id: string) =>
    apiClient.patch<{ message: string; subject: Subject }>(
      `/subjects/${id}/archive`,
    ),

  restore: (id: string) =>
    apiClient.patch<{ message: string; subject: Subject }>(
      `/subjects/${id}/restore`,
    ),

  forceDelete: (id: string) =>
    apiClient.delete<{ message: string; affected_records: number }>(
      `/subjects/${id}/force`,
    ),
};

export const teacherService = {
  getAll: (search?: string, activeOnly?: boolean) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (activeOnly) params.append("active_only", "true");
    const queryString = params.toString();
    return apiClient.get<Teacher[]>(
      `/teachers${queryString ? `?${queryString}` : ""}`,
    );
  },

  getById: (id: string) =>
    apiClient.get<{ teacher: Teacher; subjects: Subject[]; classes: Class[] }>(
      `/teachers/${id}`,
    ),

  create: (data: {
    full_name: string;
    contact_number: string;
    email?: string;
    subject_ids: string[];
  }) => apiClient.post<Teacher>("/teachers", data),

  update: (
    id: string,
    data: {
      full_name: string;
      contact_number: string;
      email?: string;
    },
  ) => apiClient.put<Teacher>(`/teachers/${id}`, data),

  toggleStatus: (id: string) =>
    apiClient.patch<{ message: string; id: string; status: string }>(
      `/teachers/${id}/toggle`,
    ),

  updateSubjects: (
    id: string,
    data: {
      subject_ids: string[];
    },
  ) =>
    apiClient.put<{ message: string; subjects: Subject[] }>(
      `/teachers/${id}/subjects`,
      data,
    ),

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
  getAll: (search?: string) => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    return apiClient.get<Class[]>(`/classes${params}`);
  },

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

  getActive: () => apiClient.get<ClassSession[]>("/sessions/active"),

  getRoomStatus: (roomId: string) =>
    apiClient.get<{
      room_id: string;
      room_name: string;
      is_occupied: boolean;
      current_session: ClassSession | null;
      next_session: ClassSession | null;
    }>(`/sessions/room/${roomId}/status`),

  generate: (data: {
    start_date: string; // "YYYY-MM-DD"
    end_date: string; // "YYYY-MM-DD"
  }) =>
    apiClient.post<{ message: string; sessions_created: number }>(
      "/sessions/generate",
      data,
    ),

  start: (sessionId: string) =>
    apiClient.patch<{ message: string; session: ClassSession }>(
      `/sessions/${sessionId}/start`,
    ),

  end: (sessionId: string) =>
    apiClient.patch<{ message: string; session: ClassSession }>(
      `/sessions/${sessionId}/end`,
    ),

  cancel: (sessionId: string) =>
    apiClient.delete<{ message: string }>(`/sessions/${sessionId}/cancel`),
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

  updateAdmissionFee: (
    id: string,
    data: {
      admission_fee_paid: boolean;
      admission_fee_amount?: number;
      payment_method?: string;
      notes?: string;
    },
  ) => apiClient.patch<Student>(`/students/${id}/admission-fee`, data),
};

export const studentFeePaymentService = {
  // Get complete fee history for a student
  getStudentFeeHistory: (studentId: string) =>
    apiClient.get<{
      student_id: string;
      student_name: string;
      admission_no: string;
      total_paid: number;
      total_outstanding: number;
      payments: Array<{
        id: string;
        student_id: string;
        class_id: string;
        amount: number;
        payment_month: string;
        paid_at: string | null;
        payment_status: string;
        collected_by: string | null;
        created_by: string;
        payment_method: string;
        notes: string;
        created_at: string;
        student?: {
          id: string;
          admission_no: string;
          fullname: string;
          contact_number: string;
        };
        class?: {
          id: string;
          name: string;
          base_monthly_fee: number;
          teacher_name?: string;
        };
        collected_by_user?: {
          id: string;
          name: string;
          username: string;
        };
      }>;
      missed_months: Array<{
        month: string;
        expected_amount: number;
        class_name: string;
        class_id: string;
      }>;
    }>(`/students/${studentId}/fee-history`),

  // Create new fee payment
  createFeePayment: (data: {
    student_id: string;
    class_id: string;
    amount: number;
    payment_month: string;
    payment_status: "PAID" | "UNPAID" | "PARTIAL" | "WAIVED";
    payment_method?: string;
    notes?: string;
    collected_by?: string;
  }) => apiClient.post("/fee-payments", data),

  // Update fee payment
  updateFeePayment: (
    id: string,
    data: {
      amount?: number;
      payment_status?: "PAID" | "UNPAID" | "PARTIAL" | "WAIVED";
      payment_method?: string;
      notes?: string;
      collected_by?: string;
    },
  ) => apiClient.put(`/fee-payments/${id}`, data),

  // Delete fee payment
  deleteFeePayment: (id: string) => apiClient.delete(`/fee-payments/${id}`),

  // Get monthly fee status for all students
  getMonthlyFeeStatus: (month: string) =>
    apiClient.get<{
      month: string;
      total_expected: number;
      total_collected: number;
      total_outstanding: number;
      payment_summary: Array<{
        student_id: string;
        student_name: string;
        admission_no: string;
        expected_amount: number;
        paid_amount: number;
        outstanding_amount: number;
        payment_status: string;
        classes: Array<{
          class_id: string;
          class_name: string;
          expected_amount: number;
          paid_amount: number;
          payment_status: string;
          paid_at: string | null;
          collected_by: string | null;
        }>;
      }>;
    }>(`/fee-payments/monthly-status?month=${month}`),
};

export const enrollmentService = {
  enroll: (student_id: string, class_id: string) =>
    apiClient.post<Enrollment>("/enrollments", { student_id, class_id }),

  drop: (enrollmentId: string) =>
    apiClient.patch<{ message: string; id: string }>(
      `/enrollments/${enrollmentId}/drop`,
    ),

  reactivate: (enrollmentId: string) =>
    apiClient.patch<{ message: string; id: string }>(
      `/enrollments/${enrollmentId}/reactivate`,
    ),

  complete: (enrollmentId: string) =>
    apiClient.patch<{ message: string; id: string }>(
      `/enrollments/${enrollmentId}/complete`,
    ),

  bulkComplete: (enrollment_ids: string[]) =>
    apiClient.patch<{ message: string; updated: number }>(
      "/enrollments/bulk/complete",
      { enrollment_ids },
    ),

  getByStudent: (studentId: string) =>
    apiClient.get<Enrollment[]>(`/enrollments/student/${studentId}`),

  getByClass: (classId: string) =>
    apiClient.get<Enrollment[]>(`/enrollments/class/${classId}`),

  getGradeTransitionCandidates: (monthsEnrolled?: number, classId?: string) => {
    const params = new URLSearchParams();
    if (monthsEnrolled) params.set("months_enrolled", String(monthsEnrolled));
    if (classId) params.set("class_id", classId);
    const qs = params.toString();
    return apiClient.get<
      Array<{
        enrollment_id: string;
        student_id: string;
        student_name: string;
        admission_no: string;
        class_id: string;
        class_name: string;
        enrollment_date: string;
        months_enrolled: number;
      }>
    >(`/enrollments/grade-transition-candidates${qs ? "?" + qs : ""}`);
  },
};

export const attendanceService = {
  mark: (data: {
    session_id: string;
    student_id: string;
    status: "PRESENT" | "ABSENT" | "LATE";
  }) => apiClient.post<Attendance>("/attendance", data),

  markBulk: (data: {
    session_id: string;
    attendance: Array<{
      student_id: string;
      status: "PRESENT" | "ABSENT" | "LATE";
    }>;
  }) =>
    apiClient.post<{ message: string; processed: number }>(
      "/attendance/bulk",
      data,
    ),

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

  getTodayClasses: () =>
    apiClient.get<
      Array<{
        class_id: string;
        class_name: string;
        teacher_name: string;
        room_name: string;
        start_time: string;
        end_time: string;
        status: string;
        enrolled_students: number;
        attendance_marked: number;
        completion_rate: number;
      }>
    >("/attendance/today/classes"),

  getWeeklyForClass: (classId: string, weekStart?: string) => {
    const params = new URLSearchParams();
    if (weekStart) params.set("week_start", weekStart);
    const qs = params.toString();
    return apiClient.get<
      Array<{
        student_id: string;
        student_name: string;
        admission_no: string;
        total_sessions: number;
        present_count: number;
        absent_count: number;
        late_count: number;
        attendance_rate: number;
        status: string;
      }>
    >(`/attendance/weekly/class/${classId}${qs ? "?" + qs : ""}`);
  },

  getWeeklyForStudent: (studentId: string, weekStart?: string) => {
    const params = new URLSearchParams();
    if (weekStart) params.set("week_start", weekStart);
    const qs = params.toString();
    return apiClient.get<
      Array<{
        class_id: string;
        class_name: string;
        total_sessions: number;
        present_count: number;
        absent_count: number;
        late_count: number;
        attendance_rate: number;
        status: string;
      }>
    >(`/attendance/weekly/student/${studentId}${qs ? "?" + qs : ""}`);
  },

  getClassOverview: (classId: string, fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (fromDate) params.set("from_date", fromDate);
    if (toDate) params.set("to_date", toDate);
    const qs = params.toString();
    return apiClient.get<{
      class_id: string;
      class_name: string;
      total_students: number;
      total_sessions: number;
      average_attendance: number;
      excellent_students: number;
      good_students: number;
      poor_students: number;
      critical_students: number;
    }>(`/attendance/overview/class/${classId}${qs ? "?" + qs : ""}`);
  },

  getStudentOverall: (
    studentId: string,
    fromDate?: string,
    toDate?: string,
  ) => {
    const params = new URLSearchParams();
    if (fromDate) params.set("from_date", fromDate);
    if (toDate) params.set("to_date", toDate);
    const qs = params.toString();
    return apiClient.get<{
      student_id: string;
      student_name: string;
      total_classes: number;
      total_sessions: number;
      total_present: number;
      total_absent: number;
      total_late: number;
      overall_attendance: number;
      status: string;
    }>(`/attendance/overview/student/${studentId}${qs ? "?" + qs : ""}`);
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

  createAdmissionInvoice: (data: {
    student_id: string;
    amount: number;
    payment_status: "PAID" | "UNPAID";
    payment_method?: string;
    notes?: string;
    due_date: string;
  }) => apiClient.post<Invoice>("/invoices/admission", data),

  markPaid: (id: string, paid_at?: string) =>
    apiClient.patch(`/invoices/${id}/pay`, paid_at ? { paid_at } : {}),

  update: (
    id: string,
    data: {
      total_amount?: number;
      due_date?: string;
      notes?: string;
    },
  ) => apiClient.put<Invoice>(`/invoices/${id}`, data),

  downloadPDF: (id: string) =>
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"}/invoices/${id}/pdf`,

  getByStudent: (studentId: string) =>
    apiClient.get<Invoice[]>(`/invoices?student_id=${studentId}`),

  getDashboard: (filters?: {
    type?: InvoiceType;
    status?: InvoiceStatus;
    month?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.type) params.set("type", filters.type);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.month) params.set("month", filters.month);
    const qs = params.toString();
    return apiClient.get<{
      total_invoices: number;
      total_amount: number;
      paid_amount: number;
      pending_amount: number;
      overdue_amount: number;
      collection_rate: number;
      invoices: Invoice[];
    }>(`/invoices/dashboard${qs ? "?" + qs : ""}`);
  },

  getOverdue: () => apiClient.get<Invoice[]>("/invoices/overdue"),

  getPendingDelivery: () =>
    apiClient.get<Invoice[]>("/invoices/pending-delivery"),

  send: (data: {
    invoice_ids: string[];
    delivery_method: "EMAIL" | "WHATSAPP";
    message?: string;
  }) =>
    apiClient.post<{ message: string; sent: number; failed: number }>(
      "/invoices/send",
      data,
    ),

  generatePDFs: (invoice_ids: string[]) =>
    apiClient.post<{ message: string; generated: number }>(
      "/invoices/generate-pdf",
      { invoice_ids },
    ),

  createMultiRecord: (data: MultiRecordInvoiceRequest) =>
    apiClient.post<Invoice>("/invoices/multi-record", data),

  createFromEnrollments: (data: EnrollmentInvoiceRequest) =>
    apiClient.post<Invoice>("/invoices/enrollment-based", data),

  bulkAction: (data: {
    action: "PAY" | "SEND" | "GENERATE_PDF" | "DELETE";
    invoice_ids: string[];
    params?: Record<string, any>;
  }) =>
    apiClient.post<{ message: string; processed: number }>(
      "/invoices/bulk-action",
      data,
    ),

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

export const teacherPaymentService = {
  getDashboard: (filters?: {
    teacher_id?: string;
    month?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.teacher_id) params.set("teacher_id", filters.teacher_id);
    if (filters?.month) params.set("month", filters.month);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    return apiClient.get(`/teacher-payments/dashboard${qs ? "?" + qs : ""}`);
  },

  getPending: () => apiClient.get("/teacher-payments/pending"),

  getMonthlyStats: (month?: string) => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    const qs = params.toString();
    return apiClient.get(
      `/teacher-payments/monthly-stats${qs ? "?" + qs : ""}`,
    );
  },

  getTeacherSummary: (teacherId: string, month?: string) => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    const qs = params.toString();
    return apiClient.get(
      `/teacher-payments/teacher/${teacherId}/summary${qs ? "?" + qs : ""}`,
    );
  },

  getTeacherHistory: (teacherId: string) =>
    apiClient.get(`/teacher-payments/teacher/${teacherId}/history`),

  getTeacherEarnings: (
    teacherId: string,
    fromDate?: string,
    toDate?: string,
  ) => {
    const params = new URLSearchParams();
    if (fromDate) params.set("from_date", fromDate);
    if (toDate) params.set("to_date", toDate);
    const qs = params.toString();
    return apiClient.get(
      `/teacher-payments/teacher/${teacherId}/earnings${qs ? "?" + qs : ""}`,
    );
  },

  calculate: (month: string) =>
    apiClient.post("/teacher-payments/calculate", { month }),

  process: (data: {
    teacher_id: string;
    payment_month: string;
    actual_amount: number;
    payment_method: string;
    notes?: string;
  }) => apiClient.post("/teacher-payments/process", data),

  cancel: (paymentId: string) =>
    apiClient.patch(`/teacher-payments/${paymentId}/cancel`),
};

export const staffCommissionService = {
  getDashboard: (filters?: {
    staff_id?: string;
    month?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.staff_id) params.set("staff_id", filters.staff_id);
    if (filters?.month) params.set("month", filters.month);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    return apiClient.get(`/staff-commissions/dashboard${qs ? "?" + qs : ""}`);
  },

  getPending: () => apiClient.get("/staff-commissions/pending"),

  getMonthlyStats: (month?: string) => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    const qs = params.toString();
    return apiClient.get(
      `/staff-commissions/monthly-stats${qs ? "?" + qs : ""}`,
    );
  },

  getSummary: (staffId?: string, month?: string) => {
    const params = new URLSearchParams();
    if (staffId) params.set("staff_id", staffId);
    if (month) params.set("month", month);
    const qs = params.toString();
    return apiClient.get(`/staff-commissions/summary${qs ? "?" + qs : ""}`);
  },

  getHistory: () => apiClient.get("/staff-commissions/history"),

  getEarnings: (staffId?: string, fromDate?: string, toDate?: string) => {
    const params = new URLSearchParams();
    if (staffId) params.set("staff_id", staffId);
    if (fromDate) params.set("from_date", fromDate);
    if (toDate) params.set("to_date", toDate);
    const qs = params.toString();
    return apiClient.get(`/staff-commissions/earnings${qs ? "?" + qs : ""}`);
  },

  getRevenueBreakdown: (month?: string) => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    const qs = params.toString();
    return apiClient.get(
      `/staff-commissions/revenue-breakdown${qs ? "?" + qs : ""}`,
    );
  },

  calculate: (month: string) =>
    apiClient.post("/staff-commissions/calculate", { month }),

  process: (data: {
    staff_id: string;
    commission_month: string;
    actual_amount: number;
    payment_method: string;
    notes?: string;
  }) => apiClient.post("/staff-commissions/process", data),

  cancel: (commissionId: string) =>
    apiClient.patch(`/staff-commissions/${commissionId}/cancel`),
};

export const staffPaymentService = {
  getDashboard: (filters?: {
    staff_id?: string;
    month?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.staff_id) params.set("staff_id", filters.staff_id);
    if (filters?.month) params.set("month", filters.month);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    return apiClient.get(`/staff-payments/dashboard${qs ? "?" + qs : ""}`);
  },

  getMonthlyStatus: (month?: string) => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    const qs = params.toString();
    return apiClient.get(`/staff-payments/monthly-status${qs ? "?" + qs : ""}`);
  },

  getOverdue: () => apiClient.get("/staff-payments/overdue"),

  getStaffUnpaid: (staffId: string) =>
    apiClient.get(`/staff-payments/staff/${staffId}/unpaid`),

  getStaffHistory: (staffId: string) =>
    apiClient.get(`/staff-payments/staff/${staffId}/history`),

  getStaffSummary: (staffId: string, month?: string) => {
    const params = new URLSearchParams();
    if (month) params.set("month", month);
    const qs = params.toString();
    return apiClient.get(
      `/staff-payments/staff/${staffId}/summary${qs ? "?" + qs : ""}`,
    );
  },

  getAll: (filters?: {
    staff_id?: string;
    month?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.staff_id) params.set("staff_id", filters.staff_id);
    if (filters?.month) params.set("month", filters.month);
    if (filters?.status) params.set("status", filters.status);
    const qs = params.toString();
    return apiClient.get(`/staff-payments${qs ? "?" + qs : ""}`);
  },

  create: (data: {
    staff_id: string;
    amount: number;
    payment_month: string;
    payment_status: string;
    payment_method?: string;
    notes?: string;
  }) => apiClient.post("/staff-payments", data),

  process: (data: {
    staff_id: string;
    payment_month: string;
    actual_amount: number;
    payment_method: string;
    notes?: string;
  }) => apiClient.post("/staff-payments/process", data),

  generateMonthly: (month: string) =>
    apiClient.post("/staff-payments/generate-monthly", { month }),

  update: (
    paymentId: string,
    data: {
      amount?: number;
      payment_status?: string;
      payment_method?: string;
      notes?: string;
    },
  ) => apiClient.put(`/staff-payments/${paymentId}`, data),

  markAsWaived: (paymentId: string) =>
    apiClient.patch(`/staff-payments/${paymentId}/waive`),

  delete: (paymentId: string) =>
    apiClient.delete(`/staff-payments/${paymentId}`),
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
