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
import { BillingFrequency } from '@/types';

interface AddPackageModalProps {
    onAdd: (pkg: any) => void;
}

export function AddPackageModal({ onAdd }: AddPackageModalProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        fee: string;
        frequency: BillingFrequency;
        validityPeriod: string;
    }>({
        title: '',
        fee: '',
        frequency: 'Monthly' as BillingFrequency,
        validityPeriod: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            id: Math.random().toString(36).substr(2, 9),
            fee: Number(formData.fee)
        });
        setOpen(false);
        setFormData({ title: '', fee: '', frequency: 'Monthly', validityPeriod: '' });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> New Package
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Fee Package</DialogTitle>
                        <DialogDescription>
                            Define billing rules for a class.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Package Title</Label>
                            <Input
                                id="title"
                                placeholder="Special O/L Batch"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="freq">Billing Frequency</Label>
                                <Select
                                    value={formData.frequency}
                                    onValueChange={(val: BillingFrequency) => setFormData({ ...formData, frequency: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                        <SelectItem value="Session">Per Session</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="fee">Fee Amount ($)</Label>
                                <Input
                                    id="fee"
                                    type="number"
                                    placeholder="150"
                                    value={formData.fee}
                                    onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="validity">Validity Period (SRS 3.3)</Label>
                            <Input
                                id="validity"
                                placeholder="6 Months"
                                value={formData.validityPeriod || ''}
                                onChange={(e) => setFormData({ ...formData, validityPeriod: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Package</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
