"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Download, Users, Layers, Percent, Loader2 } from "lucide-react";
import { teacherPaymentService } from "@/lib/data"; // use the centralized API client
const Spinner = (props: any) => (
  <Loader2 className="animate-spin h-4 w-4" {...props} />
);

type ClassSummary = {
  class_id: string;
  class_name: string;
  payout_percentage: number;
  student_count: number; // legacy: distinct students who paid (kept for compatibility)
  enrolled_students?: number; // distinct students enrolled in the class (from enrollments)
  paid_students?: number; // distinct students who made payment(s) for this class in the period
  revenue: number;
  payout_amount: number;
};

type TeacherFinancialSummaryResponse = {
  teacher: {
    id: string;
    full_name: string;
    email?: string | null;
    contact?: string | null;
  } | null;
  month: string;
  totals: {
    total_revenue: number;
    total_payout: number;
    total_students: number; // legacy: total paid students (kept for compatibility)
    total_enrolled_students?: number;
    total_paid_students?: number;
  };
  classes: ClassSummary[];
};

// Props
export interface TeacherFinancialSummaryProps {
  teacherId?: string | null; // "all" or undefined means no selection
  classId?: string | null;
  month?: string | null; // YYYY-MM
  // callbacks
  onClassSelect?: (classId: string | null) => void;
  // optional: allow overriding API base
  apiBaseUrl?: string;
}

export function TeacherFinancialSummary({
  teacherId,
  classId,
  month,
  onClassSelect,
  apiBaseUrl,
}: TeacherFinancialSummaryProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TeacherFinancialSummaryResponse | null>(
    null,
  );

  const base =
    apiBaseUrl ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000/api";

  const fetchSummary = useCallback(async () => {
    // If no specific teacher selected, clear the summary
    if (!teacherId || teacherId === "all") {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the centralized service in lib/data.ts so requests go through apiClient
      const resp = await teacherPaymentService.getTeacherFinancialSummary(
        teacherId,
        month || undefined,
        classId || undefined,
      );

      // apiClient already returns parsed JSON or throws; assign directly
      setData(resp as TeacherFinancialSummaryResponse);
    } catch (err) {
      // If the backend call fails (404 or network error), fall back to mock data
      const sample = createMockSummary(
        teacherId,
        month || getDefaultMonth(),
        classId,
      );
      setData(sample);
    } finally {
      setLoading(false);
    }
  }, [teacherId, classId, month]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Export CSV of the class rows
  const exportCSV = () => {
    if (!data) return;
    const rows = [
      [
        "Class Name",
        "Enrolled",
        "Paid",
        "Unpaid",
        "Revenue (LKR)",
        "Payout %",
        "Payout Amount (LKR)",
      ],
      ...data.classes.map((c) => {
        const enrolled =
          typeof c.enrolled_students === "number"
            ? c.enrolled_students
            : c.student_count;
        const paid =
          typeof c.paid_students === "number"
            ? c.paid_students
            : c.student_count;
        const unpaid = Math.max(enrolled - paid, 0);
        return [
          c.class_name,
          String(enrolled),
          String(paid),
          String(unpaid),
          String(c.revenue.toFixed(2)),
          String(c.payout_percentage),
          String(c.payout_amount.toFixed(2)),
        ];
      }),
    ];
    const csvContent = rows
      .map((r) =>
        r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `teacher-summary-${teacherId || "unknown"}-${data.month}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Utilities
  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // handle class row click
  const handleClassClick = (cId: string) => {
    if (onClassSelect) onClassSelect(cId);
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teacher Financial Summary
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {teacherId && teacherId !== "all" ? (
              data ? (
                <>
                  <span className="font-medium">{data.teacher?.full_name}</span>
                  <span className="ml-3">• Month: {data.month}</span>
                </>
              ) : (
                <span>Loading teacher summary…</span>
              )
            ) : (
              <span>Select a teacher to see a summary</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={exportCSV}
            disabled={!data || loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {loading && (
          <div className="flex items-center gap-2">
            <Spinner />
            <span>Loading...</span>
          </div>
        )}

        {!teacherId || teacherId === "all" ? (
          <div className="text-sm text-muted-foreground">
            Please select a teacher to view financial summary.
          </div>
        ) : !data ? (
          <div className="text-sm text-muted-foreground">
            No data available.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-muted/5 rounded-md">
                <div className="text-sm text-muted-foreground">Teacher</div>
                <div className="font-medium">{data.teacher?.full_name}</div>
                {data.teacher?.email && (
                  <div className="text-sm text-muted-foreground">
                    {data.teacher.email}
                  </div>
                )}
                {data.teacher?.contact && (
                  <div className="text-sm text-muted-foreground">
                    {data.teacher.contact}
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/5 rounded-md">
                <div className="text-sm text-muted-foreground">
                  Totals (Month)
                </div>
                <div className="text-xl font-semibold">
                  LKR {fmt(data.totals.total_revenue)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Revenue
                </div>
                <div className="text-xl font-semibold text-green-600 mt-2">
                  LKR {fmt(data.totals.total_payout)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Payout</div>
              </div>

              <div className="p-4 bg-muted/5 rounded-md">
                <div className="text-sm text-muted-foreground">Students</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Enrolled:{" "}
                  <span className="font-medium">
                    {data.totals.total_enrolled_students ??
                      data.totals.total_students}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Paid:{" "}
                  <span className="font-medium">
                    {data.totals.total_paid_students ??
                      data.totals.total_students}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Unpaid:{" "}
                  <span className="font-medium">
                    {Math.max(
                      (data.totals.total_enrolled_students ??
                        data.totals.total_students) -
                        (data.totals.total_paid_students ??
                          data.totals.total_students),
                      0,
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Enrolled</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Unpaid</TableHead>
                    <TableHead className="text-right">Revenue (LKR)</TableHead>
                    <TableHead className="text-right">Payout %</TableHead>
                    <TableHead className="text-right">Payout (LKR)</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.classes.map((c) => (
                    <TableRow
                      key={c.class_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleClassClick(c.class_id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{c.class_name}</div>
                            <div className="text-xs text-muted-foreground">
                              Class ID: {c.class_id}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        {c.enrolled_students ?? c.student_count}
                      </TableCell>
                      <TableCell className="text-right">
                        {c.paid_students ?? c.student_count}
                      </TableCell>
                      <TableCell className="text-right">
                        {Math.max(
                          (c.enrolled_students ?? c.student_count) -
                            (c.paid_students ?? c.student_count),
                          0,
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        LKR {fmt(c.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{c.payout_percentage}%</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        LKR {fmt(c.payout_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Helpers & Mock data (for frontend-first development)
 */

function getDefaultMonth() {
  const dt = new Date();
  dt.setMonth(dt.getMonth() - 1); // default to last month
  return dt.toISOString().substring(0, 7);
}

function createMockSummary(
  teacherId: string | undefined,
  month: string,
  onlyClassId?: string | null,
): TeacherFinancialSummaryResponse {
  // Create a few mock classes and numbers
  const classes: ClassSummary[] = [
    {
      class_id: "class-a",
      class_name: "Piano Beginners",
      payout_percentage: 60,
      student_count: 12,
      revenue: 120000,
      payout_amount: 120000 * 0.6,
    },
    {
      class_id: "class-b",
      class_name: "Guitar Intermediate",
      payout_percentage: 55,
      student_count: 8,
      revenue: 80000,
      payout_amount: 80000 * 0.55,
    },
    {
      class_id: "class-c",
      class_name: "Violin Advanced",
      payout_percentage: 65,
      student_count: 5,
      revenue: 50000,
      payout_amount: 50000 * 0.65,
    },
  ];

  const filtered = onlyClassId
    ? classes.filter((c) => c.class_id === onlyClassId)
    : classes;

  const totals = filtered.reduce(
    (acc, c) => {
      acc.total_revenue += c.revenue;
      acc.total_payout += c.payout_amount;
      acc.total_students += c.student_count;
      return acc;
    },
    { total_revenue: 0, total_payout: 0, total_students: 0 },
  );

  return {
    teacher: {
      id: teacherId || "unknown",
      full_name: `Teacher ${teacherId?.slice(0, 6) || "Demo"}`,
      email: "teacher@example.com",
      contact: "+94 77 123 4567",
    },
    month,
    totals,
    classes: filtered,
  };
}

export default TeacherFinancialSummary;
