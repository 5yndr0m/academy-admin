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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classService, teacherService, subjectService } from "@/lib/data";
import { Teacher, Subject } from "@/types";
import { Plus, Loader2 } from "lucide-react";

export function AddClassDialog({ onAdded }: { onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [baseFee, setBaseFee] = useState("");
  const [payoutPercentage, setPayoutPercentage] = useState("");

  // Dropdown data
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherSubjects, setTeacherSubjects] = useState<Subject[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [loadingTeacherSubjects, setLoadingTeacherSubjects] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDataLoading(true);
    Promise.all([
      teacherService.getAll(undefined, true),
      subjectService.getAll(),
    ])
      .then(([t, s]) => {
        setTeachers(t);
        setSubjects(s);
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [open]);

  // Load teacher's subjects when teacher is selected
  useEffect(() => {
    if (!teacherId) {
      setTeacherSubjects([]);
      setSubjectId(""); // Reset subject selection
      return;
    }

    setLoadingTeacherSubjects(true);
    teacherService
      .getById(teacherId)
      .then((response) => {
        setTeacherSubjects(response.subjects);
        // Reset subject if it's not in teacher's subjects
        if (subjectId && !response.subjects.some((s) => s.id === subjectId)) {
          setSubjectId("");
        }
      })
      .catch((error) => {
        console.error("Error loading teacher subjects:", error);
        setTeacherSubjects([]);
        setSubjectId("");
      })
      .finally(() => setLoadingTeacherSubjects(false));
  }, [teacherId, subjectId]);

  const reset = () => {
    setName("");
    setTeacherId("");
    setSubjectId("");
    setBaseFee("");
    setPayoutPercentage("");
    setTeacherSubjects([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = parseFloat(baseFee);
    const payout = parseFloat(payoutPercentage);

    if (isNaN(fee) || fee <= 0) {
      setError("Enter a valid monthly fee.");
      return;
    }
    if (isNaN(payout) || payout < 0 || payout > 100) {
      setError("Payout must be 0–100.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await classService.create({
        name,
        teacher_id: teacherId,
        subject_id: subjectId,
        base_monthly_fee: fee,
        payout_percentage: payout,
      });
      setOpen(false);
      reset();
      onAdded?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create class");
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
          Add Class
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Class</DialogTitle>
            <DialogDescription>
              Set up a new class. Payout % is the teacher&apos;s share of
              collected fees.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {dataLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Class Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="class-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. Maths — Grade 10"
                    required
                  />
                </div>

                {/* Teacher */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Teacher</Label>
                  <div className="col-span-3">
                    <Select
                      value={teacherId}
                      onValueChange={setTeacherId}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.length === 0 ? (
                          <SelectItem value="_" disabled>
                            No active teachers found
                          </SelectItem>
                        ) : (
                          teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.full_name ?? (t as any).fullname}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {teachers.length === 0 && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        No active teachers available. Inactive teachers are
                        hidden.
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Subject</Label>
                  <div className="col-span-3">
                    <Select
                      value={subjectId}
                      onValueChange={setSubjectId}
                      required
                      disabled={!teacherId || loadingTeacherSubjects}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !teacherId
                              ? "Select teacher first"
                              : loadingTeacherSubjects
                                ? "Loading subjects..."
                                : teacherSubjects.length === 0
                                  ? "Teacher has no subjects"
                                  : "Select subject"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {!teacherId ? (
                          <SelectItem value="_" disabled>
                            Please select a teacher first
                          </SelectItem>
                        ) : loadingTeacherSubjects ? (
                          <SelectItem value="_" disabled>
                            Loading teacher's subjects...
                          </SelectItem>
                        ) : teacherSubjects.length === 0 ? (
                          <>
                            <SelectItem value="_" disabled>
                              Teacher has no subjects - showing all subjects
                            </SelectItem>
                            {subjects.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </>
                        ) : (
                          teacherSubjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {teacherId &&
                      teacherSubjects.length === 0 &&
                      !loadingTeacherSubjects && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Teacher has no subjects assigned. Showing all subjects
                          as fallback.
                        </p>
                      )}
                  </div>
                </div>

                {/* Monthly Fee */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fee" className="text-right">
                    Monthly Fee
                  </Label>
                  <div className="col-span-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      LKR
                    </span>
                    <Input
                      id="fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={baseFee}
                      onChange={(e) => setBaseFee(e.target.value)}
                      className="pl-12"
                      placeholder="2000"
                      required
                    />
                  </div>
                </div>

                {/* Payout % */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payout" className="text-right">
                    Payout %
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="payout"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={payoutPercentage}
                      onChange={(e) => setPayoutPercentage(e.target.value)}
                      className="pr-8"
                      placeholder="60"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>

                {/* Breakdown hint */}
                {baseFee &&
                  payoutPercentage &&
                  !isNaN(parseFloat(baseFee)) &&
                  !isNaN(parseFloat(payoutPercentage)) && (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-4">
                        <div className="bg-muted/50 rounded-md px-4 py-2 text-xs text-muted-foreground">
                          <div className="grid grid-cols-2 gap-1">
                            <span>Teacher receives:</span>
                            <span className="font-medium text-foreground text-right">
                              LKR{" "}
                              {(
                                (parseFloat(baseFee) *
                                  parseFloat(payoutPercentage)) /
                                100
                              ).toLocaleString()}
                            </span>
                            <span>Institute retains:</span>
                            <span className="font-medium text-foreground text-right">
                              LKR{" "}
                              {(
                                parseFloat(baseFee) *
                                (1 - parseFloat(payoutPercentage) / 100)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </>
            )}

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
            <Button
              type="submit"
              disabled={loading || dataLoading || !teacherId || !subjectId}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Class"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
