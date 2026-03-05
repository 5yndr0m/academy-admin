import { Classroom, Teacher, Student } from '@/types';
import { apiClient } from './api-client';

class DataService {
    async getClassrooms(): Promise<Classroom[]> {
        return apiClient.get<Classroom[]>('/classrooms');
    }

    async addClassroom(classroom: Omit<Classroom, 'id' | 'status'>): Promise<Classroom> {
        return apiClient.post<Classroom>('/classrooms', classroom);
    }

    async toggleClassroomStatus(id: string): Promise<Classroom | undefined> {
        return apiClient.put<Classroom>(`/classrooms/${id}/toggle-status`);
    }

    async getAuditLogs(): Promise<import('@/types').AuditLog[]> {
        return apiClient.get<import('@/types').AuditLog[]>('/audit-logs');
    }

    async getCommunicationLogs(studentId: string): Promise<import('@/types').CommunicationLog[]> {
        return apiClient.get<import('@/types').CommunicationLog[]>(`/students/${studentId}/communication-logs`);
    }

    async getTeacherPayouts(): Promise<import('@/types').TeacherPayout[]> {
        return apiClient.get<import('@/types').TeacherPayout[]>('/teachers/payouts');
    }

    async logAction(action: string, user: string, category: import('@/types').AuditLog['category']): Promise<void> {
        return apiClient.post('/audit-logs', { action, user, category });
    }

    async getPackages(): Promise<import('@/types').ClassPackage[]> {
        return apiClient.get<import('@/types').ClassPackage[]>('/packages');
    }

    async getStaff(): Promise<import('@/types').Staff[]> {
        return apiClient.get<import('@/types').Staff[]>('/staff');
    }

    async generateMonthlyBills(studentId: string): Promise<void> {
        return apiClient.post(`/students/${studentId}/generate-bills`);
    }

    async getTeachers(): Promise<Teacher[]> {
        return apiClient.get<Teacher[]>('/teachers');
    }

    async addTeacher(teacher: Omit<Teacher, 'id' | 'schedule'>): Promise<Teacher> {
        return apiClient.post<Teacher>('/teachers', teacher);
    }

    async addScheduleSlot(teacherId: string, slot: Omit<import('@/types').ScheduleSlot, 'id' | 'teacherId'>): Promise<import('@/types').ScheduleSlot> {
        return apiClient.post<import('@/types').ScheduleSlot>(`/teachers/${teacherId}/schedule`, slot);
    }

    async removeScheduleSlot(teacherId: string, slotId: string): Promise<void> {
        return apiClient.delete(`/teachers/${teacherId}/schedule/${slotId}`);
    }

    async getStudents(): Promise<Student[]> {
        return apiClient.get<Student[]>('/students');
    }

    async getStudentById(id: string): Promise<Student | undefined> {
        return apiClient.get<Student>(`/students/${id}`);
    }

    async addStudent(student: Omit<Student, 'id' | 'enrolledSubjects'> & { subjects: string[] }): Promise<Student> {
        return apiClient.post<Student>('/students', student);
    }

    async updateStudentPayment(studentId: string, subjectName: string, month: string, status: 'Paid' | 'Pending' | 'Overdue'): Promise<void> {
        return apiClient.patch(`/students/${studentId}/payments`, { subjectName, month, status });
    }

    async markAttendance(studentId: string, subjectName: string, date: string, present: boolean, triggeredBy: string = 'Staff'): Promise<void> {
        return apiClient.post('/attendance', { studentId, subjectName, date, present, triggeredBy });
    }

    async getSubjects(): Promise<string[]> {
        return apiClient.get<string[]>('/subjects');
    }

    async getDashboardStats() {
        return apiClient.get<{ students: number; teachers: number; classroomsTotal: number; classroomsInUse: number }>('/dashboard/stats');
    }

    async getTodaySchedule(): Promise<{
        id: string;
        time: string;
        subject: string;
        teacherName: string;
        classroomName: string | undefined
    }[]> {
        return apiClient.get('/dashboard/today-schedule');
    }
}

export const mockDataService = new DataService();
