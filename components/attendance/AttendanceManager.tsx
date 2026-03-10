"use client";

import { useEffect, useState, useCallback } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import {
  CalendarIcon,
  CheckCheck,
  XCircle,
  Clock,
  Loader2,
  Users,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { classService, sessionService, attendanceService } from "@/lib/data";
import { Class, ClassSession } from "@/types";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "";

interface StudentEntry {
  student_id: string;
  fullname: string;
  admission_no: string;
  status: AttendanceStatus;
}

function StatusBtn({
  label,
  active,
  activeClass,
  onClick,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-lg text-xs font-semibold border transition-all",
        active
          ? activeClass
          : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function AttendanceManager() {
  const [date, setDate] = useState<Date>(new Date());
  const [classes, setClasses] = useState<Class[]>([]);
  const [classId, setClassId] = useState("");
  const [allSessions, setAllSessions] = useState<ClassSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<ClassSession[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSess, setLoadingSess] = useState(false);
  const [loadingRoll, setLoadingRoll] = useState(false);
  const [loadingActive, setLoadingActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load active classes and sessions once on mount
  useEffect(() => {
    Promise.all([classService.getAll(), sessionService.getActive()])
      .then(([classData, activeData]) => {
        setClasses(classData.filter((c) => c.status === "ACTIVE"));
        setActiveSessions(activeData);
      })
      .catch(() => setError("Failed to load initial data"))
      .finally(() => setLoadingInit(false));
  }, []);

  // Refresh active sessions every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        setLoadingActive(true);
        const activeData = await sessionService.getActive();
        setActiveSessions(activeData);
      } catch {
        // Silent fail - don't disrupt user experience
      } finally {
        setLoadingActive(false);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Load sessions whenever class changes
  const fetchSessions = useCallback(async (cid: string) => {
    if (!cid) return;
    setLoadingSess(true);
    setAllSessions([]);
    setSessionId("");
    setStudents([]);
    setError(null);
    try {
      const data = await sessionService.getByClass(cid);
      setAllSessions(data);
    } catch {
      setError("Failed to load sessions for this class");
    } finally {
      setLoadingSess(false);
    }
  }, []);

  useEffect(() => {
    setAllSessions([]);
    fetchSessions(classId);
  }, [classId, fetchSessions]);

  // Filter sessions to selected date (client-side)
  const sessionsOnDate = allSessions.filter((s) => {
    try {
      return isSameDay(parseISO(s.session_date), date);
    } catch {
      return false;
    }
  });

  // Auto-select session when date or sessions change
  useEffect(() => {
    setSessionId("");
    setStudents([]);
    if (sessionsOnDate.length === 1) {
      setSessionId(sessionsOnDate[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, classId, allSessions]);

  // Load roll when session is selected
  const fetchRoll = useCallback(async (sid: string) => {
    if (!sid) return;
    setLoadingRoll(true);
    setStudents([]);
    setError(null);
    try {
      const raw = await attendanceService.getStudentsForSession(sid);
      // Backend returns { session, students } — extract the students array
      const list: StudentEntry[] = Array.isArray(raw)
        ? (raw as unknown as StudentEntry[])
        : ((raw as { students?: StudentEntry[] }).students ?? []);
      setStudents(list);
    } catch {
      setError("Failed to load class roll");
    } finally {
      setLoadingRoll(false);
    }
  }, []);

  useEffect(() => {
    fetchRoll(sessionId);
  }, [sessionId, fetchRoll]);

  // Mark a single student
  const markStudent = async (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE",
  ) => {
    if (!sessionId) return;
    setSaving(studentId);
    setStudents((prev) =>
      prev.map((s) => (s.student_id === studentId ? { ...s, status } : s)),
    );
    try {
      await attendanceService.mark({
        session_id: sessionId,
        student_id: studentId,
        status,
      });
    } catch {
      setStudents((prev) =>
        prev.map((s) =>
          s.student_id === studentId ? { ...s, status: "" } : s,
        ),
      );
    } finally {
      setSaving(null);
    }
  };

  // Mark all students
  const markAll = async (status: "PRESENT" | "ABSENT" | "LATE") => {
    if (!sessionId || students.length === 0) return;
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    await Promise.allSettled(
      students.map((s) =>
        attendanceService.mark({
          session_id: sessionId,
          student_id: s.student_id,
          status,
        }),
      ),
    );
  };

  const selectedSession = allSessions.find((s) => s.id === sessionId);
  const selectedClass = classes.find((c) => c.id === classId);
  const presentCount = students.filter((s) => s.status === "PRESENT").length;
  const absentCount = students.filter((s) => s.status === "ABSENT").length;
  const lateCount = students.filter((s) => s.status === "LATE").length;
  const unmarked = students.filter((s) => !s.status).length;

  if (loadingInit) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Active Sessions Quick Access */}
      {activeSessions.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse" />
                <CardTitle className="text-lg text-orange-800 dark:text-orange-200">
                  Active Sessions
                </CardTitle>
                {loadingActive && (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <Badge
                variant="secondary"
                className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
              >
                {activeSessions.length} ongoing
              </Badge>
            </div>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Sessions currently in progress - click to mark attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeSessions.map((session) => (
                <Button
                  key={session.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start bg-white dark:bg-gray-950 hover:bg-orange-50 dark:hover:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                  onClick={() => {
                    setClassId(session.class_id);
                    setSessionId(session.id);
                    setDate(parseISO(session.session_date));
                  }}
                >
                  <div className="font-medium text-sm text-orange-800 dark:text-orange-200">
                    {session.class?.name || "Unknown Class"}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    {session.start_time} - {session.end_time}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Room: {session.classroom?.name || "N/A"}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
              {/* Class selector */}
              <Select value={classId} onValueChange={(v) => setClassId(v)}>
                <SelectTrigger className="w-[260px]">
                  <SelectValue placeholder="Select a class…" />
                </SelectTrigger>
                <SelectContent>
                  {classes.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No active classes
                    </SelectItem>
                  ) : (
                    classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Date picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "dd MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                      if (d) setDate(d);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Session selector — only when >1 session on this date */}
              {classId && !loadingSess && sessionsOnDate.length > 1 && (
                <Select
                  value={sessionId}
                  onValueChange={(v) => setSessionId(v)}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select session…" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionsOnDate.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.start_time} – {s.end_time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {loadingSess && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading sessions…
                </div>
              )}

              {classId && !loadingSess && sessionsOnDate.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No session on {format(date, "dd MMM yyyy")} for this class.
                </p>
              )}
            </div>

            {/* Bulk actions — only shown when roll is loaded */}
            {sessionId && students.length > 0 && (
              <div className="flex items-center justify-between border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  {unmarked > 0
                    ? `${unmarked} student${unmarked !== 1 ? "s" : ""} not yet marked`
                    : "All students marked ✓"}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAll("ABSENT")}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> All Absent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAll("LATE")}
                  >
                    <Clock className="mr-1.5 h-3.5 w-3.5" /> All Late
                  </Button>
                  <Button size="sm" onClick={() => markAll("PRESENT")}>
                    <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> All Present
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary strip */}
      {sessionId && !loadingRoll && students.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {(
            [
              { label: "Total", value: students.length, color: "slate" },
              { label: "Present", value: presentCount, color: "green" },
              { label: "Absent", value: absentCount, color: "red" },
              { label: "Late", value: lateCount, color: "amber" },
            ] as const
          ).map(({ label, value, color }) => (
            <Card
              key={label}
              className={cn(
                "border text-center",
                color === "green" &&
                  "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30",
                color === "red" &&
                  "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30",
                color === "amber" &&
                  "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30",
              )}
            >
              <CardContent className="pt-4 pb-3">
                <p
                  className={cn(
                    "text-3xl font-bold",
                    color === "green" && "text-green-700 dark:text-green-300",
                    color === "red" && "text-red-700 dark:text-red-300",
                    color === "amber" && "text-amber-700 dark:text-amber-300",
                  )}
                >
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Roll call */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Class Roll
          </CardTitle>
          <CardDescription>
            {selectedClass && selectedSession
              ? `${selectedClass.name} · ${format(date, "MMMM d, yyyy")} · ${selectedSession.start_time}–${selectedSession.end_time}`
              : classId
                ? "Select a date with a session to load the roll."
                : "Select a class to get started."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <p className="text-sm text-destructive text-center py-4">{error}</p>
          )}

          {!classId && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <GraduationCap className="h-10 w-10 opacity-20" />
              <p className="text-sm">
                Select a class above to load the attendance roll.
              </p>
            </div>
          )}

          {loadingRoll && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          )}

          {!loadingRoll && sessionId && students.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Users className="h-10 w-10 opacity-20" />
              <p className="text-sm">
                No enrolled students found for this session.
              </p>
            </div>
          )}

          {!loadingRoll && students.length > 0 && (
            <div className="space-y-2">
              {students.map((s) => {
                const isSaving = saving === s.student_id;
                return (
                  <div
                    key={s.student_id}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
                      s.status === "PRESENT" && "bg-green-50 border-green-200",
                      s.status === "ABSENT" && "bg-red-50 border-red-200",
                      s.status === "LATE" && "bg-amber-50 border-amber-200",
                      !s.status && "bg-card hover:bg-accent/30",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                          s.status === "PRESENT"
                            ? "bg-green-200 text-green-800"
                            : s.status === "ABSENT"
                              ? "bg-red-200 text-red-800"
                              : s.status === "LATE"
                                ? "bg-amber-200 text-amber-800"
                                : "bg-muted text-muted-foreground",
                        )}
                      >
                        {s.fullname.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{s.fullname}</p>
                        {s.admission_no && (
                          <p className="text-xs text-muted-foreground font-mono">
                            {s.admission_no}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <StatusBtn
                            label="Present"
                            active={s.status === "PRESENT"}
                            activeClass="bg-green-600 hover:bg-green-700 text-white border-green-600"
                            onClick={() => markStudent(s.student_id, "PRESENT")}
                          />
                          <StatusBtn
                            label="Late"
                            active={s.status === "LATE"}
                            activeClass="bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                            onClick={() => markStudent(s.student_id, "LATE")}
                          />
                          <StatusBtn
                            label="Absent"
                            active={s.status === "ABSENT"}
                            activeClass="bg-red-600 hover:bg-red-700 text-white border-red-600"
                            onClick={() => markStudent(s.student_id, "ABSENT")}
                          />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
