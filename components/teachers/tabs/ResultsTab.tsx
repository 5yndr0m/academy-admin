"use client";

import { useEffect, useState, useCallback } from "react";
import { studentResultService, semesterService, lecturerService } from "@/lib/data";
import type { StudentResult, Semester, LecturerEffectivenessEntry } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";

const EXAM_COLORS: Record<string, string> = {
  MIDTERM: "#6366f1",
  FINAL: "#10b981",
  QUIZ: "#f59e0b",
  ASSIGNMENT: "#3b82f6",
};

const EXAM_BADGES: Record<string, string> = {
  MIDTERM: "bg-indigo-100 text-indigo-800 border-indigo-200",
  FINAL: "bg-green-100 text-green-800 border-green-200",
  QUIZ: "bg-amber-100 text-amber-800 border-amber-200",
  ASSIGNMENT: "bg-blue-100 text-blue-800 border-blue-200",
};

interface ResultsTabProps {
  teacherId: string;
}

export function ResultsTab({ teacherId }: ResultsTabProps) {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [effectiveness, setEffectiveness] = useState<LecturerEffectivenessEntry[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    semesterService.getAll().then(setSemesters).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const semId = selectedSemester !== "ALL" ? selectedSemester : undefined;

      // Get allocations for this teacher to find relevant subjects
      const allocs = await lecturerService.getAllocations(teacherId, semId);
      const subjectIds = [...new Set(allocs.map((a) => a.subject_id))];

      if (subjectIds.length === 0) {
        setResults([]);
        setEffectiveness([]);
        setLoading(false);
        return;
      }

      // Load results for all subjects
      const allResults: StudentResult[] = [];
      await Promise.all(
        subjectIds.map(async (sid) => {
          const r = await studentResultService.getBySubject(sid, semId);
          allResults.push(...r.results);
        }),
      );

      setResults(allResults.sort((a, b) => b.date.localeCompare(a.date)));

      // Load effectiveness chart data
      const eff = await lecturerService.getEffectiveness(teacherId, semId);
      setEffectiveness(eff.results);
    } catch {
      setError("Failed to load results");
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedSemester]);

  useEffect(() => { load(); }, [load]);

  // Build chart data: group by subject, one bar per exam type
  const subjects = [...new Set(effectiveness.map((e) => e.subject_name))];
  const examTypes = [...new Set(effectiveness.map((e) => e.exam_type))];
  const chartData = subjects.map((sub) => {
    const row: Record<string, number | string> = { subject: sub };
    examTypes.forEach((et) => {
      const entry = effectiveness.find((e) => e.subject_name === sub && e.exam_type === et);
      row[et] = entry ? entry.avg_percent : 0;
    });
    return row;
  });

  const axisColor = resolvedTheme === "dark" ? "#71717a" : "#a1a1aa";

  return (
    <div className="space-y-4 pt-2">
      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
        <SelectTrigger className="w-44 h-8 text-xs">
          <SelectValue placeholder="All semesters" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All semesters</SelectItem>
          {semesters.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive text-center">{error}</p>
      ) : (
        <>
          {chartData.length > 0 && (
            <div className="rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground mb-3">Avg Score % by Subject & Exam Type</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barGap={2}>
                  <XAxis dataKey="subject" tick={{ fontSize: 10, fill: axisColor }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: axisColor }} unit="%" />
                  <Tooltip
                    formatter={(v) => [`${v}%`]}
                    contentStyle={{ fontSize: 11 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {examTypes.map((et) => (
                    <Bar key={et} dataKey={et} fill={EXAM_COLORS[et] ?? "#6366f1"} radius={[2, 2, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={EXAM_COLORS[et] ?? "#6366f1"} />
                      ))}
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No results found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Student</TableHead>
                    <TableHead className="text-xs">Subject</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs text-right">Score</TableHead>
                    <TableHead className="text-xs text-right">%</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r) => (
                    <TableRow key={r.id} className="text-xs">
                      <TableCell className="font-medium">{r.student_name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.subject_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${EXAM_BADGES[r.exam_type] ?? ""}`}>
                          {r.exam_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {r.score}/{r.max_score}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {r.percentage}%
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(r.date).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
