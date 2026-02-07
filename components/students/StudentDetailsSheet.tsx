'use client';

import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
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
import { Student } from '@/types';
import { mockDataService } from '@/lib/data';
import { Eye, CreditCard } from 'lucide-react';

interface StudentDetailsSheetProps {
    student: Student;
    onUpdate: () => void;
}

export function StudentDetailsSheet({ student, onUpdate }: StudentDetailsSheetProps) {
    const handlePaymentUpdate = async (subjectName: string, month: string, status: 'Paid' | 'Pending' | 'Overdue') => {
        await mockDataService.updateStudentPayment(student.id, subjectName, month, status);
        onUpdate();
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                    <Eye className="h-4 w-4" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{student.fullName}</SheetTitle>
                    <SheetDescription>
                        Student Details & Financial Record
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Profile Section */}
                    <div className="space-y-2 text-sm">
                        <h3 className="font-semibold border-b pb-1">Profile</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <span className="text-slate-500">Contact:</span>
                            <span>{student.contactNumber}</span>
                            <span className="text-slate-500">Guardian:</span>
                            <span>{student.guardianName}</span>
                            <span className="text-slate-500">Guardian Contact:</span>
                            <span>{student.guardianContact}</span>
                        </div>
                    </div>

                    {/* Subjects & Payments Section */}
                    <div className="space-y-4">
                        <h3 className="font-semibold border-b pb-1">Academics & Payments</h3>
                        {student.enrolledSubjects.length === 0 ? (
                            <p className="text-sm text-slate-500">No enrolled subjects.</p>
                        ) : (
                            <div className="space-y-6">
                                {student.enrolledSubjects.map((sub) => (
                                    <div key={sub.subjectName} className="border rounded-lg p-3 space-y-3 bg-slate-50/50">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium flex items-center gap-2">
                                                <Badge variant="outline">{sub.subjectName}</Badge>
                                            </span>
                                        </div>

                                        <Table>
                                            <TableHeader>
                                                <TableRow className="h-8">
                                                    <TableHead className="h-8 text-xs">Month</TableHead>
                                                    <TableHead className="h-8 text-xs">Amount</TableHead>
                                                    <TableHead className="h-8 text-xs text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sub.payments.map((payment) => (
                                                    <TableRow key={payment.month} className="h-10">
                                                        <TableCell className="text-xs font-medium">{payment.month}</TableCell>
                                                        <TableCell className="text-xs">${payment.amount}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Select
                                                                defaultValue={payment.status}
                                                                onValueChange={(val: any) => handlePaymentUpdate(sub.subjectName, payment.month, val)}
                                                            >
                                                                <SelectTrigger className="h-7 w-[100px] ml-auto text-xs">
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
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
