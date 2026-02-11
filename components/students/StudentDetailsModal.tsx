'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Eye, CreditCard, MessageSquare, History, User, Phone, Mail, BookOpen, BadgeDollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentDetailsModalProps {
    studentId: string;
    trigger?: React.ReactNode;
    onUpdate?: () => void;
}

export function StudentDetailsModal({ studentId, trigger, onUpdate }: StudentDetailsModalProps) {
    const { role } = useAuth();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const loadStudent = async () => {
        setLoading(true);
        const data = await mockDataService.getStudentById(studentId);
        if (data) setStudent(data);
        setLoading(false);
    };

    useEffect(() => {
        if (open) {
            loadStudent();
        }
    }, [open, studentId]);

    const handlePaymentUpdate = async (subjectName: string, month: string, status: 'Paid' | 'Pending' | 'Overdue') => {
        await mockDataService.updateStudentPayment(studentId, subjectName, month, status);
        loadStudent();
        if (onUpdate) onUpdate();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                {student?.fullName.charAt(0)}
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-bold">{student?.fullName || 'Loading...'}</DialogTitle>
                                <DialogDescription className="text-xs font-mono">Student ID: {studentId}</DialogDescription>
                            </div>
                        </div>
                        {role === 'Admin' && student && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-2"
                                onClick={async () => {
                                    await mockDataService.generateMonthlyBills(student.id);
                                    loadStudent();
                                    alert('Billing notification triggered successfully.');
                                }}
                            >
                                <BadgeDollarSign className="h-3.5 w-3.5" />
                                Generate Bill
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-4">
                    {!student && loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : student ? (
                        <div className="space-y-6">
                            {/* Contact Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border rounded-lg p-3 space-y-1 bg-muted/20">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 font-mono">
                                        <Phone className="h-3 w-3" /> Student Contact
                                    </p>
                                    <p className="font-medium text-sm">{student.contactNumber}</p>
                                </div>
                                <div className="border rounded-lg p-3 space-y-1 bg-muted/20">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 font-mono">
                                        <User className="h-3 w-3" /> Guardian
                                    </p>
                                    <p className="font-medium text-sm">{student.guardianName}</p>
                                </div>
                                <div className="border rounded-lg p-3 space-y-1 bg-muted/20">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 font-mono">
                                        <MessageSquare className="h-3 w-3" /> Guardian Contact
                                    </p>
                                    <p className="font-medium text-sm">{student.guardianContact}</p>
                                </div>
                            </div>

                            <Tabs defaultValue="payments" className="w-full">
                                <div className="overflow-x-auto pb-1 scrollbar-hide">
                                    <TabsList className="bg-muted/50 p-1 w-full justify-start md:w-auto">
                                        <TabsTrigger value="payments" className="flex items-center gap-2 text-xs">
                                            <CreditCard className="h-3.5 w-3.5" /> Financial Records
                                        </TabsTrigger>
                                        <TabsTrigger value="communications" className="flex items-center gap-2 text-xs">
                                            <Mail className="h-3.5 w-3.5" /> Comms Log
                                        </TabsTrigger>
                                        <TabsTrigger value="academic" className="flex items-center gap-2 text-xs">
                                            <BookOpen className="h-3.5 w-3.5" /> Enrolled Subjects
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="payments" className="mt-4 space-y-6">
                                    {student.enrolledSubjects.map((sub) => (
                                        <div key={sub.subjectName} className="border rounded-xl bg-card overflow-hidden">
                                            <div className="bg-muted/30 px-4 py-2 border-b flex items-center justify-between">
                                                <h4 className="font-bold text-sm tracking-tight">{sub.subjectName}</h4>
                                                <Badge variant="outline" className="text-[9px] uppercase font-bold bg-background">{sub.packageId}</Badge>
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="h-10">
                                                        <TableHead className="font-bold text-xs">Month</TableHead>
                                                        <TableHead className="font-bold text-xs">Amount Due</TableHead>
                                                        <TableHead className="text-right font-bold text-xs">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {sub.payments.map((p) => (
                                                        <TableRow key={p.month} className="h-12">
                                                            <TableCell className="text-xs font-medium">{p.month}</TableCell>
                                                            <TableCell className="text-xs font-bold">${p.amount}</TableCell>
                                                            <TableCell className="text-right">
                                                                <Select
                                                                    defaultValue={p.status}
                                                                    onValueChange={(val: any) => handlePaymentUpdate(sub.subjectName, p.month, val)}
                                                                    disabled={role !== 'Admin'}
                                                                >
                                                                    <SelectTrigger className={cn(
                                                                        "h-7 w-[100px] ml-auto text-[10px] font-bold",
                                                                        p.status === 'Paid' ? "text-green-700 bg-green-50 border-green-200" :
                                                                            p.status === 'Overdue' ? "text-red-700 bg-red-50 border-red-200" :
                                                                                "text-amber-700 bg-amber-50 border-amber-200"
                                                                    )}>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Paid" className="text-xs text-green-700">PAID</SelectItem>
                                                                        <SelectItem value="Pending" className="text-xs text-amber-700">PENDING</SelectItem>
                                                                        <SelectItem value="Overdue" className="text-xs text-red-700">OVERDUE</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {sub.payments.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={3} className="text-center py-4 text-xs text-muted-foreground">No payments recorded</TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ))}
                                </TabsContent>

                                <TabsContent value="communications" className="mt-4">
                                    <CommsHistory studentId={studentId} />
                                </TabsContent>

                                <TabsContent value="academic" className="mt-4 grid gap-4 sm:grid-cols-2">
                                    {student.enrolledSubjects.map((sub) => (
                                        <div key={sub.subjectName} className="border rounded-lg p-4 bg-muted/10 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold">{sub.subjectName}</h4>
                                                <Badge variant="secondary" className="text-[10px]">{sub.packageId}</Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Attendance Rate</span>
                                                <span className="font-bold text-green-600">92%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 w-[92%]" />
                                            </div>
                                        </div>
                                    ))}
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                            <User className="h-12 w-12 opacity-10" />
                            <p>Student details could not be found.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
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
                <div key={log.id} className="text-xs border rounded-lg p-4 bg-muted/10 hover:bg-muted/30 transition-colors flex items-start justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-[9px] h-4 py-0 uppercase font-bold",
                                    log.type === 'SMS' ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                                )}
                            >
                                {log.type}
                            </Badge>
                            <span className="font-bold text-sm">{log.subject}</span>
                        </div>
                        <p className="text-muted-foreground font-mono text-[10px]">{log.recipient}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <History className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="text-[9px] h-4 px-2 border-green-200 text-green-700 bg-green-50 font-bold">DELIVERED</Badge>
                    </div>
                </div>
            ))}
            {logs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <MessageSquare className="h-8 w-8 opacity-10" />
                    <p className="italic text-xs font-mono">No notifications sent yet.</p>
                </div>
            )}
        </div>
    );
}
