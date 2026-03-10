"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { invoiceService } from "@/lib/data";
import { Invoice, InvoiceStatus } from "@/types";
import {
  Zap,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";

function GenerateDialog({ onGenerated }: { onGenerated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
  } | null>(null);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await invoiceService.generateMonthly(month);
      setResult({ created: res.created, skipped: res.skipped });
      onGenerated();
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setResult(null);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Zap className="mr-2 h-4 w-4" /> Generate Monthly
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Generate Student Invoices</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Billing Month</Label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Creates one invoice per active enrollment for this month. Skips
              students who already have one.
            </p>
          </div>
          {result && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm">
              <p className="font-semibold text-green-700">✓ Done</p>
              <p className="text-green-600">
                {result.created} invoice{result.created !== 1 ? "s" : ""}{" "}
                created · {result.skipped} skipped
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              "Generate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-50 text-green-700 border-green-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  OVERDUE: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-slate-50 text-slate-500 border-slate-200",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "PAID") return <CheckCircle2 className="mr-1 h-3 w-3" />;
  if (status === "OVERDUE") return <AlertCircle className="mr-1 h-3 w-3" />;
  return <Clock className="mr-1 h-3 w-3" />;
};

export function StudentInvoiceTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await invoiceService.getAll({
        type: "STUDENT_PAYMENT",
        ...(monthFilter ? { month: monthFilter } : {}),
        ...(statusFilter ? { status: statusFilter as InvoiceStatus } : {}),
      });
      setInvoices(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [monthFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkPaid = async (id: string) => {
    setMarkingId(id);
    try {
      await invoiceService.markPaid(id);
      await load();
    } catch {
      // silently fail
    } finally {
      setMarkingId(null);
    }
  };

  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const paidAmount = invoices
    .filter((i) => i.status === "PAID")
    .reduce((s, i) => s + i.amount, 0);
  const pendingCount = invoices.filter(
    (i) => i.status === "PENDING" || i.status === "OVERDUE",
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Billed",
            value: `Rs. ${totalAmount.toLocaleString()}`,
            color: "slate",
          },
          {
            label: "Collected",
            value: `Rs. ${paidAmount.toLocaleString()}`,
            color: "green",
          },
          { label: "Pending/Overdue", value: pendingCount, color: "amber" },
        ].map(({ label, value, color }) => (
          <Card
            key={label}
            className={
              color === "green"
                ? "border-green-200 bg-green-50"
                : color === "amber"
                  ? "border-amber-200 bg-amber-50"
                  : ""
            }
          >
            <CardContent className="pt-4 pb-3 text-center">
              <p
                className={`text-2xl font-bold ${color === "green" ? "text-green-700" : color === "amber" ? "text-amber-700" : ""}`}
              >
                {value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Student Invoices</CardTitle>
            <CardDescription>
              Monthly fee invoices for all enrolled students.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-[160px] h-9 text-sm"
            />
            <Select
              value={statusFilter || "_all"}
              onValueChange={(v) => setStatusFilter(v === "_all" ? "" : v)}
            >
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <GenerateDialog onGenerated={load} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No invoices found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-sm">
                        {inv.billing_month}
                      </TableCell>
                      <TableCell className="text-sm">
                        {inv.student_id?.slice(0, 8) ?? "—"}…
                      </TableCell>
                      <TableCell className="font-semibold">
                        Rs. {inv.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STATUS_COLORS[inv.status] ?? ""}`}
                        >
                          <StatusIcon status={inv.status} />
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {inv.paid_at
                          ? new Date(inv.paid_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.status === "PENDING" ||
                          inv.status === "OVERDUE" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={markingId === inv.id}
                              onClick={() => handleMarkPaid(inv.id)}
                            >
                              {markingId === inv.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Mark Paid"
                              )}
                            </Button>
                          ) : null}
                          <a
                            href={invoiceService.downloadPDF(inv.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
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
