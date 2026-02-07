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

export interface Teacher {
  id: string;
  fullName: string;
  contactNumber: string;
  email: string;
  subjects: string[];
  schedule: ScheduleSlot[];
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
