"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Users,
  GraduationCap,
  Receipt,
  TrendingUp,
  TrendingDown,
  Calculator,
  Calendar,
} from "lucide-react";
import { format, subMonths } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { financeOverviewService } from "@/lib/data";
import type { MonthlyOverviewResponse } from "@/types";

export function FinancialDashboard() {
  const [data, setData] = useState<MonthlyOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7),
  );

  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await financeOverviewService.getMonthlyOverview(selectedMonth);
      setData(result);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load financial summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const date = subMonths(new Date(), i);
    monthOptions.push({
      value: date.toISOString().substring(0, 7),
      label: format(date, "MMMM yyyy"),
    });
  }

  const fmt = (n: number) =>
    n.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">Financial Dashboard</h3>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isProfit = data.institute_income >= 0;
  const totalCollected = data.total_student_revenue + data.total_admission_fees;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Financial Dashboard</h3>
          <p className="text-muted-foreground">
            Overview of financial transactions and performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={load}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Student Payments
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              LKR {fmt(totalCollected)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.total_admission_fees > 0
                ? `incl. LKR ${fmt(data.total_admission_fees)} admission fees`
                : `${data.class_breakdown.reduce((s, c) => s + c.student_count, 0)} student payments`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Teacher Payouts
            </CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              LKR {fmt(data.total_teacher_payouts)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.class_breakdown.length} class{data.class_breakdown.length !== 1 ? "es" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Staff Commissions
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              LKR {fmt(data.total_staff_commissions)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              LKR {fmt(data.total_expenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(data.expense_by_category).length} categor{Object.keys(data.expense_by_category).length !== 1 ? "ies" : "y"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Net Income + Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Institute Income</CardTitle>
            {isProfit ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
              LKR {fmt(Math.abs(data.institute_income))}
            </div>
            <div className="mt-2">
              <Badge variant={isProfit ? "default" : "destructive"}>
                {isProfit ? "Profitable" : "Loss"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Financial Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Class revenue</span>
                <span className="font-medium text-green-600">
                  + LKR {fmt(data.total_student_revenue)}
                </span>
              </div>
              {data.total_admission_fees > 0 && (
                <div className="flex justify-between items-center">
                  <span>Admission fees</span>
                  <span className="font-medium text-green-600">
                    + LKR {fmt(data.total_admission_fees)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-muted-foreground">Teacher payouts</span>
                <span className="font-medium text-orange-600">
                  − LKR {fmt(data.total_teacher_payouts)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Staff commissions</span>
                <span className="font-medium text-blue-600">
                  − LKR {fmt(data.total_staff_commissions)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Operating expenses</span>
                <span className="font-medium text-red-600">
                  − LKR {fmt(data.total_expenses)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-bold">
                  <span>Institute Income</span>
                  <span className={isProfit ? "text-green-600" : "text-red-600"}>
                    {isProfit ? "+" : "−"} LKR {fmt(Math.abs(data.institute_income))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profit Margins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Gross Profit Margin</span>
              <span className="font-medium">
                {totalCollected > 0
                  ? (((totalCollected - data.total_teacher_payouts) / totalCollected) * 100).toFixed(1)
                  : "0"}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Net Profit Margin</span>
              <span className="font-medium">
                {totalCollected > 0
                  ? ((data.institute_income / totalCollected) * 100).toFixed(1)
                  : "0"}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Teacher Payout Rate</span>
              <span className="font-medium">
                {data.total_student_revenue > 0
                  ? ((data.total_teacher_payouts / data.total_student_revenue) * 100).toFixed(1)
                  : "0"}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Expense Rate</span>
              <span className="font-medium">
                {totalCollected > 0
                  ? ((data.total_expenses / totalCollected) * 100).toFixed(1)
                  : "0"}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Net Revenue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total collected</span>
              <span className="font-medium">LKR {fmt(data.total_collected)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-muted-foreground">− Teacher payouts</span>
              <span className="font-medium">LKR {fmt(data.total_teacher_payouts)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Net revenue</span>
              <span className="text-blue-600">LKR {fmt(data.net_revenue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">
                {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
              </div>
              <div className="text-3xl font-bold">
                {data.class_breakdown.length}
              </div>
              <div className="text-xs text-muted-foreground">active classes</div>
            </div>
            <div className="space-y-1">
              <Badge
                variant={isProfit ? "default" : "destructive"}
                className="w-full justify-center"
              >
                {isProfit ? "Profitable Month" : "Loss Making Month"}
              </Badge>
              {totalCollected > 0 && (
                <div className="text-xs text-center text-muted-foreground">
                  {((data.institute_income / totalCollected) * 100).toFixed(1)}% profit margin
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
