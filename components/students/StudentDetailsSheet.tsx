'use client';

import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Student, CommunicationLog } from '@/types';
import { mockDataService } from '@/lib/data';
import { useAuth } from '@/components/auth/AuthProvider';
import { Eye, CreditCard, MessageSquare, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentDetailsSheetProps {
    student: Student;
    onUpdate: () => void;
}

export function StudentDetailsSheet({ student, onUpdate }: StudentDetailsSheetProps) {
    const { role } = useAuth();
    const handlePaymentUpdate = async (subjectName: string, month: string, status: 'Paid' | 'Pending' | 'Overdue') => {
        await mockDataService.updateStudentPayment(student.id, subjectName, month, status);
        onUpdate();
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{student.fullName}</SheetTitle>
                    <SheetDescription>
                        Student Details & Operational Records
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg border">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {student.fullName.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg leading-tight">{student.fullName}</h3>
                            <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Guardian</Label>
                            <p className="font-medium">{student.guardianName}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground tracking-wider">Contact</Label>
                            <p className="font-medium">{student.contactNumber}</p>
                        </div>
                    </div>

                    <Tabs defaultValue="payments" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                            <TabsTrigger value="payments" className="text-xs gap-2">
                                <CreditCard className="h-3.5 w-3.5" /> Payments
                            </TabsTrigger>
                            <TabsTrigger value="communications" className="text-xs gap-2">
                                <MessageSquare className="h-3.5 w-3.5" /> Comms Log
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="payments" className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold">Financial Records</h4>
                                {role === 'Admin' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-[11px] gap-1.5"
                                        onClick={async () => {
                                            await mockDataService.generateMonthlyBills(student.id);
                                            onUpdate();
                                            alert('Monthly bill generated and sent via SMS/Email.');
                                        }}
                                    >
                                        <CreditCard className="h-3.5 w-3.5" />
                                        Generate Bill
                                    </Button>
                                )}
                            </div>

                            {student.enrolledSubjects.map((sub) => (
                                <div key={sub.subjectName} className="border rounded-lg p-3 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="secondary" className="text-[10px]">{sub.subjectName}</Badge>
                                        <span className="text-[10px] text-muted-foreground italic">
                                            Package: {sub.packageId}
                                        </span>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow className="h-8 hover:bg-transparent">
                                                <TableHead className="h-8 text-[10px]">Month</TableHead>
                                                <TableHead className="h-8 text-[10px]">Amount</TableHead>
                                                <TableHead className="h-8 text-[10px] text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sub.payments.map((payment) => (
                                                <TableRow key={payment.month} className="h-10">
                                                    <TableCell className="text-[11px] font-medium p-2">{payment.month}</TableCell>
                                                    <TableCell className="text-[11px] p-2">${payment.amount}</TableCell>
                                                    <TableCell className="text-right p-2">
                                                        <Select
                                                            defaultValue={payment.status}
                                                            onValueChange={(val: any) => handlePaymentUpdate(sub.subjectName, payment.month, val)}
                                                            disabled={role !== 'Admin'}
                                                        >
                                                            <SelectTrigger className="h-7 w-[90px] ml-auto text-[10px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Paid" className="text-green-600">Paid</SelectItem>
                                                                <SelectItem value="Pending" className="text-amber-600">Pending</SelectItem>
                                                                <SelectItem value="Overdue" className="text-red-600">Overdue</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent value="communications" className="mt-4">
                            <h4 className="text-sm font-semibold mb-4">Notification History</h4>
                            <CommsHistory studentId={student.id} />
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}

function CommsHistory({ studentId }: { studentId: string }) {
    const [logs, setLogs] = useState<CommunicationLog[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await mockDataService.getCommunicationLogs(studentId);
            setLogs(data);
        };
        load();
    }, [studentId]);

    return (
        <div className="space-y-3">
            {logs.map(log => (
                <div key={log.id} className="text-xs border rounded p-3 bg-muted/40 hover:bg-muted/70 transition-colors flex items-start justify-between group">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-[9px] h-4 py-0 uppercase",
                                    log.type === 'SMS' ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                                )}
                            >
                                {log.type}
                            </Badge>
                            <span className="font-semibold group-hover:text-primary transition-colors">{log.subject}</span>
                        </div>
                        <p className="text-muted-foreground font-mono text-[9px]">{log.recipient}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <History className="h-2.5 w-2.5" />
                            {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-[8px] h-3 px-1 border-green-200 text-green-700">Success</Badge>
                    </div>
                </div>
            ))}
            {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                    <p className="italic text-xs">No notifications sent yet.</p>
                </div>
            )}
        </div>
    );
}
