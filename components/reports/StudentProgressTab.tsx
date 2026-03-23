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
import { Search, Loader2, GraduationCap, BookOpen, Wallet } from "lucide-react";
import { reportService } from "@/lib/data";
import { StudentProgressReport } from "@/types";

const EXAM_COLORS: Record<string, string> = {
  MIDTERM: "#6366f1",
  FINAL: "#10b981",
  QUIZ: "#f59e0b",
  ASSIGNMENT: "#3b82f6",
};

const STATUS_STYLES: Record<string, string> = {
  ENROLLED: "text-green-600 border-green-300 bg-green-50",
  DROPPED: "text-destructive border-destructive/30 bg-destructive/5",
  COMPLETED: "text-blue-600 border-blue-300 bg-blue-50",
};

export function StudentProgressTab() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StudentProgressReport | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    if (!studentId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await reportService.getStudentProgress(studentId.trim());
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Student not found");
    } finally {
      setLoading(false);
    }
  };

  const attColor =
    data && data.attend_rate >= 80
      ? "text-green-600"
      : data && data.attend_rate >= 60
        ? "text-amber-600"
        : "text-destructive";

  return (
    <div className="space-y-6">
      {/* Lookup */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Student Lookup</CardTitle>
          <CardDescription>Enter the student&apos;s UUID to view their full academic profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="space-y-1.5 flex-1 max-w-sm">
              <Label>Student ID</Label>
              <Input
                placeholder="UUID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
              />
            </div>
            <Button onClick={load} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Load
            </Button>
          </div>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && data && (
        <div className="space-y-5">
          {/* Student header */}
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold">{data.full_name}</p>
                  <p className="text-sm text-muted-foreground">{data.admission_no}</p>
                </div>
              </div>

              {/* Attendance + fees at a glance */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${attColor}`}>{data.attend_rate}%</p>
                  <p className="text-xs text-muted-foreground">Attendance Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{data.attend_present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-destructive">{data.attend_absent}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(data.total_fees_paid)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Fees Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrollments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Enrollments ({data.enrollments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {data.enrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No enrollments</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.enrollments.map((e) => (
                    <div key={e.enrollment_id} className="flex items-center gap-1.5 border rounded-md px-2 py-1 text-sm">
                      <span className="font-medium">{e.class_name}</span>
                      <Badge variant="outline" className={`text-xs ${STATUS_STYLES[e.status] ?? ""}`}>
                        {e.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {data.results.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Assessment Results</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Avg Score</TableHead>
                      <TableHead className="text-right">Max</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.results.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{r.subject_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: EXAM_COLORS[r.exam_type] + "80", color: EXAM_COLORS[r.exam_type] }}
                          >
                            {r.exam_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{r.avg_score}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-muted-foreground">{r.max_score}</TableCell>
                        <TableCell className="text-right font-mono text-sm">{r.avg_percent}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Payment history */}
          {data.payments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Payment History ({data.payments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-sm">
                          {new Date(p.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", maximumFractionDigits: 0 }).format(p.amount)}
                        </TableCell>
                        <TableCell className="text-sm">{p.payment_method}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.notes || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!loading && !data && (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
          <GraduationCap className="h-10 w-10 opacity-20" />
          <p className="text-sm">Enter a student ID to view their progress</p>
        </div>
      )}
    </div>
  );
}
