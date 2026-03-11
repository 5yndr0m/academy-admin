"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { MonthlyReport } from "@/types";
import { invoiceService, reportService } from "@/lib/data";
import { cn } from "@/lib/utils";

interface DashboardFinanceSummaryProps {
  financial: MonthlyReport | null;
}

function StatRow({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: "green" | "red" | "amber";
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span
          className={cn(
            "text-sm font-semibold font-mono",
            highlight === "green" && "text-green-700",
            highlight === "red" && "text-red-600",
            highlight === "amber" && "text-amber-600",
          )}
        >
          {value}
        </span>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardFinanceSummary({
  financial,
}: DashboardFinanceSummaryProps) {
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingMsg, setBillingMsg] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const runMonthlyBilling = async () => {
    setBillingLoading(true);
    setBillingMsg(null);
    try {
      const result = await invoiceService.generateMonthly(currentMonth);
      setBillingMsg(
        `Done — ${result.created} invoices created, ${result.skipped} skipped.`,
      );
    } catch (err: unknown) {
      setBillingMsg(err instanceof Error ? err.message : "Billing failed");
    } finally {
      setBillingLoading(false);
    }
  };

  const fmt = (n: number) => `LKR ${n.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              MTD Collections
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-green-700">
              {financial ? fmt(financial.total_collected) : "—"}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              {currentMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600">
              {financial ? fmt(financial.pending_invoices.amount) : "—"}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              {financial
                ? `${financial.pending_invoices.count} invoices outstanding`
                : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-red-600">
              {financial
                ? fmt(
                    financial.total_teacher_payouts +
                      financial.total_staff_commissions,
                  )
                : "—"}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Teachers + Staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold font-mono",
                financial && financial.net_income >= 0
                  ? "text-green-700"
                  : "text-red-600",
              )}
            >
              {financial ? fmt(financial.net_income) : "—"}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              After all deductions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Breakdown — {currentMonth}
            </CardTitle>
            <CardDescription>
              Revenue vs expenses for this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {financial ? (
              <>
                <StatRow
                  label="Total Collected"
                  value={fmt(financial.total_collected)}
                  highlight="green"
                />
                <StatRow
                  label="Teacher Payouts"
                  value={fmt(financial.total_teacher_payouts)}
                  highlight="red"
                />
                <StatRow
                  label="Staff Commissions"
                  value={fmt(financial.total_staff_commissions)}
                  highlight="red"
                />
                <StatRow
                  label="Operational Expenses"
                  value={fmt(financial.total_expenses)}
                  highlight="amber"
                />
                <StatRow
                  label="Net Income"
                  value={fmt(financial.net_income)}
                  highlight={financial.net_income >= 0 ? "green" : "red"}
                  sub="collected − payouts − commissions − expenses"
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No financial data for this month yet.
                <br />
                Generate invoices first, then this summary will populate.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Financial operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-sm"
              onClick={runMonthlyBilling}
              disabled={billingLoading}
            >
              {billingLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                "📋 Run Monthly Billing"
              )}
            </Button>

            <a
              href={reportService.downloadPDF(currentMonth)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="w-full justify-start text-sm"
              >
                📄 Download Monthly Report PDF
              </Button>
            </a>

            {billingMsg && (
              <p className="text-xs text-muted-foreground bg-muted px-3 py-2 rounded">
                {billingMsg}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
