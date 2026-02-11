export type ClassroomStatus = 'Free' | 'In Use';

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  status: ClassroomStatus;
}

export interface TimeSlot {
  start: string; // ISO String or "HH:mm"
  end: string;   // ISO String or "HH:mm"
  dayOfWeek: number; // 0-6 (Sun-Sat)
}

export interface ScheduleSlot {
  id: string;
  teacherId: string;
  classroomId?: string; // Optional if not yet assigned
  subject: string;
  startTime: Date;
  endTime: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  category: 'Billing' | 'Attendance' | 'Staff' | 'System';
}

export interface CommunicationLog {
  id: string;
  studentId: string;
  type: 'SMS' | 'Email';
  recipient: string;
  subject: string;
  timestamp: string;
  status: 'Sent' | 'Failed';
}

export interface TeacherPayout {
  id: string;
  teacherId: string;
  month: string; // YYYY-MM
  amount: number;
  classCount: number;
  status: 'Paid' | 'Pending';
}

export interface Teacher {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string;
  subjects: string[];
  schedule: ScheduleSlot[];
  baseRatePerClass?: number; // Added for payout calculation
}

export type UserRole = 'Admin' | 'Staff';

export interface Staff {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string;
  role: UserRole;
  basicSalary: number;
  status: 'Active' | 'Inactive';
}

export type BillingFrequency = 'Monthly' | 'Session';

export interface ClassPackage {
  id: string;
  title: string;
  fee: number;
  frequency: BillingFrequency;
  validityPeriod?: string; // e.g., "6 months", "Lifetime"
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  present: boolean;
}

export interface PaymentRecord {
  month: string; // YYYY-MM
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface StudentSubject {
  subjectName: string;
  packageId: string;
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
}

export interface Student {
  id: string;
  fullName: string;
  contactNumber: string;
  guardianName: string;
  guardianContact: string;
  enrolledSubjects: StudentSubject[];
}
