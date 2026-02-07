'use client';

import { AttendanceManager } from "@/components/attendance/AttendanceManager";

export default function AttendancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
                <p className="text-slate-500">
                    Mark daily attendance for each subject class.
                </p>
            </div>

            <AttendanceManager />
        </div>
    );
}
