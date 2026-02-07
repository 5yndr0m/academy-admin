'use client';

import { StudentList } from "@/components/students/StudentList";
import { AddStudentDialog } from "@/components/students/AddStudentDialog";

export default function StudentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Students</h2>
                    <p className="text-slate-500">
                        Manage student enrollment and fee payments.
                    </p>
                </div>
                <AddStudentDialog />
            </div>

            <StudentList />
        </div>
    );
}
