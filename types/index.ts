export type UserRole = "ADMIN" | "STAFF"; // backend uses uppercase

export interface LoginResponse {
  token: string;
  role: UserRole;
  username: string; // added to backend LoginResponse DTO
}

export interface User {
  id: string;
  user_name: string;
  name: string;
  email: string;
  role: UserRole;
  contact_number: string;
  commission_percentage: number;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  full_name: string;
  contact_number: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  subjects?: Subject[];
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  is_usable: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  base_monthly_fee: number;
  payout_percentage: number;
  status: "ACTIVE" | "INACTIVE";
  teacher_id: string;
  subject_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
  subject?: Subject;
}

export interface ClassSchedule {
  id: string;
  day_of_week: number; // 0=Sun, 1=Mon ... 6=Sat
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
  class_id: string;
  classroom_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  class?: Class;
  classroom?: Classroom;
}

export interface ClassSession {
  id: string;
  session_date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
  class_id: string;
  classroom_id: string;
  schedule_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  class?: Class;
  classroom?: Classroom;
}

export interface Student {
  id: string;
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
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type EnrollmentStatus = "ENROLLED" | "DROPPED";

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  dropped_at: string | null;
  created_at: string;
  updated_at: string;
  student?: Student;
  class?: Class;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export interface Attendance {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  marked_by: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  session?: ClassSession;
}

export interface AttendanceSummary {
  records: Attendance[];
  summary: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
}

export interface SessionWithAttendance {
  student: Student;
  attendance_status: AttendanceStatus | "";
}

export type InvoiceType =
  | "STUDENT_PAYMENT"
  | "TEACHER_PAYOUT"
  | "STAFF_COMMISSION";
export type InvoiceStatus = "PAID" | "UNPAID";

export interface Invoice {
  id: string;
  invoice_type: InvoiceType;
  billing_month: string; // "YYYY-MM"
  total_amount: number;
  status: InvoiceStatus;
  student_id: string | null;
  class_id: string | null;
  recipient_id: string | null;
  recipient_type: string | null;
  collected_by: string | null;
  paid_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  class?: Class;
}

export type ExpenseCategory =
  | "UTILITIES"
  | "MAINTENANCE"
  | "SALARY"
  | "SUPPLIES"
  | "OTHER";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string; // "YYYY-MM-DD"
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type NotificationChannel = "WHATSAPP" | "EMAIL";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export interface NotificationLog {
  id: string;
  student_id: string;
  channel: NotificationChannel;
  recipient: string;
  message: string;
  status: NotificationStatus;
  invoice_id: string | null;
  sent_by: string;
  sent_at: string;
  student?: Student;
}

export interface MonthlyFinancialSummary {
  id: string;
  billing_month: string;
  total_collected: number;
  total_teacher_payouts: number;
  total_staff_commissions: number;
  total_expenses: number;
  net_income: number;
  created_at: string;
}

export interface MonthlyReport {
  month: string;
  total_collected: number;
  total_teacher_payouts: number;
  total_staff_commissions: number;
  total_expenses: number;
  net_income: number;
  pending_invoices: {
    count: number;
    amount: number;
  };
}

export type TemplateType = "INVOICE" | "REPORT" | "EMAIL" | "WHATSAPP";

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  description: string;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  today_sessions: ClassSession[];
  classroom_status: ClassroomStatus[];
  weekly_schedule: WeeklySchedule;
  financial_summary: MonthlyReport | null;
  recent_audit_logs: AuditLog[];
  today: string;
  counts: {
    students: number;
    teachers: number;
    active_classes: number;
  };
}

export interface ClassroomStatus {
  id: string;
  name: string;
  capacity: number;
  is_usable: boolean;
  is_occupied: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type WeeklySchedule = {
  [day: string]: ClassSchedule[]; // day = "Sunday" | "Monday" ... "Saturday"
};

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  performed_by: string;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface SearchResult<T> {
  results: T[];
  count: number;
}
