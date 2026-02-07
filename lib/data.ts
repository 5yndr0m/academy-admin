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

    // Placeholder for future methods
    async getTeachers(): Promise<Teacher[]> { return []; }
    async getStudents(): Promise<Student[]> { return []; }
}

export const mockDataService = new MockDataService();
