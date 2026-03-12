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
import {
  studentPaymentRecordService,
  teacherPayoutRecordService,
  staffCommissionRecordService,
  expenseRecordService,
} from "@/lib/data";
import type {
  PaginatedFinancialResponse,
  StudentPaymentRecord,
  TeacherPayoutRecord,
  StaffCommissionRecord,
  ExpenseRecord,
} from "@/types";

interface FinancialSummary {
  totalStudentPayments: number;
  totalTeacherPayouts: number;
  totalStaffCommissions: number;
  totalExpenses: number;
  netIncome: number;
  transactionCounts: {
    studentPayments: number;
    teacherPayouts: number;
    staffCommissions: number;
    expenses: number;
  };
}

export function FinancialDashboard() {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalStudentPayments: 0,
    totalTeacherPayouts: 0,
    totalStaffCommissions: 0,
    totalExpenses: 0,
    netIncome: 0,
    transactionCounts: {
      studentPayments: 0,
      teacherPayouts: 0,
      staffCommissions: 0,
      expenses: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7),
  );

  const { toast } = useToast();

  const loadFinancialSummary = useCallback(async () => {
    try {
      setLoading(true);

      const filters = { month: selectedMonth, limit: 1000 };

      const [
        studentPaymentsRes,
        teacherPayoutsRes,
        staffCommissionsRes,
        expensesRes,
      ] = await Promise.all([
        studentPaymentRecordService.getAll(filters),
        teacherPayoutRecordService.getAll(filters),
        staffCommissionRecordService.getAll(filters),
        expenseRecordService.getAll(filters),
      ]);

      const totalStudentPayments = studentPaymentsRes.data.reduce(
        (sum, record) => sum + record.amount,
        0,
      );
      const totalTeacherPayouts = teacherPayoutsRes.data.reduce(
        (sum, record) => sum + record.amount,
        0,
      );
      const totalStaffCommissions = staffCommissionsRes.data.reduce(
        (sum, record) => sum + record.amount,
        0,
      );
      const totalExpenses = expensesRes.data.reduce(
        (sum, record) => sum + record.amount,
        0,
      );

      const netIncome =
        totalStudentPayments -
        totalTeacherPayouts -
        totalStaffCommissions -
        totalExpenses;

      setSummary({
        totalStudentPayments,
        totalTeacherPayouts,
        totalStaffCommissions,
        totalExpenses,
        netIncome,
        transactionCounts: {
          studentPayments: studentPaymentsRes.data.length,
          teacherPayouts: teacherPayoutsRes.data.length,
          staffCommissions: staffCommissionsRes.data.length,
          expenses: expensesRes.data.length,
        },
      });
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
    loadFinancialSummary();
  }, [loadFinancialSummary]);

  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const date = subMonths(new Date(), i);
    monthOptions.push({
      value: date.toISOString().substring(0, 7),
      label: format(date, "MMMM yyyy"),
    });
  }

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
          <Button variant="outline" onClick={loadFinancialSummary}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Student Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Student Payments
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              LKR {summary.totalStudentPayments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.transactionCounts.studentPayments} transactions
            </p>
          </CardContent>
        </Card>

        {/* Teacher Payouts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Teacher Payouts
            </CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              LKR {summary.totalTeacherPayouts.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.transactionCounts.teacherPayouts} transactions
            </p>
          </CardContent>
        </Card>

        {/* Staff Commissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Staff Commissions
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              LKR {summary.totalStaffCommissions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.transactionCounts.staffCommissions} transactions
            </p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              LKR {summary.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.transactionCounts.expenses} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Net Income Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Net Income</CardTitle>
            {summary.netIncome >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                summary.netIncome >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              LKR {summary.netIncome.toLocaleString()}
            </div>
            <div className="mt-2">
              <Badge
                variant={summary.netIncome >= 0 ? "default" : "destructive"}
              >
                {summary.netIncome >= 0 ? "Profit" : "Loss"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Financial Breakdown */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Financial Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Revenue (Student Payments)</span>
                <span className="font-medium text-green-600">
                  +LKR {summary.totalStudentPayments.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Teacher Payouts</span>
                <span className="font-medium text-orange-600">
                  -LKR {summary.totalTeacherPayouts.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Staff Commissions</span>
                <span className="font-medium text-blue-600">
                  -LKR {summary.totalStaffCommissions.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Operating Expenses</span>
                <span className="font-medium text-red-600">
                  -LKR {summary.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-bold">
                  <span>Net Income</span>
                  <span
                    className={
                      summary.netIncome >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {summary.netIncome >= 0 ? "+" : ""}LKR{" "}
                    {summary.netIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Transaction Summary for{" "}
            {format(new Date(selectedMonth + "-01"), "MMMM yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg dark:bg-green-950/30">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-medium">Student Payments</div>
                <div className="text-2xl font-bold text-green-600">
                  {summary.transactionCounts.studentPayments}
                </div>
                <div className="text-xs text-muted-foreground">
                  transactions
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg dark:bg-orange-950/30">
              <Users className="h-8 w-8 text-orange-600" />
              <div>
                <div className="font-medium">Teacher Payouts</div>
                <div className="text-2xl font-bold text-orange-600">
                  {summary.transactionCounts.teacherPayouts}
                </div>
                <div className="text-xs text-muted-foreground">
                  transactions
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg dark:bg-blue-950/30">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-medium">Staff Commissions</div>
                <div className="text-2xl font-bold text-blue-600">
                  {summary.transactionCounts.staffCommissions}
                </div>
                <div className="text-xs text-muted-foreground">
                  transactions
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg dark:bg-red-950/30">
              <Receipt className="h-8 w-8 text-red-600" />
              <div>
                <div className="font-medium">Expenses</div>
                <div className="text-2xl font-bold text-red-600">
                  {summary.transactionCounts.expenses}
                </div>
                <div className="text-xs text-muted-foreground">
                  transactions
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Average Transaction Amounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Student Payment</span>
              <span className="font-medium">
                LKR{" "}
                {summary.transactionCounts.studentPayments > 0
                  ? (
                      summary.totalStudentPayments /
                      summary.transactionCounts.studentPayments
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Teacher Payout</span>
              <span className="font-medium">
                LKR{" "}
                {summary.transactionCounts.teacherPayouts > 0
                  ? (
                      summary.totalTeacherPayouts /
                      summary.transactionCounts.teacherPayouts
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Staff Commission</span>
              <span className="font-medium">
                LKR{" "}
                {summary.transactionCounts.staffCommissions > 0
                  ? (
                      summary.totalStaffCommissions /
                      summary.transactionCounts.staffCommissions
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Expense</span>
              <span className="font-medium">
                LKR{" "}
                {summary.transactionCounts.expenses > 0
                  ? (
                      summary.totalExpenses / summary.transactionCounts.expenses
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : "0"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profit Margins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Gross Profit Margin</span>
              <span className="font-medium">
                {summary.totalStudentPayments > 0
                  ? (
                      ((summary.totalStudentPayments -
                        summary.totalTeacherPayouts) /
                        summary.totalStudentPayments) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Net Profit Margin</span>
              <span className="font-medium">
                {summary.totalStudentPayments > 0
                  ? (
                      (summary.netIncome / summary.totalStudentPayments) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Teacher Payout Rate</span>
              <span className="font-medium">
                {summary.totalStudentPayments > 0
                  ? (
                      (summary.totalTeacherPayouts /
                        summary.totalStudentPayments) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Expense Rate</span>
              <span className="font-medium">
                {summary.totalStudentPayments > 0
                  ? (
                      (summary.totalExpenses / summary.totalStudentPayments) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </span>
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
                Total Transactions
              </div>
              <div className="text-3xl font-bold">
                {summary.transactionCounts.studentPayments +
                  summary.transactionCounts.teacherPayouts +
                  summary.transactionCounts.staffCommissions +
                  summary.transactionCounts.expenses}
              </div>
            </div>
            <div className="space-y-1">
              <Badge
                variant={summary.netIncome >= 0 ? "default" : "destructive"}
                className="w-full justify-center"
              >
                {summary.netIncome >= 0
                  ? "Profitable Month"
                  : "Loss Making Month"}
              </Badge>
              {summary.totalStudentPayments > 0 && (
                <div className="text-xs text-center text-muted-foreground">
                  {(
                    (summary.netIncome / summary.totalStudentPayments) *
                    100
                  ).toFixed(1)}
                  % profit margin
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
