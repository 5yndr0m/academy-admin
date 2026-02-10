'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { UserRole } from '@/types';

interface AddStaffModalProps {
    onAdd: (staff: any) => void;
}

export function AddStaffModal({ onAdd }: AddStaffModalProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        contactNumber: '',
        role: 'Staff' as UserRole,
        basicSalary: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            id: Math.random().toString(36).substr(2, 9),
            status: 'Active',
            basicSalary: Number(formData.basicSalary)
        });
        setOpen(false);
        setFormData({ fullName: '', email: '', contactNumber: '', role: 'Staff', basicSalary: '' });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Staff
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Staff Member</DialogTitle>
                        <DialogDescription>
                            Create a new staff or admin account. Profiles can be updated later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@academy.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(val: UserRole) => setFormData({ ...formData, role: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Staff">Staff</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="salary">Basic Salary ($)</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    placeholder="3000"
                                    value={formData.basicSalary}
                                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Account</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
