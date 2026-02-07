'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UpcomingClassesProps {
    schedule: {
        id: string;
        time: string;
        subject: string;
        teacherName: string;
        classroomName: string | undefined;
    }[];
}

export function UpcomingClasses({ schedule }: UpcomingClassesProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>Today's schedule overview.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {schedule.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No classes scheduled for today.</p>
                    ) : (
                        schedule.map((slot) => (
                            <div
                                key={slot.id}
                                className="grid grid-cols-[80px_1fr_auto] items-center gap-4 border-b last:border-0 pb-4 last:pb-0"
                            >
                                <span className="text-xs font-medium text-foreground bg-muted px-2 py-1 rounded text-center">
                                    {slot.time.split('-')[0].trim()}
                                </span>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{slot.subject}</p>
                                    <p className="text-xs text-muted-foreground">{slot.teacherName}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-normal">
                                        {slot.classroomName || 'TBD'}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
