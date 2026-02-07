import { Classroom, Teacher, Student } from '@/types';

class MockDataService {
    private classrooms: Classroom[] = [
        { id: '1', name: 'Room 101', capacity: 30, status: 'Free' },
        { id: '2', name: 'Computer Lab A', capacity: 25, status: 'In Use' },
        { id: '3', name: 'Physics Lab', capacity: 20, status: 'Free' },
        { id: '4', name: 'Room 202', capacity: 40, status: 'Free' },
        { id: '5', name: 'Room 305', capacity: 30, status: 'In Use' },
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
                    startTime: new Date('2024-01-01T09:00:00'),
                    endTime: new Date('2024-01-01T10:30:00'),
                }
            ]
        },
        {
            id: '2',
            fullName: 'Jane Smith',
            contactNumber: '555-0102',
            email: 'jane.smith@academy.com',
            subjects: ['English', 'Literature'],
            schedule: []
        }
    ];

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
                    attendance: [],
                    payments: [
                        { month: '2024-01', amount: 100, status: 'Paid' },
                        { month: '2024-02', amount: 100, status: 'Pending' }
                    ]
                },
                {
                    subjectName: 'Physics',
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
                    attendance: [],
                    payments: [
                        { month: '2024-01', amount: 90, status: 'Overdue' }
                    ]
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
}

export const mockDataService = new MockDataService();
