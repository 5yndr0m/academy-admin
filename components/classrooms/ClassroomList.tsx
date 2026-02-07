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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockDataService } from '@/lib/data';
import { Classroom } from '@/types';
import { Loader2 } from 'lucide-react';

export function ClassroomList() {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClassrooms();
    }, []);

    const loadClassrooms = async () => {
        setLoading(true);
        const data = await mockDataService.getClassrooms();
        setClassrooms(data);
        setLoading(false);
    };

    const handleStatusToggle = async (id: string) => {
        // Optimistic update
        setClassrooms(prev => prev.map(c =>
            c.id === id ? { ...c, status: c.status === 'Free' ? 'In Use' : 'Free' } : c
        ));

        await mockDataService.toggleClassroomStatus(id);
    };

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
                <CardTitle>All Classrooms</CardTitle>
                <CardDescription>Manage classroom availability and capacity.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classrooms.map((classroom) => (
                            <TableRow key={classroom.id}>
                                <TableCell className="font-medium">{classroom.name}</TableCell>
                                <TableCell>{classroom.capacity} Students</TableCell>
                                <TableCell>
                                    <Badge variant={classroom.status === 'Free' ? "secondary" : "destructive"}>
                                        {classroom.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <span className="text-xs text-slate-500">
                                            {classroom.status === 'Free' ? 'Mark as In Use' : 'Mark as Free'}
                                        </span>
                                        <Switch
                                            checked={classroom.status === 'In Use'}
                                            onCheckedChange={() => handleStatusToggle(classroom.id)}
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
