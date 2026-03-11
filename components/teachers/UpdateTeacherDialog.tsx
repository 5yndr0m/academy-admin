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
import { Subject, Teacher } from "@/types";
import { Edit, Loader2 } from "lucide-react";

interface UpdateTeacherDialogProps {
  teacher: Teacher;
  onUpdated: () => void;
}

export function UpdateTeacherDialog({
  teacher,
  onUpdated,
}: UpdateTeacherDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(teacher.full_name);
  const [contactNumber, setContactNumber] = useState(teacher.contact_number);
  const [email, setEmail] = useState(teacher.email || "");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  // Load subjects when dialog opens
  useEffect(() => {
    if (!open) return;
    setSubjectsLoading(true);

    Promise.all([subjectService.getAll(), teacherService.getById(teacher.id)])
      .then(([allSubjects, teacherData]) => {
        setSubjects(allSubjects);
        // Set currently assigned subjects
        const currentSubjectIds = teacherData.subjects.map((s) => s.id);
        setSelectedIds(currentSubjectIds);
      })
      .catch(() => {
        setError("Failed to load subjects");
      })
      .finally(() => setSubjectsLoading(false));
  }, [open, teacher.id]);

  const toggleSubject = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const reset = () => {
    setFullName(teacher.full_name);
    setContactNumber(teacher.contact_number);
    setEmail(teacher.email || "");
    setSelectedIds([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Update basic teacher info
      await teacherService.update(teacher.id, {
        full_name: fullName,
        contact_number: contactNumber,
        email: email.trim() || undefined,
      });

      // Update subject assignments
      await teacherService.updateSubjects(teacher.id, {
        subject_ids: selectedIds,
      });

      setOpen(false);
      onUpdated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update teacher");
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
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Teacher</DialogTitle>
            <DialogDescription>
              Edit {teacher.full_name}&apos;s details and subject assignments.
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                placeholder="teacher@academy.com (optional)"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Label className="text-right pt-2">Subjects</Label>
              <div className="col-span-3 space-y-2">
                {subjectsLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-xs text-muted-foreground">
                      Loading subjects...
                    </p>
                  </div>
                ) : subjects.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No subjects found. Create subjects first.
                  </p>
                ) : (
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {subjects.map((subject) => (
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
                    ))}
                  </div>
                )}
                {!subjectsLoading && subjects.length > 0 && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                    <p className="font-medium text-foreground mb-1">
                      Selected: {selectedIds.length} subject
                      {selectedIds.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-muted-foreground">
                      Changes will be saved when you click "Update Teacher"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Teacher"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
