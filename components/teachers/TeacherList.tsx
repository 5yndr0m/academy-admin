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
import { Teacher, Classroom } from '@/types';
import { Loader2, Mail } from 'lucide-react';
import { ScheduleManager } from './ScheduleManager';

export function TeacherList() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        const [teachersData, classroomsData] = await Promise.all([
            mockDataService.getTeachers(),
            mockDataService.getClassrooms()
        ]);
        setTeachers(teachersData);
        setClassrooms(classroomsData);
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
                <CardTitle>Faculty Directory</CardTitle>
                <CardDescription>Manage teachers and their schedules.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Subjects</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teachers.map((teacher) => (
                            <TableRow key={teacher.id}>
                                <TableCell>
                                    <div className="font-medium">{teacher.fullName}</div>
                                    <div className="text-xs text-slate-500">{teacher.email}</div>
                                </TableCell>
                                <TableCell>{teacher.contactNumber}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {teacher.subjects.map(sub => (
                                            <Badge key={sub} variant="outline" className="font-normal">
                                                {sub}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <ScheduleManager
                                        teacher={teacher}
                                        classrooms={classrooms}
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
