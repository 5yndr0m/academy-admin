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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Staff } from '@/types';
import { mockDataService } from '@/lib/data';
import { Plus, UserCog, Mail, Phone, ShieldCheck } from 'lucide-react';
import { AddStaffModal } from './AddStaffModal';

export function StaffList() {
    const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStaff = async () => {
            const data = await mockDataService.getStaff();
            setStaffMembers(data);
            setLoading(false);
        };
        loadStaff();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading staff records...</div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Institutional Staff</CardTitle>
                    <CardDescription>
                        Manage system users, administrators, and operational staff.
                    </CardDescription>
                </div>
                <AddStaffModal onAdd={(newStaff) => {
                    setStaffMembers([...staffMembers, newStaff]);
                    mockDataService.logAction(`Added staff member: ${newStaff.fullName}`, 'admin', 'Staff');
                }} />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Basic Salary</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staffMembers.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{member.fullName}</span>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" /> {member.email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'} className="flex w-fit items-center gap-1">
                                        <ShieldCheck className="h-3 w-3" />
                                        {member.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs flex items-center gap-1">
                                        <Phone className="h-3 w-3" /> {member.contactNumber}
                                    </span>
                                </TableCell>
                                <TableCell>${member.basicSalary.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={member.status === 'Active' ? 'outline' : 'destructive'}>
                                        {member.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <UserCog className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
