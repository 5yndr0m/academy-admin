'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockDataService } from '@/lib/data';
import { Loader2 } from 'lucide-react';

interface WeekSlot {
    time: string;
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
}

export function WeekTimetable() {
    const [schedule, setSchedule] = useState<WeekSlot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWeek = async () => {
            setLoading(true);
            // In a real app, this would be a proper join query.
            // Here, we just scaffold a mock week view based on "Today's" mock structure repeated or randomized for demo.
            // Since our mock data only has "startTime" dates, we'll simulate a week view by pretending the same schedule repeats or distributing it.

            const teachers = await mockDataService.getTeachers();
            const classrooms = await mockDataService.getClassrooms();

            // Define time slots
            const times = [
                "09:00 - 10:30",
                "11:00 - 12:30",
                "13:00 - 14:30",
                "14:00 - 15:30"
            ];

            const weekData: WeekSlot[] = times.map(t => ({
                time: t,
                monday: '',
                tuesday: '',
                wednesday: '',
                thursday: '',
                friday: ''
            }));

            // Mock populating the grid with random classes from our teachers for demo visual
            // Real implementation would look at actual dates.

            weekData[0].monday = "Math (John) - Room 101";
            weekData[0].wednesday = "Math (John) - Room 101";
            weekData[0].friday = "Physics (John) - Room 102";

            weekData[1].tuesday = "English (Jane) - Room 103";
            weekData[1].thursday = "Literature (Jane) - Room 103";

            weekData[2].monday = "Biology (Robert) - Room 103";
            weekData[2].wednesday = "Chemistry (Robert) - Room 103";

            weekData[3].tuesday = "History (Emily) - Lab A";
            weekData[3].friday = "Comp Sci (Michael) - Lab A";

            setSchedule(weekData);
            setLoading(false);
        };

        loadWeek();
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
                <CardTitle>Weekly Master Schedule</CardTitle>
                <CardDescription>Overview of all classes for the current week.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Time</TableHead>
                                <TableHead>Monday</TableHead>
                                <TableHead>Tuesday</TableHead>
                                <TableHead>Wednesday</TableHead>
                                <TableHead>Thursday</TableHead>
                                <TableHead>Friday</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedule.map((slot, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                                        {slot.time}
                                    </TableCell>
                                    <TableCell>{slot.monday && <Badge variant="secondary" className="font-normal text-[10px] whitespace-nowrap">{slot.monday}</Badge>}</TableCell>
                                    <TableCell>{slot.tuesday && <Badge variant="secondary" className="font-normal text-[10px] whitespace-nowrap">{slot.tuesday}</Badge>}</TableCell>
                                    <TableCell>{slot.wednesday && <Badge variant="secondary" className="font-normal text-[10px] whitespace-nowrap">{slot.wednesday}</Badge>}</TableCell>
                                    <TableCell>{slot.thursday && <Badge variant="secondary" className="font-normal text-[10px] whitespace-nowrap">{slot.thursday}</Badge>}</TableCell>
                                    <TableCell>{slot.friday && <Badge variant="secondary" className="font-normal text-[10px] whitespace-nowrap">{slot.friday}</Badge>}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
