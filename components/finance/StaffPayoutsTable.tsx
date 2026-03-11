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
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { invoiceService, userService } from "@/lib/data";
import { Invoice, InvoiceStatus } from "@/types";
import {
  DollarSign,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  commission_percentage?: number;
  role: string;
  status: string;
}

function CreateStaffCommissionDialog({
  staff,
  onCreated,
}: {
  staff: User[];
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    staff_id: "",
    billing_month: new Date().toISOString().slice(0, 7),
    total_amount: "",
    notes: "",
  });

  const reset = () => {
    setForm({
      staff_id: "",
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
      await invoiceService.createStaffCommission({
        staff_id: form.staff_id,
        billing_month: form.billing_month,
        total_amount: Number(form.total_amount),
        notes: form.notes || undefined,
      });
      setOpen(false);
      reset();
      onCreated();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create staff commission",
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedStaff = staff.find((s) => s.id === form.staff_id);

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
          <Plus className="mr-2 h-4 w-4" /> Create Staff Commission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Staff Commission</DialogTitle>
            <DialogDescription>
              Create a commission payment record for staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Staff Member</Label>
              <Select
                value={form.staff_id}
                onValueChange={(value) => {
                  setForm({ ...form, staff_id: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff
                    .filter((s) => s.role === "STAFF" && s.status === "ACTIVE")
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}{" "}
                        {s.commission_percentage &&
                          `(${s.commission_percentage}%)`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label>Amount (LKR)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.total_amount}
                  onChange={(e) =>
                    setForm({ ...form, total_amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional commission details..."
                rows={2}
              />
            </div>

            {selectedStaff?.commission_percentage && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>{selectedStaff.name}</strong> has a{" "}
                  <strong>{selectedStaff.commission_percentage}%</strong>{" "}
                  commission rate.
                </p>
              </div>
            )}

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
            <Button
              type="submit"
              disabled={loading || !form.staff_id || !form.total_amount}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                "Create Commission"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StaffPayoutsTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [invoicesData, usersData] = await Promise.all([
        invoiceService.getAll({
          type: "STAFF_COMMISSION",
          ...(monthFilter ? { month: monthFilter } : {}),
          ...(statusFilter && statusFilter !== "ALL"
            ? { status: statusFilter as InvoiceStatus }
            : {}),
        }),
        userService.getAll(),
      ]);
      setInvoices(invoicesData || []);
      setStaff(usersData || []);
    } catch (error) {
      console.error("Failed to load staff commissions:", error);
      setError("Failed to load staff commission data");
      setInvoices([]);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [monthFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkPaid = async (id: string) => {
    setProcessing(id);
    try {
      await invoiceService.markPaid(id);
      await load();
    } catch (error) {
      console.error("Failed to mark invoice as paid:", error);
    } finally {
      setProcessing(null);
    }
  };

  const fmt = (n: number) => `LKR ${Number(n ?? 0).toLocaleString()}`;
  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB") : "—";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case "UNPAID":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate stats
  const totalAmount = invoices.reduce(
    (sum, inv) => sum + (inv.total_amount || 0),
    0,
  );
  const paidAmount = invoices
    .filter((inv) => inv.payment_status === "PAID")
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const pendingAmount = invoices
    .filter((inv) => inv.payment_status === "UNPAID")
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const pendingCount = invoices.filter(
    (inv) => inv.payment_status === "UNPAID",
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Commissions
                </p>
                <p className="text-lg font-semibold">{fmt(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-lg font-semibold">{fmt(paidAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-semibold">{fmt(pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-lg font-semibold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Commissions
            </CardTitle>
            <CardDescription>
              Manage staff commission payments and track earnings.
            </CardDescription>
          </div>
          <CreateStaffCommissionDialog staff={staff} onCreated={load} />
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Label htmlFor="month-filter" className="text-sm">
                Month:
              </Label>
              <Input
                id="month-filter"
                type="month"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="status-filter" className="text-sm">
                Status:
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="UNPAID">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : (invoices || []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No staff commissions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  (invoices || []).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-sm font-medium">
                            Staff Commission
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {invoice.recipient_id || "Unknown"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {invoice.id.slice(-8)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {invoice.billing_month
                            ? new Date(
                                invoice.billing_month,
                              ).toLocaleDateString("en-GB", {
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {fmt(invoice.total_amount || 0)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.payment_status)}
                        {invoice.paid_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Paid: {fmtDate(invoice.paid_at)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmtDate(invoice.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {invoice.payment_status === "UNPAID" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkPaid(invoice.id)}
                              disabled={processing === invoice.id}
                            >
                              {processing === invoice.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Mark Paid"
                              )}
                            </Button>
                          )}
                          <a
                            href={invoiceService.downloadPDF(invoice.id)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              PDF
                            </Button>
                          </a>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
