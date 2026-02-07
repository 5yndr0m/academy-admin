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
        // Calculate the correct date based on selected day (0=Sunday, 1=Monday...)
        const targetDay = parseInt(day);
        const now = new Date();
        const currentDay = now.getDay();
        let distance = (targetDay + 7 - currentDay) % 7;
        // If today is the day, but we want to ensure we're clear, we just use today. 
        // Or strictly future? Let's stick to nearest occurrence including today.

        const date = new Date();
        date.setDate(date.getDate() + distance);

        const start = new Date(date);
        const [startH, startM] = startTime.split(':').map(Number);
        start.setHours(startH, startM, 0);

        const end = new Date(date);
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
            <DialogContent className="sm:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Schedule: {teacher.fullName}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Add New Slot Form */}
                    <div className="bg-muted/40 p-6 rounded-lg border h-fit">
                        <h4 className="font-medium mb-4 text-sm">Add Class Slot</h4>
                        <form onSubmit={handleAddSlot} className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
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
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder="e.g. Math 101"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
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
                            <Button type="submit" disabled={loading} className="mt-2">
                                Add Slot
                            </Button>
                        </form>
                    </div>

                    {/* Existing Slots List */}
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                        <h4 className="font-medium text-sm">Current Schedule</h4>
                        {teacher.schedule.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No classes scheduled.</p>
                        ) : (
                            <div className="space-y-3">
                                {teacher.schedule.map(slot => (
                                    <div key={slot.id} className="group flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/5 transition-all shadow-sm">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm">{slot.subject}</span>
                                                <Badge variant="secondary" className="text-[10px] font-normal px-1.5 py-0 h-5">
                                                    {classrooms.find(c => c.id === slot.classroomId)?.name || 'Unknown Room'}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <span className="font-medium text-foreground/70">{format(slot.startTime, 'EEEE')}</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span>{format(slot.startTime, 'HH:mm')} - {format(slot.endTime, 'HH:mm')}</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
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
