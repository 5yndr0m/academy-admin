"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { financeOverviewService } from "@/lib/data";
import type { MonthlyOverviewResponse, ClassPayoutStatus } from "@/types";

const fmt = (n: number) =>
  n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const payoutStatusVariant = (
  s: ClassPayoutStatus,
): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "PAID") return "default";
  if (s === "PARTIAL") return "secondary";
  return "destructive";
};

export function MonthlyOverview() {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<MonthlyOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await financeOverviewService.getMonthlyOverview(month);
      setData(result);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load monthly overview",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [month, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const isPositive = (n: number) => n >= 0;

  return (
    <div className="space-y-6">
      {/* Month selector + refresh */}
      <div className="flex items-end gap-4">
        <div>
          <Label htmlFor="overview-month">Month</Label>
          <Input
            id="overview-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-44"
          />
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
        {data && (
          <p className="text-xs text-muted-foreground self-end pb-1">
            Generated at {format(new Date(data.generated_at), "HH:mm:ss")}
          </p>
        )}
      </div>

      {loading && !data && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Student Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  LKR {fmt(data.total_student_revenue)}
                </p>
                {data.total_admission_fees > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    + LKR {fmt(data.total_admission_fees)} admission fees
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Teacher Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  LKR {fmt(data.total_teacher_payouts)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Net Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  LKR {fmt(data.net_revenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  after teacher payouts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Staff Commissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  LKR {fmt(data.total_staff_commissions)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  LKR {fmt(data.total_expenses)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Institute Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  {isPositive(data.institute_income) ? (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                  )}
                  <p
                    className={`text-xl font-bold ${
                      isPositive(data.institute_income)
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    LKR {fmt(data.institute_income)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Class Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {data.class_breakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No student payments recorded for this month.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead className="text-right">Students</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Payout %</TableHead>
                        <TableHead className="text-right">Expected Payout</TableHead>
                        <TableHead className="text-right">Actual Payout</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.class_breakdown
                        .sort((a, b) => b.total_revenue - a.total_revenue)
                        .map((cls) => (
                          <TableRow key={cls.class_id}>
                            <TableCell className="font-medium">
                              {cls.class_name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {cls.teacher_name}
                            </TableCell>
                            <TableCell className="text-right">
                              {cls.student_count}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              LKR {fmt(cls.total_revenue)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">
                                {cls.payout_percentage}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              LKR {fmt(cls.expected_payout)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              LKR {fmt(cls.actual_payout)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={payoutStatusVariant(cls.payout_status)}
                              >
                                {cls.payout_status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      {/* Totals row */}
                      <TableRow className="font-semibold border-t-2">
                        <TableCell colSpan={3}>Totals</TableCell>
                        <TableCell className="text-right">
                          LKR {fmt(data.total_student_revenue)}
                        </TableCell>
                        <TableCell />
                        <TableCell className="text-right text-muted-foreground">
                          LKR{" "}
                          {fmt(
                            data.class_breakdown.reduce(
                              (s, c) => s + c.expected_payout,
                              0,
                            ),
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          LKR {fmt(data.total_teacher_payouts)}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expenses by category + P&L summary side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expense by category */}
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(data.expense_by_category).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No expenses recorded for this month.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(data.expense_by_category)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, amount]) => (
                        <div key={cat} className="flex justify-between items-center py-1 border-b last:border-b-0">
                          <span className="text-sm capitalize">
                            {cat.replace("_", " ")}
                          </span>
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            LKR {fmt(amount)}
                          </span>
                        </div>
                      ))}
                    <div className="flex justify-between items-center pt-2 font-semibold">
                      <span className="text-sm">Total</span>
                      <span className="text-sm text-red-600 dark:text-red-400">
                        LKR {fmt(data.total_expenses)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* P&L summary */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly P&amp;L Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Class revenue</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      + LKR {fmt(data.total_student_revenue)}
                    </span>
                  </div>
                  {data.total_admission_fees > 0 && (
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Admission fees</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        + LKR {fmt(data.total_admission_fees)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-t">
                    <span className="text-muted-foreground">Teacher payouts</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      − LKR {fmt(data.total_teacher_payouts)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t bg-muted/30 px-2 rounded">
                    <span className="font-medium">Net revenue</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      LKR {fmt(data.net_revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Staff commissions</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      − LKR {fmt(data.total_staff_commissions)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Expenses</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      − LKR {fmt(data.total_expenses)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 mt-2">
                    <span className="font-bold text-base">Institute Income</span>
                    <span
                      className={`font-bold text-base ${
                        isPositive(data.institute_income)
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isPositive(data.institute_income) ? "" : "−"} LKR{" "}
                      {fmt(Math.abs(data.institute_income))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
