'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { UserCheck, BookOpen, Percent } from 'lucide-react';
import { mockDataService } from '@/lib/data';
import { Student } from '@/types';

export function AttendanceReport() {
    const [stats, setStats] = useState<any[]>([]);

    useEffect(() => {
        const loadStats = async () => {
            const students = await mockDataService.getStudents();
            const subjectStats: Record<string, { total: number; present: number }> = {};

            students.forEach((student: Student) => {
                student.enrolledSubjects.forEach((sub) => {
                    if (!subjectStats[sub.subjectName]) {
                        subjectStats[sub.subjectName] = { total: 0, present: 0 };
                    }
                    sub.attendance.forEach((att) => {
                        subjectStats[sub.subjectName].total++;
                        if (att.present) subjectStats[sub.subjectName].present++;
                    });
                });
            });

            const formatted = Object.entries(subjectStats).map(([name, data]) => ({
                name,
                percentage: data.total > 0 ? (data.present / data.total) * 100 : 0,
                total: data.total,
                present: data.present
            }));

            setStats(formatted);
        };
        loadStats();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Attendance Analytics
                </CardTitle>
                <CardDescription>
                    Summary of student attendance across all subjects.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Attendance Rate</TableHead>
                            <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {stats.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground italic">
                                    No attendance data available for analysis.
                                </TableCell>
                            </TableRow>
                        ) : (
                            stats.map((stat) => (
                                <TableRow key={stat.name}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        {stat.name}
                                    </TableCell>
                                    <TableCell className="w-[300px]">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all overflow-hidden"
                                                    style={{ width: `${stat.percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold w-12">{stat.percentage.toFixed(0)}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground">
                                        {stat.present} / {stat.total} sessions
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
