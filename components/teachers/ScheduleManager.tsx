'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Teacher, Classroom, ScheduleSlot } from '@/types';
import { mockDataService } from '@/lib/data';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';

interface ScheduleManagerProps {
    teacher: Teacher;
    classrooms: Classroom[];
    onUpdate: () => void;
}

export function ScheduleManager({ teacher, classrooms, onUpdate }: ScheduleManagerProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // New Slot State
    const [day, setDay] = useState<string>('1'); // Monday default
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [subject, setSubject] = useState('');
    const [classroomId, setClassroomId] = useState('');

    const days = [
        { value: '0', label: 'Sunday' },
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday' },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday' },
    ];

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!startTime || !endTime || !subject) return;

        setLoading(true);

        // Create Date objects for the next occurrence of this day and time
        // For specific date-time logic we would need a more robust calendar system
        // For this simple demo, we will just use dummy dates with correct times
        const start = new Date();
        const [startH, startM] = startTime.split(':').map(Number);
        start.setHours(startH, startM, 0);

        const end = new Date();
        const [endH, endM] = endTime.split(':').map(Number);
        end.setHours(endH, endM, 0);

        await mockDataService.addScheduleSlot(teacher.id, {
            subject,
            classroomId: classroomId || undefined,
            startTime: start,
            endTime: end,
        });

        setLoading(false);
        onUpdate();
        // Reset form form
        setSubject('');
    };

    const handleRemoveSlot = async (slotId: string) => {
        await mockDataService.removeScheduleSlot(teacher.id, slotId);
        onUpdate();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Manage Schedule
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Schedule: {teacher.fullName}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Add New Slot Form */}
                    <div className="bg-muted/40 p-4 rounded-lg border">
                        <h4 className="font-medium mb-3 text-sm">Add Class Slot</h4>
                        <form onSubmit={handleAddSlot} className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Day</Label>
                                <Select value={day} onValueChange={setDay}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map(d => (
                                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Subject</Label>
                                <Input
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="e.g. Math 101"
                                />
                            </div>
                            <div>
                                <Label>Start Time</Label>
                                <Input
                                    type="time"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>End Time</Label>
                                <Input
                                    type="time"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <Label>Classroom (Optional)</Label>
                                <Select value={classroomId} onValueChange={setClassroomId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a classroom" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classrooms.map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.name} ({c.status})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" disabled={loading} className="col-span-2 mt-2">
                                Add Slot
                            </Button>
                        </form>
                    </div>

                    {/* Existing Slots List */}
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Current Schedule</h4>
                        {teacher.schedule.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No classes scheduled.</p>
                        ) : (
                            <div className="border rounded-md divide-y">
                                {teacher.schedule.map(slot => (
                                    <div key={slot.id} className="flex items-center justify-between p-3 bg-muted rounded-lg border">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-background p-2 rounded-md border text-center min-w-[80px]">
                                                <div className="text-xs font-medium">{format(slot.startTime, 'HH:mm')}</div>
                                                <div className="text-[10px] text-muted-foreground">to</div>
                                                <div className="text-xs font-medium">{format(slot.endTime, 'HH:mm')}</div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm">{slot.subject}</div>
                                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Badge variant="outline" className="text-[10px] h-5 font-normal">
                                                        {classrooms.find(c => c.id === slot.classroomId)?.name || 'Unknown Room'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemoveSlot(slot.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
