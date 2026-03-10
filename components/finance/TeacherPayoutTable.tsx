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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invoiceService, teacherService } from "@/lib/data";
import { Invoice, Teacher } from "@/types";
import {
  DollarSign,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";

function CreatePayoutDialog({
  teachers,
  onCreated,
}: {
  teachers: Teacher[];
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    teacher_id: "",
    billing_month: new Date().toISOString().slice(0, 7), // YYYY-MM
    total_amount: "",
    notes: "",
  });

  const reset = () => {
    setForm({
      teacher_id: "",
      billing_month: new Date().toISOString().slice(0, 7),
      total_amount: "",
      notes: "",
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await invoiceService.createTeacherPayout({
        teacher_id: form.teacher_id,
        billing_month: form.billing_month,
        total_amount: Number(form.total_amount),
        notes: form.notes || undefined,
      });
      setOpen(false);
      reset();
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create payout");
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
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> New Payout
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Teacher Payout</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Teacher</Label>
              <Select
                value={form.teacher_id}
                onValueChange={(v) => setForm({ ...form, teacher_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher…" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.full_name ?? (t as any).fullname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Billing Month</Label>
                <Input
                  type="month"
                  value={form.billing_month}
                  onChange={(e) =>
                    setForm({ ...form, billing_month: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Amount (Rs.)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.total_amount}
                  onChange={(e) =>
                    setForm({ ...form, total_amount: e.target.value })
                  }
                  required
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>
                Notes{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. March payout"
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
            <Button type="submit" disabled={loading || !form.teacher_id}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                "Create Payout"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function TeacherPayoutTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [invData, tData] = await Promise.all([
        invoiceService.getAll({ type: "TEACHER_PAYOUT" }),
        teacherService.getAll(),
      ]);
      setInvoices(invData);
      setTeachers(tData);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

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

  const getTeacherName = (id?: string | null) => {
    if (!id) return "—";
    const t = teachers.find((t) => t.id === id);
    return t ? (t.full_name ?? (t as any).fullname) : id.slice(0, 8) + "…";
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const totalPaid = invoices
    .filter((i) => i.payment_status === "PAID")
    .reduce((s, i) => s + i.total_amount, 0);
  const totalPending = invoices
    .filter((i) => i.payment_status === "UNPAID")
    .reduce((s, i) => s + i.total_amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Payouts", value: invoices.length, color: "slate" },
          {
            label: "Paid",
            value: `Rs. ${totalPaid.toLocaleString()}`,
            color: "green",
          },
          {
            label: "Pending",
            value: `Rs. ${totalPending.toLocaleString()}`,
            color: "amber",
          },
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Teacher Payouts</CardTitle>
            <CardDescription>
              Track and process teacher earnings per billing month.
            </CardDescription>
          </div>
          <CreatePayoutDialog teachers={teachers} onCreated={load} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No teacher payout invoices yet.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                        {getTeacherName(inv.recipient_id)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {inv.billing_month}
                    </TableCell>
                    <TableCell className="font-semibold text-green-700">
                      Rs. {inv.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inv.billing_month || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.payment_status === "PAID"
                            ? "outline"
                            : "secondary"
                        }
                        className={
                          inv.payment_status === "PAID"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : ""
                        }
                      >
                        {inv.payment_status === "PAID" ? (
                          <>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Paid
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            {inv.payment_status}
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.payment_status === "UNPAID" && (
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
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
