'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockDataService } from '@/lib/data';
import { Student } from '@/types';
import { Loader2 } from 'lucide-react';
import { StudentDetailsSheet } from './StudentDetailsSheet';

export function StudentList() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const data = await mockDataService.getStudents();
        setStudents(data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Roster</CardTitle>
                <CardDescription>View all enrolled students and manage their details.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Guardian</TableHead>
                            <TableHead>Subjects</TableHead>
                            <TableHead className="text-right">View</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    <div className="font-medium">{student.fullName}</div>
                                    <div className="text-xs text-slate-500">{student.contactNumber}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{student.guardianName}</div>
                                    <div className="text-xs text-slate-500">{student.guardianContact}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {student.enrolledSubjects.map(sub => (
                                            <Badge key={sub.subjectName} variant="secondary" className="font-normal text-xs">
                                                {sub.subjectName}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <StudentDetailsSheet
                                        student={student}
                                        onUpdate={loadData}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
