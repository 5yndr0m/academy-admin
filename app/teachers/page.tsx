'use client';

import { TeacherList } from "@/components/teachers/TeacherList";
import { AddTeacherDialog } from "@/components/teachers/AddTeacherDialog";

export default function TeachersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
                    <p className="text-slate-500">
                        Manage faculty and class schedules.
                    </p>
                </div>
                <AddTeacherDialog />
            </div>

            <TeacherList />
        </div>
    );
}
