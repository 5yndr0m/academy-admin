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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { enrollmentService, classService } from "@/lib/data";
import { Class, Student } from "@/types";
import {
  Plus,
  Loader2,
  BookOpen,
  User,
  GraduationCap,
  DollarSign,
  Clock,
  Users
} from "lucide-react";

interface EnrollStudentDialogProps {
  student: Student;
  onEnrolled?: () => void;
  trigger?: React.ReactNode;
}

export function EnrollStudentDialog({
  student,
  onEnrolled,
  trigger
}: EnrollStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");

  // Load available classes
  useEffect(() => {
    const loadClasses = async () => {
      setLoadingClasses(true);
      try {
        const allClasses = await classService.getAll();
        // Filter to only active classes
        const activeClasses = allClasses.filter(c => c.status === "ACTIVE");
        setClasses(activeClasses);
      } catch (err) {
        console.error("Failed to load classes:", err);
        setError("Failed to load available classes");
      } finally {
        setLoadingClasses(false);
      }
    };

    if (open) {
      loadClasses();
    }
  }, [open]);

  const reset = () => {
    setSelectedClassId("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassId) {
      setError("Please select a class");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await enrollmentService.enroll(student.id, selectedClassId);
      setOpen(false);
      reset();
      onEnrolled?.();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to enroll student"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Enroll in Class
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            Enroll Student in Class
          </DialogTitle>
          <DialogDescription>
            Enroll <strong>{student.fullname}</strong> in a class to begin attendance tracking and fee collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Student Info */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{student.fullname}</p>
                <p className="text-sm text-muted-foreground">
                  Admission No: {student.admission_no}
                </p>
              </div>
            </div>

            {/* Class Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Select Class *
              </Label>

              {loadingClasses ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading classes...
                  </span>
                </div>
              ) : classes.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active classes available</p>
                </div>
              ) : (
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class to enroll in" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="font-medium">{cls.name}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="h-3 w-3 mr-1" />
                              LKR {cls.base_monthly_fee?.toLocaleString() || "0"}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Selected Class Details */}
            {selectedClass && (
              <div className="p-4 bg-accent/50 rounded-lg border space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4" />
                  Class Details
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <User className="h-3 w-3" />
                      Teacher
                    </span>
                    <span className="text-sm font-medium">
                      {selectedClass.teacher?.full_name || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      Subject
                    </span>
                    <span className="text-sm font-medium">
                      {selectedClass.subject?.name || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-3 w-3" />
                      Monthly Fee
                    </span>
                    <span className="text-sm font-medium">
                      LKR {selectedClass.base_monthly_fee?.toLocaleString() || "0"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingClasses || !selectedClassId}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Enroll Student
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
