'use client';

import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockDataService } from '@/lib/data';
import { TeacherPayout, Teacher } from '@/types';
import { DollarSign, User, Calendar, CheckCircle2, Clock } from 'lucide-react';

export function TeacherPayoutTable() {
    const [payouts, setPayouts] = useState<TeacherPayout[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const [payoutData, teacherData] = await Promise.all([
                mockDataService.getTeacherPayouts(),
                mockDataService.getTeachers()
            ]);
            setPayouts(payoutData);
            setTeachers(teacherData);
            setLoading(false);
        };
        loadData();
    }, []);

    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.fullName || 'Unknown';

    if (loading) return <div className="p-8 text-center text-muted-foreground">Calculating payouts...</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Teacher Payouts</CardTitle>
                    <CardDescription>Internal tracking of teacher earnings per class session.</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                    <DollarSign className="mr-2 h-4 w-4" /> Process Payouts
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Month</TableHead>
                            <TableHead>Classes</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payouts.map((payout) => (
                            <TableRow key={payout.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary">
                                            <User className="h-3 w-3" />
                                        </div>
                                        {getTeacherName(payout.teacherId)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        {payout.month}
                                    </div>
                                </TableCell>
                                <TableCell>{payout.classCount}</TableCell>
                                <TableCell className="font-semibold text-green-700">
                                    ${payout.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={payout.status === 'Paid' ? 'outline' : 'secondary'}
                                        className={payout.status === 'Paid' ? "bg-green-50 text-green-700 border-green-200" : ""}
                                    >
                                        {payout.status === 'Paid' ? (
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                        ) : (
                                            <Clock className="mr-1 h-3 w-3" />
                                        )}
                                        {payout.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    {payout.status === 'Pending' && (
                                        <Button variant="ghost" size="sm">Mark Paid</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
