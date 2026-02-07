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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockDataService } from '@/lib/data';
import { Plus } from 'lucide-react';

export function AddStudentDialog({ onAdded }: { onAdded?: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [guardianName, setGuardianName] = useState('');
    const [guardianContact, setGuardianContact] = useState('');
    const [subjects, setSubjects] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        await mockDataService.addStudent({
            fullName,
            contactNumber,
            guardianName,
            guardianContact,
            subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
        });

        setLoading(false);
        setOpen(false);

        // Reset
        setFullName('');
        setContactNumber('');
        setGuardianName('');
        setGuardianContact('');
        setSubjects('');

        if (onAdded) {
            onAdded();
        } else {
            window.location.reload();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Enroll New Student</DialogTitle>
                        <DialogDescription>
                            Add student and guardian details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <h4 className="font-medium text-sm text-foreground">Student Information</h4>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="fullname" className="text-right">Name</Label>
                            <Input id="fullname" value={fullName} onChange={e => setFullName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="contact" className="text-right">Contact</Label>
                            <Input id="contact" value={contactNumber} onChange={e => setContactNumber(e.target.value)} className="col-span-3" required />
                        </div>

                        <h4 className="font-medium text-sm text-foreground mt-2">Guardian Information</h4>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gname" className="text-right">Name</Label>
                            <Input id="gname" value={guardianName} onChange={e => setGuardianName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="gcontact" className="text-right">Contact</Label>
                            <Input id="gcontact" value={guardianContact} onChange={e => setGuardianContact(e.target.value)} className="col-span-3" required />
                        </div>

                        <h4 className="font-medium text-sm text-foreground mt-2">Academics</h4>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subjects" className="text-right">Subjects</Label>
                            <Input id="subjects" value={subjects} onChange={e => setSubjects(e.target.value)} className="col-span-3" placeholder="Math, English (comma separated)" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Enroll Student'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
