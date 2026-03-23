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
  // Geofencing (optional — set to enable location validation on QR attendance)
  latitude?: number | null;
  longitude?: number | null;
  allowed_radius_meters?: number | null;
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

export type CheckInMethod = "MANUAL" | "STUDENT_QR" | "CLASSROOM_QR" | "SESSION_QR";

export interface Attendance {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  marked_by: string;
  check_in_method: CheckInMethod;
  check_in_time?: string | null;
  check_out_time?: string | null;
  check_in_lat?: number | null;
  check_in_lng?: number | null;
  check_out_lat?: number | null;
  check_out_lng?: number | null;
  created_at: string;
  updated_at: string;
  student?: Student;
  session?: ClassSession;
}

export interface SessionQRToken {
  id: string;
  session_id: string;
  token: string;
  expires_at: string;
  revoked_at?: string | null;
  attend_url: string;
}

export interface ScanAttendanceResponse {
  attendance_id: string;
  student_name: string;
  admission_no: string;
  status: AttendanceStatus;
  check_in_time: string;
  method: CheckInMethod;
  distance_meters?: number | null;
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
  staff_name: string;
  amount: number;
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

// ── Monthly Financial Overview ────────────────────────────────────────────────

export type ClassPayoutStatus = "PAID" | "PARTIAL" | "UNPAID";

export interface ClassBreakdownItem {
  class_id: string;
  class_name: string;
  teacher_id: string;
  teacher_name: string;
  payout_percentage: number;
  student_count: number;
  total_revenue: number;
  expected_payout: number;
  actual_payout: number;
  payout_status: ClassPayoutStatus;
}

export interface MonthlyOverviewResponse {
  month: string; // YYYY-MM
  total_student_revenue: number;
  total_admission_fees: number;
  total_collected: number;
  total_teacher_payouts: number;
  net_revenue: number;
  total_staff_commissions: number;
  total_expenses: number;
  institute_income: number;
  class_breakdown: ClassBreakdownItem[];
  expense_by_category: Record<string, number>;
  generated_at: string;
}

// ── ICBT Dashboard Types ──────────────────────────────────────────────────────

export interface DashboardKPIs {
  enrolledStudents: number;
  enrolledStudentsDelta: number; // % change vs last month
  activeLecturers: number;
  activeLecturersDelta: number;
  todaysSessions: number;
  todaysSessionsBreakdown: {
    scheduled: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  occupiedClassrooms: number;
  totalClassrooms: number;
}

export interface ClassroomUtilizationData {
  classroomName: string;
  utilizationPercent: number;
  sessionsHeld: number;
  totalCapacityHours: number;
}

export interface AttendanceTrendPoint {
  week: string; // "W10"
  attendancePercent: number;
  sessionCount: number;
}

export interface LectureHoursData {
  lecturerName: string;
  subject: string;
  allocatedHours: number;
  conductedHours: number;
}

export interface RevenueSnapshotData {
  studentRevenue: number;
  teacherPayouts: number;
  staffCommissions: number;
  expenses: number;
  netIncome: number;
}

export interface TodaySession {
  sessionId: string;
  subjectName: string;
  lecturerName: string;
  classroom: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  enrolledCount: number;
}

export interface QuickSearchResult {
  students: Array<{
    id: string;
    name: string;
    admissionNo: string;
    programme: string;
  }>;
  lecturers: Array<{
    id: string;
    name: string;
    subjects: string[];
  }>;
  classrooms: Array<{
    id: string;
    name: string;
    capacity: number;
    currentStatus: string;
  }>;
}

// ── Phase 1: Classroom Management ────────────────────────────────────────────

export interface ClassroomUtility {
  id: string;
  classroom_id: string;
  utility_type: "AC" | "PROJECTOR" | "SMARTBOARD" | "WHITEBOARD" | "OTHER";
  quantity: number;
  is_functional: boolean;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClassroomMaintenanceRecord {
  id: string;
  classroom_id: string;
  title: string;
  description: string;
  reported_by_id: string;
  status: "REPORTED" | "IN_PROGRESS" | "COMPLETED";
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  reported_by?: { id: string; username: string; name: string };
}

// ── Conflict Detection ────────────────────────────────────────────────────────

export interface ConflictSummary {
  id: string;
  type: "DOUBLE_BOOKING" | "TEACHER_OVERLAP" | "ROOM_CONFLICT";
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "RESOLVED" | "IGNORED";
  className: string;
  teacherName: string;
  roomName: string;
  day: string;
  timeSlot: string;
}

// ── Class Enrollment Stats ─────────────────────────────────────────────────────

export interface ClassEnrollmentStat {
  className: string;
  enrolled: number;
  capacity: number;
  fillStatus: "FULL" | "HALF_FULL" | "LOW";
}

// ── Classroom Allocation Table ────────────────────────────────────────────────

export interface ClassroomAllocationRow {
  room: string;
  capacity: number;
  className: string;
  teacherName: string;
  day: string;
  time: string;
  studentsCount: number;
  utilizationPercent: number;
}

// ── Teacher Utilization ───────────────────────────────────────────────────────

export interface TeacherUtilizationData {
  teacherName: string;
  subject: string;
  assignedHours: number;
  conductedHours: number;
  utilizationPercent: number;
}

// ── Teacher Assignment Table ──────────────────────────────────────────────────

export interface TeacherAssignmentRow {
  teacherName: string;
  subject: string;
  className: string;
  day: string;
  time: string;
  room: string;
  studentsCount: number;
}

export interface ClassRevenueResponse {
  class_id: string;
  class_name: string;
  teacher_id: string;
  teacher_name: string;
  payout_percentage: number;
  student_count: number;
  total_revenue: number;
  expected_payout: number;
  actual_payout: number;
  net_remaining: number;
}

// ── Phase 2: Scheduling Engine ────────────────────────────────────────────────

export interface Semester {
  id: string;
  name: string;
  start_date: string; // ISO date
  end_date: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  schedule_count?: number;
}

export interface CreateSemesterRequest {
  name: string;
  start_date: string;
  end_date: string;
}

export interface UpdateSemesterRequest {
  name?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface ConflictDetail {
  type: "DOUBLE_BOOKING" | "TEACHER_OVERLAP" | "ROOM_CONFLICT";
  severity: "HIGH" | "MEDIUM" | "LOW";
  session_id: string;
  class_name: string;
  day?: number;
  date?: string;
  start_time: string;
  end_time: string;
  room_name: string;
  description: string;
}

export interface CollisionResult {
  has_conflict: boolean;
  conflicts: ConflictDetail[];
}

export interface CheckCollisionRequest {
  classroom_id: string;
  day_of_week?: number;
  session_date?: string; // YYYY-MM-DD for session-based checks
  start_time: string;
  end_time: string;
  exclude_schedule_id?: string;
  exclude_session_id?: string;
}

export interface DelaySessionRequest {
  minutes: number;
  reason?: string;
}

export interface RescheduleSessionRequest {
  new_date: string; // YYYY-MM-DD
  new_start_time: string;
  new_end_time: string;
  reason?: string;
}

export interface ExtendSessionRequest {
  extra_minutes: number;
  reason?: string;
}

export interface RoomChangeRequest {
  session_id: string;
  new_room_id: string;
  reason?: string;
}

export interface ScheduleOverride {
  id: string;
  session_id: string;
  type: "DELAY" | "RESCHEDULE" | "EXTEND" | "ROOM_CHANGE" | "CANCELLATION";
  old_date?: string;
  new_date?: string;
  old_start_time?: string;
  new_start_time?: string;
  old_end_time?: string;
  new_end_time?: string;
  old_room_name?: string;
  new_room_name?: string;
  reason?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  // Session context
  class_name?: string;
  session_date?: string;
}

export interface ConflictRecord {
  id: string;
  type: "DOUBLE_BOOKING" | "TEACHER_OVERLAP" | "ROOM_CONFLICT";
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "RESOLVED" | "IGNORED";
  description: string;
  session_a_id: string;
  session_b_id?: string;
  session_a_class?: string;
  session_a_date?: string;
  session_a_time?: string;
  session_b_class?: string;
  session_b_date?: string;
  session_b_time?: string;
  resolved_by?: string;
  resolved_by_name?: string;
  resolved_at?: string;
  created_at: string;
}

// ── Phase 3: Lecturer Management ──────────────────────────────────────────────

export interface LecturerSubjectAllocation {
  id: string;
  teacher_id: string;
  teacher_name?: string;
  subject_id: string;
  subject_name?: string;
  semester_id: string;
  semester_name?: string;
  weekly_hours_allocated: number;
  total_hours_allocated: number;
  conducted_hours: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAllocationRequest {
  teacher_id: string;
  subject_id: string;
  semester_id: string;
  weekly_hours_allocated: number;
  total_hours_allocated: number;
}

export interface UpdateAllocationRequest {
  weekly_hours_allocated?: number;
  total_hours_allocated?: number;
}

export interface CurriculumItem {
  id: string;
  allocation_id: string;
  topic: string;
  description?: string;
  week_number: number;
  is_completed: boolean;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  subject_name?: string;
}

export interface CreateCurriculumItemRequest {
  allocation_id: string;
  topic: string;
  description?: string;
  week_number: number;
}

export interface UpdateCurriculumItemRequest {
  topic?: string;
  description?: string;
  week_number?: number;
  is_completed?: boolean;
}

export interface LectureDailyReport {
  id: string;
  teacher_id: string;
  teacher_name?: string;
  session_id?: string;
  session_date?: string;
  class_name?: string;
  topics_covered: string;
  notes?: string;
  submitted_at: string;
  created_by: string;
  created_at: string;
}

export interface CreateDailyReportRequest {
  teacher_id: string;
  session_id?: string;
  topics_covered: string;
  notes?: string;
}

export interface StudentResult {
  id: string;
  student_id: string;
  student_name?: string;
  subject_id: string;
  subject_name?: string;
  semester_id: string;
  exam_type: "MIDTERM" | "FINAL" | "QUIZ" | "ASSIGNMENT";
  score: number;
  max_score: number;
  percentage: number;
  date: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentResultRequest {
  student_id: string;
  subject_id: string;
  semester_id: string;
  exam_type: "MIDTERM" | "FINAL" | "QUIZ" | "ASSIGNMENT";
  score: number;
  max_score: number;
  date: string;
  notes?: string;
}

export interface UpdateStudentResultRequest {
  exam_type?: string;
  score?: number;
  max_score?: number;
  date?: string;
  notes?: string;
}

export interface LecturerHoursEntry {
  subject_id: string;
  subject_name: string;
  allocated: number;
  conducted: number;
  remaining: number;
  percent_done: number;
}

export interface LecturerHoursResponse {
  teacher_id: string;
  teacher_name: string;
  semester_id?: string;
  semester_name?: string;
  subjects: LecturerHoursEntry[];
  total_allocated: number;
  total_conducted: number;
}

export interface LecturerEffectivenessEntry {
  subject_id: string;
  subject_name: string;
  exam_type: string;
  avg_score: number;
  max_score: number;
  avg_percent: number;
  count: number;
}

export interface LecturerEffectivenessResponse {
  teacher_id: string;
  teacher_name: string;
  results: LecturerEffectivenessEntry[];
}

export interface LecturerProfile {
  teacher: Teacher;
  allocations: LecturerSubjectAllocation[];
  open_curriculum: CurriculumItem[];
  recent_reports: LectureDailyReport[];
}
