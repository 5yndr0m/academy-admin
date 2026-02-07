'use client';

import { useEffect, useState } from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockDataService } from '@/lib/data';
import { Student } from '@/types';
import { Loader2 } from 'lucide-react';

export function AttendanceManager() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [subjects, setSubjects] = useState<string[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        const [subData, stuData] = await Promise.all([
            mockDataService.getSubjects(),
            mockDataService.getStudents()
        ]);
        setSubjects(subData);
        setStudents(stuData);
        if (subData.length > 0) setSelectedSubject(subData[0]);
        setLoading(false);
    };

    const getEnrolledStudents = () => {
        if (!selectedSubject) return [];
        return students.filter(s => s.enrolledSubjects.some(sub => sub.subjectName === selectedSubject));
    };

    const isPresent = (student: Student) => {
        if (!selectedSubject || !date) return false;
        const dateStr = format(date, 'yyyy-MM-dd');
        const subject = student.enrolledSubjects.find(s => s.subjectName === selectedSubject);
        return subject?.attendance.some(a => a.date === dateStr && a.present) || false;
    };

    const handleToggleAttendance = async (studentId: string, currentStatus: boolean) => {
        if (!selectedSubject || !date) return;
        const dateStr = format(date, 'yyyy-MM-dd');
        setSaving(studentId);

        await mockDataService.markAttendance(studentId, selectedSubject, dateStr, !currentStatus);

        // Refresh local state (optimistic or re-fetch)
        // For simplicity, we just re-fetch students to keep sync
        const updatedStudents = await mockDataService.getStudents();
        setStudents(updatedStudents);
        setSaving(null);
    };

    const markAll = async (present: boolean) => {
        if (!selectedSubject || !date) return;
        const dateStr = format(date, 'yyyy-MM-dd');
        const enrolled = getEnrolledStudents();

        setLoading(true);
        await Promise.all(enrolled.map(s =>
            mockDataService.markAttendance(s.id, selectedSubject, dateStr, present)
        ));
        const updatedStudents = await mockDataService.getStudents();
        setStudents(updatedStudents);
        setLoading(false);
    }

    if (loading && subjects.length === 0) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const enrolledStudents = getEnrolledStudents();

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex gap-4 items-center">
                    <div className="w-[200px]">
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => markAll(false)}>
                        Mark All Absent
                    </Button>
                    <Button size="sm" onClick={() => markAll(true)}>
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark All Present
                    </Button>
                </div>
            </div>

            {/* Roster */}
            <Card>
                <CardHeader>
                    <CardTitle>Class Roster</CardTitle>
                    <CardDescription>
                        {selectedSubject} • {date ? format(date, "MMMM do, yyyy") : "Select a date"} • {enrolledStudents.length} Students
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Status</TableHead>
                                <TableHead>Student Name</TableHead>
                                <TableHead>Guardian Contact</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {enrolledStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-slate-500">
                                        No students enrolled in this subject.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                enrolledStudents.map(student => {
                                    const present = isPresent(student);
                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    {saving === student.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                                    ) : (
                                                        <Checkbox
                                                            checked={present}
                                                            onCheckedChange={() => handleToggleAttendance(student.id, present)}
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {student.fullName}
                                                {present && <span className="ml-2 text-xs text-green-600 font-normal bg-green-50 px-2 py-0.5 rounded-full">Present</span>}
                                            </TableCell>
                                            <TableCell className="text-slate-500">{student.guardianContact}</TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
