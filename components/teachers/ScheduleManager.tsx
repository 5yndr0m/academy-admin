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
import {
  CalendarDays,
  Loader2,
  Clock,
  AlertTriangle,
  Check,
  MapPin,
} from "lucide-react";

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

  // Conflict detection
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Classroom[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

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

  // Check for conflicts when form data changes
  useEffect(() => {
    if (!dayOfWeek || !startTime || !endTime || !classrooms.length) {
      setConflicts([]);
      setAvailableRooms(classrooms);
      return;
    }

    setCheckingConflicts(true);
    const conflictList: string[] = [];

    // Check against existing schedules
    const dayNum = parseInt(dayOfWeek);
    const conflictingSchedules = schedules.filter((schedule) => {
      if (schedule.day_of_week !== dayNum) return false;
      // Check time overlap: start_time < end_time AND end_time > start_time
      return schedule.start_time < endTime && schedule.end_time > startTime;
    });

    conflictingSchedules.forEach((schedule) => {
      const className =
        classes.find((c) => c.id === schedule.class_id)?.name ||
        "Unknown class";
      const roomName =
        classrooms.find((r) => r.id === schedule.classroom_id)?.name ||
        "Unknown room";
      conflictList.push(
        `${className} in ${roomName} (${schedule.start_time} - ${schedule.end_time})`,
      );
    });

    setConflicts(conflictList);

    // Filter available rooms (exclude conflicted ones if same time)
    const conflictedRoomIds = conflictingSchedules.map((s) => s.classroom_id);
    const available = classrooms.filter(
      (room) => !conflictedRoomIds.includes(room.id),
    );
    setAvailableRooms(available);

    setCheckingConflicts(false);
  }, [dayOfWeek, startTime, endTime, schedules, classes, classrooms]);

  const isFormValid =
    classId && classroomId && startTime && endTime && conflicts.length === 0;
  const timeRangeText = startTime && endTime ? `${startTime} - ${endTime}` : "";

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
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <h4 className="font-medium text-sm">Add Recurring Slot</h4>
                {timeRangeText && (
                  <Badge variant="outline" className="text-xs">
                    {DAY_NAMES[parseInt(dayOfWeek)]} {timeRangeText}
                  </Badge>
                )}
              </div>

              {classes.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  This teacher has no active classes. Create a class for this
                  teacher first.
                </p>
              ) : (
                <form onSubmit={handleAddSlot} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">Class</Label>
                    <Select value={classId} onValueChange={setClassId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{c.name}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {c.subject?.name || "No subject"}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Day of Week
                    </Label>
                    <div className="grid grid-cols-7 gap-1">
                      {DAY_NAMES.map((day, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setDayOfWeek(String(i))}
                          className={`p-2 text-xs rounded border transition-colors ${
                            dayOfWeek === String(i)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted border-border"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-3 w-3" /> Start
                      </Label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                          className={
                            conflicts.length > 0
                              ? "border-amber-300 dark:border-amber-600"
                              : ""
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-3 w-3" /> End
                      </Label>
                      <div className="relative">
                        <Input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                          className={
                            conflicts.length > 0
                              ? "border-amber-300 dark:border-amber-600"
                              : ""
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Time validation */}
                  {startTime && endTime && startTime >= endTime && (
                    <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-3 w-3" />
                      End time must be after start time
                    </div>
                  )}

                  {/* Conflict warnings */}
                  {conflicts.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-xs text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        Time conflicts detected
                      </div>
                      <div className="space-y-1 ml-4">
                        {conflicts.map((conflict, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            • {conflict}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> Classroom
                      {availableRooms.length < classrooms.length && (
                        <Badge variant="outline" className="text-xs">
                          {availableRooms.length} available
                        </Badge>
                      )}
                    </Label>
                    <Select value={classroomId} onValueChange={setClassroomId}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            availableRooms.length === 0
                              ? "No rooms available for this time"
                              : "Select classroom"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRooms.length === 0 ? (
                          <SelectItem value="_disabled" disabled>
                            No classrooms available for this time slot
                          </SelectItem>
                        ) : (
                          availableRooms.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{c.name}</span>
                                <div className="flex items-center gap-2 ml-2">
                                  <Badge variant="outline" className="text-xs">
                                    cap. {c.capacity}
                                  </Badge>
                                  <Check className="h-3 w-3 text-green-500" />
                                </div>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {addError && (
                    <p className="text-xs text-destructive">{addError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      addLoading || !isFormValid || startTime >= endTime
                    }
                    className="w-full"
                  >
                    {addLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding Schedule...
                      </>
                    ) : conflicts.length > 0 ? (
                      <>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Resolve Conflicts
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Add Recurring Schedule
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* ── Current Schedules ── */}
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Current Schedule</h4>
                {schedules.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {schedules.length} slot{schedules.length === 1 ? "" : "s"}
                  </Badge>
                )}
              </div>
              {schedules.length === 0 ? (
                <div className="text-center py-8 bg-muted/20 rounded-lg border border-dashed">
                  <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No recurring schedules yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your first time slot to get started
                  </p>
                </div>
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
                          className="group flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-all duration-200 hover:shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-1 h-12 rounded-full bg-gradient-to-b ${
                                slot.day_of_week === 0 || slot.day_of_week === 6
                                  ? "from-orange-400 to-orange-600"
                                  : "from-blue-400 to-blue-600"
                              }`}
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {className}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px] h-5 font-normal bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                                >
                                  <MapPin className="h-2.5 w-2.5 mr-1" />
                                  {roomName}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="font-medium text-foreground/80">
                                  {DAY_NAMES[slot.day_of_week]}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {slot.start_time} – {slot.end_time}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-[9px] h-4"
                                >
                                  {Math.round(
                                    (new Date(
                                      `2000-01-01T${slot.end_time}`,
                                    ).getTime() -
                                      new Date(
                                        `2000-01-01T${slot.start_time}`,
                                      ).getTime()) /
                                      (1000 * 60),
                                  )}
                                  min
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                            >
                              <span className="text-xs">⋯</span>
                            </Button>
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
