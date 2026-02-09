import { Classroom, Teacher, Student } from '@/types';

class MockDataService {
    private classrooms: Classroom[] = [
        { id: '1', name: 'Room 101', capacity: 30, status: 'Free' },
        { id: '2', name: 'Computer Lab A', capacity: 25, status: 'In Use' },
        { id: '3', name: 'Physics Lab', capacity: 20, status: 'Free' },
        { id: '4', name: 'Room 202', capacity: 40, status: 'Free' },
        { id: '5', name: 'Room 305', capacity: 30, status: 'In Use' },
    ];

    private packages: import('@/types').ClassPackage[] = [
        { id: 'p1', title: 'Standard Monthly', fee: 100, frequency: 'Monthly' },
        { id: 'p2', title: 'Intensive Monthly', fee: 180, frequency: 'Monthly' },
        { id: 'p3', title: 'Single Session', fee: 25, frequency: 'Session' },
    ];

    private staff: import('@/types').Staff[] = [
        { id: 'st1', fullName: 'Admin User', email: 'admin@academy.com', contactNumber: '555-9001', role: 'Admin', basicSalary: 5000, status: 'Active' },
        { id: 'st2', fullName: 'Sarah Clerk', email: 'sarah@academy.com', contactNumber: '555-9002', role: 'Staff', basicSalary: 3000, status: 'Active' },
    ];

    async getClassrooms(): Promise<Classroom[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.classrooms]), 500);
        });
    }

    async addClassroom(classroom: Omit<Classroom, 'id' | 'status'>): Promise<Classroom> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newClassroom: Classroom = {
                    ...classroom,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'Free',
                };
                this.classrooms.push(newClassroom);
                resolve(newClassroom);
            }, 500);
        });
    }

    async toggleClassroomStatus(id: string): Promise<Classroom | undefined> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const classroom = this.classrooms.find((c) => c.id === id);
                if (classroom) {
                    classroom.status = classroom.status === 'Free' ? 'In Use' : 'Free';
                    resolve(classroom);
                } else {
                    resolve(undefined);
                }
            }, 300);
        });
    }

    async getPackages(): Promise<import('@/types').ClassPackage[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.packages]), 300);
        });
    }

    async getStaff(): Promise<import('@/types').Staff[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.staff]), 300);
        });
    }

    // Teacher Data
    private teachers: Teacher[] = [
        {
            id: '1',
            fullName: 'John Doe',
            contactNumber: '555-0101',
            email: 'john.doe@academy.com',
            subjects: ['Mathematics', 'Physics'],
            schedule: [
                {
                    id: 's1',
                    teacherId: '1',
                    classroomId: '1',
                    subject: 'Mathematics',
                    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
                    endTime: new Date(new Date().setHours(10, 30, 0, 0)),
                },
                {
                    id: 's2',
                    teacherId: '1',
                    classroomId: '2',
                    subject: 'Physics',
                    startTime: new Date(new Date().setHours(11, 0, 0, 0)),
                    endTime: new Date(new Date().setHours(12, 30, 0, 0)),
                }
            ]
        },
        {
            id: '2',
            fullName: 'Jane Smith',
            contactNumber: '555-0102',
            email: 'jane.smith@academy.com',
            subjects: ['English', 'Literature'],
            schedule: [
                {
                    id: 's3',
                    teacherId: '2',
                    classroomId: '3',
                    subject: 'English',
                    startTime: new Date(new Date().setHours(9, 30, 0, 0)),
                    endTime: new Date(new Date().setHours(11, 0, 0, 0)),
                }
            ]
        },
        {
            id: '3',
            fullName: 'Robert Brown',
            contactNumber: '555-0103',
            email: 'robert.brown@academy.com',
            subjects: ['Chemistry', 'Biology'],
            schedule: [
                {
                    id: 's4',
                    teacherId: '3',
                    classroomId: '3',
                    subject: 'Biology',
                    startTime: new Date(new Date().setHours(13, 0, 0, 0)),
                    endTime: new Date(new Date().setHours(14, 30, 0, 0)),
                }
            ]
        },
        {
            id: '4',
            fullName: 'Emily White',
            contactNumber: '555-0104',
            email: 'emily.white@academy.com',
            subjects: ['History', 'Geography'],
            schedule: []
        },
        {
            id: '5',
            fullName: 'Michael Green',
            contactNumber: '555-0105',
            email: 'michael.green@academy.com',
            subjects: ['Computer Science', 'Mathematics'],
            schedule: [
                {
                    id: 's5',
                    teacherId: '5',
                    classroomId: '2',
                    subject: 'Computer Science',
                    startTime: new Date(new Date().setHours(14, 0, 0, 0)),
                    endTime: new Date(new Date().setHours(15, 30, 0, 0)),
                }
            ]
        }
    ];

    async generateMonthlyBills(studentId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const student = this.students.find(s => s.id === studentId);
                if (!student) return reject(new Error('Student not found'));

                const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

                student.enrolledSubjects.forEach(subject => {
                    const pkg = this.packages.find(p => p.id === subject.packageId);
                    if (!pkg) return;

                    // Check if payment for current month already exists
                    const existingPayment = subject.payments.find(p => p.month === currentMonth);
                    if (!existingPayment) {
                        subject.payments.push({
                            month: currentMonth,
                            amount: pkg.fee,
                            status: 'Pending'
                        });
                    }
                });
                resolve();
            }, 500);
        });
    }

    async getTeachers(): Promise<Teacher[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.teachers]), 500);
        });
    }

    async addTeacher(teacher: Omit<Teacher, 'id' | 'schedule'>): Promise<Teacher> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTeacher: Teacher = {
                    ...teacher,
                    id: Math.random().toString(36).substr(2, 9),
                    schedule: [],
                };
                this.teachers.push(newTeacher);
                resolve(newTeacher);
            }, 500);
        });
    }

    async addScheduleSlot(teacherId: string, slot: Omit<import('@/types').ScheduleSlot, 'id' | 'teacherId'>): Promise<import('@/types').ScheduleSlot> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const teacher = this.teachers.find(t => t.id === teacherId);
                if (teacher) {
                    const newSlot = {
                        ...slot,
                        id: Math.random().toString(36).substr(2, 9),
                        teacherId,
                    };
                    teacher.schedule.push(newSlot);
                    resolve(newSlot);
                }
            }, 300);
        });
    }

    async removeScheduleSlot(teacherId: string, slotId: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const teacher = this.teachers.find(t => t.id === teacherId);
                if (teacher) {
                    teacher.schedule = teacher.schedule.filter(s => s.id !== slotId);
                    resolve();
                }
            }, 300);
        });
    }

    // Student Data
    private students: Student[] = [
        {
            id: '1',
            fullName: 'Bobby Tables',
            contactNumber: '555-1001',
            guardianName: 'Robert Tables',
            guardianContact: '555-2001',
            enrolledSubjects: [
                {
                    subjectName: 'Mathematics',
                    packageId: 'p1',
                    attendance: [],
                    payments: [
                        { month: '2024-01', amount: 100, status: 'Paid' },
                        { month: '2024-02', amount: 100, status: 'Pending' }
                    ]
                },
                {
                    subjectName: 'Physics',
                    packageId: 'p2',
                    attendance: [],
                    payments: [
                        { month: '2024-01', amount: 120, status: 'Paid' }
                    ]
                }
            ]
        },
        {
            id: '2',
            fullName: 'Alice Wonderland',
            contactNumber: '555-1002',
            guardianName: 'Lewis Carroll',
            guardianContact: '555-2002',
            enrolledSubjects: [
                {
                    subjectName: 'English',
                    packageId: 'p1',
                    attendance: [],
                    payments: [
                        { month: '2024-01', amount: 90, status: 'Overdue' }
                    ]
                }
            ]
        },
        {
            id: '3',
            fullName: 'Charlie Brown',
            contactNumber: '555-1003',
            guardianName: 'Snoopy',
            guardianContact: '555-2003',
            enrolledSubjects: [
                {
                    subjectName: 'Mathematics',
                    packageId: 'p1',
                    attendance: [],
                    payments: []
                },
                {
                    subjectName: 'Computer Science',
                    packageId: 'p2',
                    attendance: [],
                    payments: []
                }
            ]
        },
        {
            id: '4',
            fullName: 'Diana Prince',
            contactNumber: '555-1004',
            guardianName: 'Hippolyta',
            guardianContact: '555-2004',
            enrolledSubjects: [
                {
                    subjectName: 'History',
                    packageId: 'p1',
                    attendance: [],
                    payments: []
                },
                {
                    subjectName: 'Geography',
                    packageId: 'p1',
                    attendance: [],
                    payments: []
                }
            ]
        },
        {
            id: '5',
            fullName: 'Evan Wright',
            contactNumber: '555-1005',
            guardianName: 'Martha Wright',
            guardianContact: '555-2005',
            enrolledSubjects: [
                {
                    subjectName: 'Physics',
                    packageId: 'p2',
                    attendance: [],
                    payments: []
                },
                {
                    subjectName: 'Chemistry',
                    packageId: 'p2',
                    attendance: [],
                    payments: []
                }
            ]
        },
        {
            id: '6',
            fullName: 'Fiona Gallagher',
            contactNumber: '555-1006',
            guardianName: 'Frank Gallagher',
            guardianContact: '555-2006',
            enrolledSubjects: [
                {
                    subjectName: 'Mathematics',
                    packageId: 'p1',
                    attendance: [],
                    payments: []
                }
            ]
        },
        {
            id: '7',
            fullName: 'George Weasley',
            contactNumber: '555-1007',
            guardianName: 'Molly Weasley',
            guardianContact: '555-2007',
            enrolledSubjects: [
                {
                    subjectName: 'Magic',
                    packageId: 'p3',
                    attendance: [],
                    payments: []
                }
            ]
        },
        {
            id: '8',
            fullName: 'Hannah Montana',
            contactNumber: '555-1008',
            guardianName: 'Robby Ray',
            guardianContact: '555-2008',
            enrolledSubjects: [
                {
                    subjectName: 'Music',
                    packageId: 'p3',
                    attendance: [],
                    payments: []
                }
            ]
        }
    ];

    async getStudents(): Promise<Student[]> {
        return new Promise((resolve) => {
            setTimeout(() => resolve([...this.students]), 500);
        });
    }

    async addStudent(student: Omit<Student, 'id' | 'enrolledSubjects'> & { subjects: string[] }): Promise<Student> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newStudent: Student = {
                    id: Math.random().toString(36).substr(2, 9),
                    fullName: student.fullName,
                    contactNumber: student.contactNumber,
                    guardianName: student.guardianName,
                    guardianContact: student.guardianContact,
                    enrolledSubjects: student.subjects.map(sub => ({
                        subjectName: sub,
                        packageId: 'p1', // Default package
                        attendance: [],
                        payments: [
                            { month: new Date().toISOString().slice(0, 7), amount: 100, status: 'Pending' } // Default entry
                        ]
                    }))
                };
                this.students.push(newStudent);
                resolve(newStudent);
            }, 500);
        });
    }

    async updateStudentPayment(studentId: string, subjectName: string, month: string, status: 'Paid' | 'Pending' | 'Overdue'): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const student = this.students.find(s => s.id === studentId);
                if (student) {
                    const subject = student.enrolledSubjects.find(s => s.subjectName === subjectName);
                    if (subject) {
                        const payment = subject.payments.find(p => p.month === month);
                        if (payment) {
                            payment.status = status;
                        } else {
                            // Add new if not exists (for demo)
                            subject.payments.push({ month, amount: 100, status });
                        }
                    }
                }
                resolve();
            }, 300);
        });
    }

    async markAttendance(studentId: string, subjectName: string, date: string, present: boolean): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const student = this.students.find(s => s.id === studentId);
                if (student) {
                    const subject = student.enrolledSubjects.find(s => s.subjectName === subjectName);
                    if (subject) {
                        const record = subject.attendance.find(a => a.date === date);
                        if (record) {
                            record.present = present;
                        } else {
                            subject.attendance.push({ date, present });
                        }
                    }
                }
                resolve();
            }, 200);
        });
    }

    async getSubjects(): Promise<string[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const subjects = new Set<string>();
                this.teachers.forEach(t => t.subjects.forEach(s => subjects.add(s)));
                this.students.forEach(s => s.enrolledSubjects.forEach(sub => subjects.add(sub.subjectName)));
                resolve(Array.from(subjects));
            }, 300);
        });
    }

    async getDashboardStats() {
        return new Promise<{ students: number; teachers: number; classroomsTotal: number; classroomsInUse: number }>((resolve) => {
            setTimeout(() => {
                resolve({
                    students: this.students.length,
                    teachers: this.teachers.length,
                    classroomsTotal: this.classrooms.length,
                    classroomsInUse: this.classrooms.filter(c => c.status === 'In Use').length,
                });
            }, 300);
        });
    }

    async getTodaySchedule(): Promise<{
        id: string;
        time: string;
        subject: string;
        teacherName: string;
        classroomName: string | undefined
    }[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const today = new Date();
                const dayOfWeek = today.getDay(); // 0-6
                const schedule: any[] = [];

                this.teachers.forEach(teacher => {
                    // Filter slots for today (dayOfWeek matches)
                    // Note: In our mock data we stored specific dates in startTime/endTime for simplicity in the ScheduleManager 
                    // but usually a recurring schedule uses dayOfWeek. 
                    // To make the Dashboard show something for "Today" regardless of the specific date set in the mock, 
                    // we will just pull ALL slots and pretend they are today for demonstration. 
                    // In a real app, we'd filter by dayOfWeek or specific date.

                    teacher.schedule.forEach(slot => {
                        // Mock logic: Show all slots as if they are today
                        // Sort by start time later
                        const start = new Date(slot.startTime);
                        const end = new Date(slot.endTime);
                        const timeString = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                        schedule.push({
                            id: slot.id,
                            time: timeString,
                            subject: slot.subject,
                            teacherName: teacher.fullName,
                            classroomName: this.classrooms.find(c => c.id === slot.classroomId)?.name || 'Unassigned',
                            rawStartTime: start // detailed sort helper
                        });
                    });
                });

                // Sort by time
                schedule.sort((a, b) => a.rawStartTime.getTime() - b.rawStartTime.getTime());

                resolve(schedule);
            }, 500);
        });
    }
}

export const mockDataService = new MockDataService();
