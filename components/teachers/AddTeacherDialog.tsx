"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { teacherService, subjectService } from "@/lib/data";
import { Subject } from "@/types";
import { Plus, Loader2 } from "lucide-react";

export function AddTeacherDialog({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Load subjects when dialog opens
  useEffect(() => {
    if (!open) return;
    setSubjectsLoading(true);
    subjectService
      .getAll()
      .then(setSubjects)
      .catch(() => {})
      .finally(() => setSubjectsLoading(false));
  }, [open]);

  const toggleSubject = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const reset = () => {
    setFullName("");
    setContactNumber("");
    setSelectedIds([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      setError("Please select at least one subject.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await teacherService.create({
        full_name: fullName,
        contact_number: contactNumber,
        subject_ids: selectedIds,
      });
      setOpen(false);
      reset();
      onAdded?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add teacher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Teacher</DialogTitle>
            <DialogDescription>
              Register a new faculty member and assign subjects.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="fullname" className="text-right">
                Full Name
              </Label>
              <Input
                id="fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="col-span-3"
                placeholder="07XXXXXXXX"
                required
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">Subjects</Label>
              <div className="col-span-3 space-y-2">
                {subjectsLoading ? (
                  <p className="text-xs text-muted-foreground">
                    Loading subjects...
                  </p>
                ) : subjects.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No subjects found. Create subjects first.
                  </p>
                ) : (
                  subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center gap-2">
                      <Checkbox
                        id={subject.id}
                        checked={selectedIds.includes(subject.id)}
                        onCheckedChange={() => toggleSubject(subject.id)}
                      />
                      <Label
                        htmlFor={subject.id}
                        className="font-normal cursor-pointer"
                      >
                        {subject.name}
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Teacher"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
