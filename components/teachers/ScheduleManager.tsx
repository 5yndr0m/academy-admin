"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
import { Badge } from "@/components/ui/badge";
import { Teacher, Class, Classroom, ClassSchedule } from "@/types";
import { classService, scheduleService, classroomService } from "@/lib/data";
import { CalendarDays, Loader2 } from "lucide-react";

interface ScheduleManagerProps {
  teacher: Teacher;
  onUpdate?: () => void;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function ScheduleManager({ teacher, onUpdate }: ScheduleManagerProps) {
  const [open, setOpen] = useState(false);

  // Data
  const [classes, setClasses] = useState<Class[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [classId, setClassId] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Load teacher's classes + all classrooms when dialog opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);

    Promise.all([classService.getAll(), classroomService.getAll()])
      .then(([allClasses, allRooms]) => {
        // Filter to only this teacher's classes
        const mine = allClasses.filter((c) => c.teacher_id === teacher.id);
        setClasses(mine);
        setClassrooms(allRooms.filter((r) => r.is_usable));

        // Load schedules for all of this teacher's classes
        return Promise.all(mine.map((c) => scheduleService.getByClass(c.id)));
      })
      .then((scheduleArrays) => {
        setSchedules(scheduleArrays.flat());
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load data");
      })
      .finally(() => setLoading(false));
  }, [open, teacher.id]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !classroomId || !startTime || !endTime) {
      setAddError("All fields are required.");
      return;
    }
    setAddLoading(true);
    setAddError(null);
    try {
      const newSchedule = await scheduleService.create({
        class_id: classId,
        classroom_id: classroomId,
        day_of_week: parseInt(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
      });
      setSchedules((prev) => [...prev, newSchedule]);
      // Reset form
      setClassId("");
      setClassroomId("");
      setStartTime("");
      setEndTime("");
      setDayOfWeek("1");
      onUpdate?.();
    } catch (err: unknown) {
      setAddError(
        err instanceof Error ? err.message : "Failed to add schedule",
      );
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarDays className="mr-2 h-4 w-4" />
          Schedules
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Schedules — {teacher.full_name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-8">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* ── Add Schedule Form ── */}
            <div className="bg-muted/40 p-5 rounded-lg border h-fit space-y-4">
              <h4 className="font-medium text-sm">Add Recurring Slot</h4>

              {classes.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  This teacher has no active classes. Create a class for this
                  teacher first.
                </p>
              ) : (
                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <Select value={classId} onValueChange={setClassId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAY_NAMES.map((d, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Start</Label>
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End</Label>
                      <Input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Classroom</Label>
                    <Select value={classroomId} onValueChange={setClassroomId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select classroom" />
                      </SelectTrigger>
                      <SelectContent>
                        {classrooms.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} (cap. {c.capacity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {addError && (
                    <p className="text-xs text-destructive">{addError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={addLoading}
                    className="w-full"
                  >
                    {addLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Slot"
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* ── Current Schedules ── */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              <h4 className="font-medium text-sm">Current Schedule</h4>
              {schedules.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No recurring slots set up.
                </p>
              ) : (
                <div className="space-y-2">
                  {schedules
                    .sort(
                      (a, b) =>
                        a.day_of_week - b.day_of_week ||
                        a.start_time.localeCompare(b.start_time),
                    )
                    .map((slot) => {
                      const cls = classes.find((c) => c.id === slot.class_id);
                      const room = classrooms.find(
                        (r) => r.id === slot.classroom_id,
                      );
                      const roomName =
                        slot.classroom?.name ?? room?.name ?? "Unknown room";
                      const className =
                        slot.class?.name ?? cls?.name ?? "Unknown class";
                      return (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {className}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 font-normal"
                              >
                                {roomName}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground/70">
                                {DAY_NAMES[slot.day_of_week]}
                              </span>
                              {" · "}
                              {slot.start_time} – {slot.end_time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
