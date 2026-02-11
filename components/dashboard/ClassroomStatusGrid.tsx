'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Classroom } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { mockDataService } from '@/lib/data';

interface ClassroomStatusGridProps {
    classrooms: Classroom[];
}

export function ClassroomStatusGrid({ classrooms }: ClassroomStatusGridProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Room Availability</CardTitle>
                <CardDescription>Real-time classroom status.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {classrooms.map((room) => (
                        <div
                            key={room.id}
                            className={cn(
                                "p-3 rounded-lg border text-center transition-colors flex flex-col items-center justify-center gap-2",
                                room.status === 'Free'
                                    ? "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                    : "bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                            )}
                        >
                            <div className="font-semibold text-sm">{room.name}</div>
                            <Badge
                                variant={room.status === 'Free' ? "secondary" : "destructive"}
                                className={cn(
                                    "text-[10px] h-5",
                                    room.status === 'Free' ? "bg-green-100 text-green-700 hover:bg-green-200" : ""
                                )}
                            >
                                {room.status}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
