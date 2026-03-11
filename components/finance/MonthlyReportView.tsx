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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportService, expenseService } from "@/lib/data";
import { MonthlyReport, Expense, ExpenseCategory } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Loader2,
  Plus,
  Receipt,
  PieChart,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "UTILITIES",
  "MAINTENANCE",
  "SUPPLIES",
  "SALARY",
  "MARKETING",
  "OTHER",
];

function AddExpenseDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "OTHER" as ExpenseCategory,
    expense_date: new Date().toISOString().split("T")[0],
  });

  const reset = () => {
    setForm({
      description: "",
      amount: "",
      category: "OTHER",
      expense_date: new Date().toISOString().split("T")[0],
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await expenseService.create({
        description: form.description,
        amount: Number(form.amount),
        category: form.category,
        expense_date: form.expense_date,
      });
      setOpen(false);
      reset();
      onAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
                placeholder="e.g. Electricity bill"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Amount (Rs.)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({ ...form, category: v as ExpenseCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.expense_date}
                onChange={(e) =>
                  setForm({ ...form, expense_date: e.target.value })
                }
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                "Save Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  label,
  value,
  sub,
  positive,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold font-mono">{value}</p>
        {sub && (
          <p
            className={cn(
              "text-xs mt-0.5",
              positive ? "text-green-600" : "text-red-500",
            )}
          >
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function MonthlyReportView() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rep, expData] = await Promise.all([
        reportService.getMonthly(month),
        expenseService.getAll({ month }),
      ]);
      setReport(rep);
      setExpenses(expData.expenses ?? []);
    } catch {
      setError(
        "Failed to load report data. The report may not exist for this month yet.",
      );
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await reportService.saveMonthly(month);
      await load();
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => `Rs. ${n.toLocaleString()}`;

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Month</label>
          <Input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-[160px] h-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Snapshot
          </Button>
          <a
            href={reportService.downloadPDF(month)}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          </a>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && !loading && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 text-sm text-amber-700">
            {error}
          </CardContent>
        </Card>
      )}

      {report && !loading && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard
              label="Total Collected"
              value={fmt(report.total_collected)}
              icon={DollarSign}
              positive
            />
            <StatCard
              label="Teacher Payouts"
              value={fmt(report.total_teacher_payouts)}
              icon={TrendingDown}
            />
            <StatCard
              label="Staff Commissions"
              value={fmt(report.total_staff_commissions)}
              icon={TrendingDown}
            />
            <StatCard
              label="Total Expenses"
              value={fmt(report.total_expenses)}
              icon={Receipt}
            />
            <StatCard
              label="Net Income"
              value={fmt(report.net_income)}
              icon={TrendingUp}
              positive={report.net_income >= 0}
            />
            <StatCard
              label="Pending Invoices"
              value={String(report.pending_invoices.count)}
              sub={fmt(report.pending_invoices.amount) + " outstanding"}
              icon={PieChart}
            />
          </div>

          {/* Revenue bar */}
          {report.total_collected > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Income Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const total = report.total_collected;
                  const bars = [
                    {
                      label: "Teacher Payouts",
                      value: report.total_teacher_payouts,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Staff Commissions",
                      value: report.total_staff_commissions,
                      color: "bg-indigo-500",
                    },
                    {
                      label: "Expenses",
                      value: report.total_expenses,
                      color: "bg-rose-400",
                    },
                    {
                      label: "Net Income",
                      value: Math.max(report.net_income, 0),
                      color: "bg-emerald-500",
                    },
                  ].filter((b) => b.value > 0);

                  return (
                    <>
                      <div className="flex h-4 w-full rounded-full overflow-hidden mb-4">
                        {bars.map((b, i) => (
                          <div
                            key={i}
                            className={cn("h-full", b.color)}
                            style={{ width: `${(b.value / total) * 100}%` }}
                            title={`${b.label}: ${fmt(b.value)}`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {bars.map((b, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div
                              className={cn("h-3 w-3 rounded-sm", b.color)}
                            />
                            <span className="text-xs font-medium">
                              {b.label}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {fmt(b.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expenses — {month}</CardTitle>
            <CardDescription>
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""} ·
              Total: Rs.{" "}
              {expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}
            </CardDescription>
          </div>
          <AddExpenseDialog onAdded={load} />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No expenses recorded for {month}.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-sm">
                        {new Date(e.expense_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {e.description}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                          {e.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        Rs. {e.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
