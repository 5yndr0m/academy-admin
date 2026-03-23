"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Search, Loader2, TrendingUp } from "lucide-react";
import { reportService } from "@/lib/data";
import { AttendanceReportResponse } from "@/types";

function RateBadge({ rate }: { rate: number }) {
  const color =
    rate >= 80
      ? "text-green-600 border-green-300 bg-green-50"
      : rate >= 60
        ? "text-amber-600 border-amber-300 bg-amber-50"
        : "text-destructive border-destructive/30 bg-destructive/5";
  return (
    <Badge variant="outline" className={`text-xs ${color}`}>
      {rate}%
    </Badge>
  );
}

export function AttendanceReportTab() {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 8) + "01";

  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AttendanceReportResponse | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    if (!from || !to) return;
    setLoading(true);
    setError("");
    try {
      const result = await reportService.getAttendanceReport({
        from,
        to,
        class_id: classId || undefined,
      });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const url = reportService.getAttendanceCsvUrl({
      from,
      to,
      class_id: classId || undefined,
    });
    // Fetch with auth token and trigger download
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `attendance-${from}-to-${to}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Select a date range and optionally a class to narrow the report.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label>From</Label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>To</Label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Class ID (optional)</Label>
              <Input
                placeholder="UUID"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              />
            </div>
            <Button onClick={load} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Sessions", value: data.summary.total_sessions },
              { label: "Present", value: data.summary.total_present, color: "text-green-600" },
              { label: "Late", value: data.summary.total_late, color: "text-amber-600" },
              { label: "Absent", value: data.summary.total_absent, color: "text-destructive" },
              { label: "Avg Rate", value: `${data.summary.avg_rate}%`, color: data.summary.avg_rate >= 80 ? "text-green-600" : "text-amber-600" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-4 pb-3 text-center">
                  <p className={`text-2xl font-bold ${s.color ?? ""}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Export button */}
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Late</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                    <TableHead className="text-center">Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No sessions found for this period
                      </TableCell>
                    </TableRow>
                  )}
                  {data.sessions.map((s) => (
                    <TableRow key={s.session_id}>
                      <TableCell className="font-mono text-sm">{s.session_date}</TableCell>
                      <TableCell className="font-medium">{s.class_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{s.teacher_name}</TableCell>
                      <TableCell className="text-sm">{s.start_time}–{s.end_time}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">{s.present}</TableCell>
                      <TableCell className="text-center text-amber-600 font-medium">{s.late}</TableCell>
                      <TableCell className="text-center text-destructive font-medium">{s.absent}</TableCell>
                      <TableCell className="text-center">
                        <RateBadge rate={s.rate} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {!data && !loading && (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <TrendingUp className="h-10 w-10 opacity-20" />
          <p className="text-sm">Set a date range and click Generate</p>
        </div>
      )}
    </div>
  );
}
