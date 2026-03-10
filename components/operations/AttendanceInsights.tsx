"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { classService, attendanceService } from "@/lib/data";
import { Class } from "@/types";
import { Loader2, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentSummary {
  student_id: string;
  full_name: string;
  present: number;
  absent: number;
  late: number;
  total: number;
}

export function AttendanceInsights() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCl, setLoadingCl] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load classes once
  useEffect(() => {
    classService
      .getAll()
      .then((data) => {
        setClasses(data.filter((c) => c.status === "ACTIVE"));
        if (data.length > 0) setClassId(data[0].id);
      })
      .catch(() => setError("Failed to load classes"))
      .finally(() => setLoadingCl(false));
  }, []);

  // Load attendance summary when class or month changes
  const loadSummary = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    setError(null);
    setSummary([]);
    try {
      // Get all sessions for this class, filter by month client-side
      // then aggregate attendance per student
      const [sessionsRaw, enrollmentsRaw] = await Promise.all([
        // sessions/class returns all sessions — we filter by month
        fetch(`/api/sessions/class/${classId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then((r) => r.json()),
        fetch(`/api/enrollments/class/${classId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then((r) => r.json()),
      ]);

      const sessions = (Array.isArray(sessionsRaw) ? sessionsRaw : []).filter(
        (s: any) => (s.session_date ?? "").startsWith(month),
      );

      const enrollments = Array.isArray(enrollmentsRaw) ? enrollmentsRaw : [];

      // For each session get attendance records
      const allAttendance: any[] = [];
      await Promise.all(
        sessions.map(async (s: any) => {
          try {
            const recs = await attendanceService.getBySession(s.id);
            allAttendance.push(...recs);
          } catch {
            /* skip failed sessions */
          }
        }),
      );

      // Aggregate by student
      const map: Record<string, StudentSummary> = {};
      enrollments.forEach((e: any) => {
        const name =
          e.student?.full_name ?? (e.student as any)?.fullname ?? e.student_id;
        map[e.student_id] = {
          student_id: e.student_id,
          full_name: name,
          present: 0,
          absent: 0,
          late: 0,
          total: sessions.length,
        };
      });

      allAttendance.forEach((a: any) => {
        if (!map[a.student_id]) return;
        if (a.status === "PRESENT") map[a.student_id].present++;
        else if (a.status === "ABSENT") map[a.student_id].absent++;
        else if (a.status === "LATE") map[a.student_id].late++;
      });

      setSummary(Object.values(map).sort((a, b) => b.present - a.present));
    } catch {
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, [classId, month]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const classAvg =
    summary.length > 0
      ? Math.round(
          (summary.reduce(
            (s, r) => s + (r.total > 0 ? r.present / r.total : 0),
            0,
          ) /
            summary.length) *
            100,
        )
      : null;

  const AttIcon =
    classAvg == null ? Minus : classAvg >= 80 ? TrendingUp : TrendingDown;
  const attColor =
    classAvg == null
      ? ""
      : classAvg >= 80
        ? "text-green-600"
        : classAvg >= 60
          ? "text-amber-600"
          : "text-red-600";

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Select value={classId} onValueChange={setClassId} disabled={loadingCl}>
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder="Select a class…" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-[160px] h-9"
        />
      </div>

      {/* Summary cards */}
      {!loading && summary.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Students", value: summary.length, color: "slate" },
            {
              label: "Avg Attendance",
              value: classAvg != null ? `${classAvg}%` : "—",
              color: classAvg != null && classAvg >= 80 ? "green" : "amber",
            },
            {
              label: "Perfect (100%)",
              value: summary.filter((s) => s.total > 0 && s.present === s.total)
                .length,
              color: "green",
            },
            {
              label: "At Risk (<60%)",
              value: summary.filter(
                (s) => s.total > 0 && s.present / s.total < 0.6,
              ).length,
              color: "red",
            },
          ].map(({ label, value, color }) => (
            <Card
              key={label}
              className={cn(
                "border text-center",
                color === "green" && "border-green-200 bg-green-50",
                color === "red" && "border-red-200 bg-red-50",
                color === "amber" && "border-amber-200 bg-amber-50",
              )}
            >
              <CardContent className="pt-4 pb-3">
                <p
                  className={cn(
                    "text-3xl font-bold",
                    color === "green" && "text-green-700",
                    color === "red" && "text-red-700",
                    color === "amber" && "text-amber-700",
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

      {/* Student table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Student Attendance — {month}
          </CardTitle>
          <CardDescription>
            {classId
              ? `${classes.find((c) => c.id === classId)?.name ?? ""} · Based on ${summary[0]?.total ?? 0} sessions this month`
              : "Select a class to view attendance."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive text-center py-4">{error}</p>
          )}

          {loading && (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          )}

          {!loading && summary.length === 0 && !error && (
            <p className="text-sm text-muted-foreground text-center py-10">
              {classId
                ? "No attendance data for this class and month."
                : "Select a class above."}
            </p>
          )}

          {!loading && summary.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((s) => {
                  const rate =
                    s.total > 0 ? Math.round((s.present / s.total) * 100) : 0;
                  const rateColor =
                    rate >= 80
                      ? "text-green-700"
                      : rate >= 60
                        ? "text-amber-600"
                        : "text-red-600";
                  const barColor =
                    rate >= 80
                      ? "bg-green-500"
                      : rate >= 60
                        ? "bg-amber-500"
                        : "bg-red-500";
                  return (
                    <TableRow key={s.student_id}>
                      <TableCell className="font-medium text-sm">
                        {s.full_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-[10px]"
                        >
                          {s.present}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 text-[10px]"
                        >
                          {s.absent}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                        >
                          {s.late}
                        </Badge>
                      </TableCell>
                      <TableCell className="min-w-[160px]">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full transition-all", barColor)}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span
                            className={cn(
                              "text-xs font-bold w-10 text-right",
                              rateColor,
                            )}
                          >
                            {s.total > 0 ? `${rate}%` : "—"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
