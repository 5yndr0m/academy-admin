export type UserRole = "ADMIN" | "STAFF"; // backend uses uppercase

export interface LoginResponse {
  token: string;
  role: UserRole;
  username: string; // added to backend LoginResponse DTO
  user_id: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  contact_number: string;
  commission_percentage?: number;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  status: "ACTIVE" | "ARCHIVED" | "DELETED";
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface SubjectDependencies {
  can_delete: boolean;
  can_safe_delete: boolean;
  active_teachers: number;
  active_classes: number;
  historical_records: number;
  blocking_items: string[];
  recommended_action: string;
}

export interface Teacher {
  id: string;
  full_name: string;
  contact_number: string;
  email?: string;
  status: "ACTIVE" | "INACTIVE";
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
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  actual_start: string | null; // ISO timestamp
  actual_end: string | null; // ISO timestamp
  class_id: string;
  classroom_id: string;
  schedule_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  class?: Class;
  classroom?: Classroom;
  schedule?: ClassSchedule;
  created_by_user?: User;
}

export interface Student {
  id: string;
  admission_no: string;
  fullname: string; // Backend uses 'fullname' not 'full_name'
  nic_no?: string;
  occupation?: string;
  gender: "M" | "F";
  date_of_birth: string; // "YYYY-MM-DD"
  address: string;
  home_contact: string;
  guardian_name: string;
  guardian_contact: string;
  guardian_email: string;
  guardian_email_consent: boolean;
  guardian_whatsapp_consent: boolean;
  admission_fee_paid: boolean;
  registration_date: string;
  authorized_by: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  authorized_by_user?: User;
  created_by_user?: User;
}

export type EnrollmentStatus = "ENROLLED" | "DROPPED";

export interface Enrollment {
  id: string;
  student_id: string;
  class_id: string;
  status: EnrollmentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  class?: Class;
  created_by_user?: User;
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

export interface StudentEntry {
  student_id: string;
  fullname: string;
  admission_no: string;
  status: AttendanceStatus | "";
}

export type InvoiceType =
  | "STUDENT_PAYMENT"
  | "TEACHER_PAYOUT"
  | "STAFF_COMMISSION";

// Backend uses 'payment_status' field with these values
export type InvoiceStatus = "PAID" | "UNPAID";

export type BillingFrequency =
  | "MONTHLY"
  | "QUARTERLY"
  | "ANNUALLY"
  | "ONE_TIME";

export interface Invoice {
  id: string;
  invoice_type: InvoiceType;
  total_amount: number; // Backend field name
  billing_month: string; // "YYYY-MM"
  payment_status: InvoiceStatus; // Backend field name
  paid_at: string | null;
  student_id: string | null;
  class_id: string | null;
  recipient_id: string | null;
  recipient_type: string | null;
  collected_by: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  class?: Class;
  collected_by_user?: User;
  created_by_user?: User;
  invoice_items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  amount: number;
  quantity: number;
  unit_price: number;
  item_type: string;
  enrollment_id?: string;
  class_id?: string;
  billing_period?: string;
  created_at: string;
  updated_at: string;
  enrollment?: Enrollment;
  class?: Class;
}

export interface InvoiceItemRequest {
  description: string;
  amount: number;
  quantity: number;
  item_type: string;
  enrollment_id?: string;
  class_id?: string;
}

export interface MultiRecordInvoiceRequest {
  student_id: string;
  billing_month: string;
  due_date?: string;
  notes?: string;
  items: InvoiceItemRequest[];
}

export interface EnrollmentInvoiceRequest {
  billing_month: string;
  enrollment_ids: string[];
  notes?: string;
}

export type ExpenseCategory =
  | "UTILITIES"
  | "MAINTENANCE"
  | "SALARY"
  | "SUPPLIES"
  | "MARKETING"
  | "OTHER";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  expense_date: string; // "YYYY-MM-DD"
  created_by: string;
  created_at: string;
  updated_at: string;
  created_by_user?: User;
}

export type NotificationChannel = "WHATSAPP" | "EMAIL";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export interface NotificationLog {
  id: string;
  student_id: string;
  channel: NotificationChannel;
  notification_type: string; // Backend field name
  message: string;
  recipient: string;
  status: NotificationStatus;
  sent_at: string | null;
  invoice_id: string | null;
  sent_by: string; // Backend field name
  created_at: string;
  updated_at: string;
  student?: Student;
  invoice?: Invoice;
  sent_by_user?: User;
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
  has_actual_sessions: boolean;
  session_generation_needed: boolean;
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

// Financial Service Types
export interface TeacherPayment {
  id: string;
  teacher_id: string;
  payment_month: string;
  total_sessions: number;
  total_amount: number;
  actual_paid_amount: number;
  payment_status: "PENDING" | "PAID" | "PARTIAL" | "CANCELLED";
  payment_method: string;
  paid_at: string | null;
  processed_by: string | null;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
  processed_by_user?: User;
  created_by_user?: User;
}

export interface StaffCommission {
  id: string;
  staff_id: string;
  commission_month: string;
  base_revenue: number;
  commission_percentage: number;
  calculated_amount: number;
  actual_paid_amount: number;
  payment_status: "PENDING" | "PAID" | "PARTIAL" | "CANCELLED";
  payment_method: string;
  paid_at: string | null;
  processed_by: string | null;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  staff?: User;
  processed_by_user?: User;
  created_by_user?: User;
}

export interface StaffPayment {
  id: string;
  staff_id: string;
  amount: number;
  payment_month: string;
  base_revenue: number;
  commission_percentage: number;
  calculated_amount: number;
  payment_status: "UNPAID" | "PAID" | "PARTIAL" | "WAIVED";
  paid_at: string | null;
  payment_method: string;
  notes: string;
  invoice_id: string | null;
  student_count: number;
  total_student_fees: number;
  total_teacher_payouts: number;
  net_revenue: number;
  processed_by: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  staff?: User;
  processed_by_user?: User;
  created_by_user?: User;
  invoice?: Invoice;
}

export interface StudentPaymentRecord {
  id: string;
  student_id: string;
  class_id?: string;
  class_name?: string;
  payment_type: "CLASS_PAYMENT" | "ADMISSION_FEE";
  amount: number;
  payment_date: string; // YYYY-MM-DD
  payment_month?: string; // YYYY-MM
  payment_method: "CASH" | "BANK_TRANSFER" | "CHEQUE";
  recorded_by: string;
  recorded_by_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  class?: Class;
  recorded_by_user?: User;
}

export interface TeacherPayoutRecord {
  id: string;
  teacher_id: string;
  class_id: string;
  amount: number;
  total_revenue_collected: number;
  payout_percentage: number;
  payout_date: string; // YYYY-MM-DD
  payout_month: string; // YYYY-MM
  payment_method: "CASH" | "BANK_TRANSFER" | "CHEQUE";
  recorded_by: string;
  recorded_by_name: string;
  student_count: number;
  notes: string;
  created_at: string;
  updated_at: string;
  teacher?: Teacher;
  class?: Class;
  recorded_by_user?: User;
}

export interface StaffCommissionRecord {
  id: string;
  staff_id: string;
  amount: number;
  total_revenue_collected: number;
  total_teacher_payouts: number;
  net_revenue: number;
  commission_percentage: number;
  payment_date: string; // YYYY-MM-DD
  payment_month: string; // YYYY-MM
  payment_method: "CASH" | "BANK_TRANSFER" | "CHEQUE";
  recorded_by: string;
  recorded_by_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
  staff?: User;
  recorded_by_user?: User;
}

export interface ExpenseRecord {
  id: string;
  category:
    | "UTILITIES"
    | "MAINTENANCE"
    | "SUPPLIES"
    | "RENT"
    | "INSURANCE"
    | "MARKETING"
    | "SALARY"
    | "OTHER";
  description: string;
  amount: number;
  vendor: string;
  expense_date: string; // YYYY-MM-DD
  payment_method: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "CARD";
  recorded_by: string;
  recorded_by_name: string;
  receipt_ref: string;
  notes: string;
  created_at: string;
  updated_at: string;
  recorded_by_user?: User;
}

// Request/Response types for the new financial system
export interface CreateStudentPaymentRequest {
  student_id: string;
  class_id?: string;
  payment_type: "CLASS_PAYMENT" | "ADMISSION_FEE";
  amount: number;
  payment_date: string; // YYYY-MM-DD
  payment_month?: string; // YYYY-MM
  payment_method: "CASH" | "BANK_TRANSFER" | "CHEQUE";
  notes?: string;
}

export interface CreateTeacherPayoutRequest {
  teacher_id: string;
  class_id: string;
  amount: number;
  total_revenue_collected: number;
  payout_percentage: number;
  payout_date: string; // YYYY-MM-DD
  payout_month: string; // YYYY-MM
  payment_method: "CASH" | "BANK_TRANSFER" | "CHEQUE";
  student_count?: number;
  notes?: string;
}

export interface CreateStaffCommissionRequest {
  staff_id: string;
  amount: number;
  total_revenue_collected: number;
  total_teacher_payouts: number;
  net_revenue: number;
  commission_percentage: number;
  payment_date: string; // YYYY-MM-DD
  payment_month: string; // YYYY-MM
  payment_method: "CASH" | "BANK_TRANSFER" | "CHEQUE";
  notes?: string;
}

export interface CreateExpenseRecordRequest {
  category:
    | "UTILITIES"
    | "MAINTENANCE"
    | "SUPPLIES"
    | "RENT"
    | "INSURANCE"
    | "MARKETING"
    | "SALARY"
    | "OTHER";
  description: string;
  amount: number;
  vendor?: string;
  expense_date: string; // YYYY-MM-DD
  payment_method: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "CARD";
  receipt_ref?: string;
  notes?: string;
}

export interface FinancialRecordFilters {
  from_date?: string; // YYYY-MM-DD
  to_date?: string; // YYYY-MM-DD
  month?: string; // YYYY-MM
  student_id?: string;
  teacher_id?: string;
  staff_id?: string;
  class_id?: string;
  category?: string; // For expenses
  payment_method?: string;
  page?: number;
  limit?: number;
}

export interface FinancialRecordStats {
  total_count: number;
  total_amount: number;
  average_amount: number;
  payment_method_cash: number;
  payment_method_bank: number;
  payment_method_other: number;
}

export interface PaginatedFinancialResponse<T> {
  data: T[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  stats?: FinancialRecordStats;
}

export interface PayoutCalculationRequest {
  total_revenue: number;
  payout_percentage: number;
}

export interface CommissionCalculationRequest {
  total_revenue: number;
  total_teacher_payouts: number;
  commission_percentage: number;
}

export interface CalculationResponse {
  amount: number;
  net_revenue?: number; // For commission calculations
}
