"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Search, Loader2, BarChart3 } from "lucide-react";
import { reportService } from "@/lib/data";
import { ClassPerformanceResponse, ClassPerformanceEntry } from "@/types";

const EXAM_COLORS: Record<string, string> = {
  MIDTERM: "#6366f1",
  FINAL: "#10b981",
  QUIZ: "#f59e0b",
  ASSIGNMENT: "#3b82f6",
};

function PassBadge({ rate }: { rate: number }) {
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

export function ClassPerformanceTab() {
  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ClassPerformanceResponse | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await reportService.getClassPerformance({
        semester_id: semesterId || undefined,
        subject_id: subjectId || undefined,
      });
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Build chart data: one row per subject, bars per exam type
  const chartData = (() => {
    if (!data) return [];
    const bySubject: Record<string, Record<string, number>> = {};
    for (const e of data.entries) {
      if (!bySubject[e.subject_name]) bySubject[e.subject_name] = {};
      bySubject[e.subject_name][e.exam_type] = e.avg_percent;
    }
    return Object.entries(bySubject).map(([subject, types]) => ({
      subject: subject.length > 18 ? subject.slice(0, 16) + "…" : subject,
      ...types,
    }));
  })();

  const examTypes = data
    ? [...new Set(data.entries.map((e) => e.exam_type))]
    : [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-1.5">
              <Label>Semester ID (optional)</Label>
              <Input
                placeholder="UUID"
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subject ID (optional)</Label>
              <Input
                placeholder="UUID"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && data && data.entries.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <BarChart3 className="h-10 w-10 opacity-20" />
          <p className="text-sm">No result data found</p>
        </div>
      )}

      {!loading && data && data.entries.length > 0 && (
        <>
          {/* Bar chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Average Score % by Subject & Exam Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip formatter={(v) => `${v}%`} />
                  <Legend />
                  {examTypes.map((et) => (
                    <Bar
                      key={et}
                      dataKey={et}
                      fill={EXAM_COLORS[et] ?? "#8884d8"}
                      radius={[3, 3, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Detail table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam Type</TableHead>
                    <TableHead className="text-right">Avg Score</TableHead>
                    <TableHead className="text-right">Max</TableHead>
                    <TableHead className="text-right">Avg %</TableHead>
                    <TableHead className="text-center">Pass Rate</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.entries.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{e.subject_name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: EXAM_COLORS[e.exam_type] + "80", color: EXAM_COLORS[e.exam_type] }}
                        >
                          {e.exam_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{e.avg_score}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">{e.max_score}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{e.avg_percent}%</TableCell>
                      <TableCell className="text-center">
                        <PassBadge rate={e.pass_rate} />
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{e.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
