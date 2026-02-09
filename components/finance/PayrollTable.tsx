'use client';

import { Staff } from '@/types';

interface PayrollTableProps {
    staff: Staff[];
}

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function PayrollTable({ staff }: PayrollTableProps) {
    // Statutory calculation constants
    const EPF_EMPLOYEE_RATE = 0.08;
    const EPF_EMPLOYER_RATE = 0.12;
    const ETF_RATE = 0.03;

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="font-bold">Staff Name</TableHead>
                        <TableHead className="font-bold">Basic Salary</TableHead>
                        <TableHead className="font-bold">EPF (8%) Employee</TableHead>
                        <TableHead className="font-bold">EPF (12%) Employer</TableHead>
                        <TableHead className="font-bold">ETF (3%) Employer</TableHead>
                        <TableHead className="font-bold text-right">Net Salary</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {staff.map((member) => {
                        const epfEmployee = member.basicSalary * EPF_EMPLOYEE_RATE;
                        const epfEmployer = member.basicSalary * EPF_EMPLOYER_RATE;
                        const etfEmployer = member.basicSalary * ETF_RATE;
                        const netSalary = member.basicSalary - epfEmployee;

                        return (
                            <TableRow key={member.id}>
                                <TableCell className="font-medium">{member.fullName}</TableCell>
                                <TableCell>${member.basicSalary.toLocaleString()}</TableCell>
                                <TableCell className="text-red-600">-${epfEmployee.toLocaleString()}</TableCell>
                                <TableCell className="text-blue-600">+${epfEmployer.toLocaleString()}</TableCell>
                                <TableCell className="text-indigo-600">+${etfEmployer.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-bold text-green-600">
                                    ${netSalary.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
            <div className="p-4 bg-muted/20 text-xs text-muted-foreground flex justify-between italic">
                <span>* EPF/ETF calculations based on standard local statutory rates.</span>
                <span>Values are auto-calculated from Basic Salary.</span>
            </div>
        </div>
    );
}
