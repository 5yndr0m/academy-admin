"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { invoiceService } from "@/lib/data";
import { Invoice, InvoiceStatus } from "@/types";
import {
  Zap,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  MoreHorizontal,
  FileText,
  DollarSign,
  Trash2,
  AlertTriangle,
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
  UNPAID: "bg-amber-50 text-amber-700 border-amber-200",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "PAID") return <CheckCircle2 className="mr-1 h-3 w-3" />;
  return <Clock className="mr-1 h-3 w-3" />;
};

function StudentInvoiceContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkActionError, setBulkActionError] = useState<string | null>(null);
  const [bulkActionSuccess, setBulkActionSuccess] = useState<string | null>(
    null,
  );
  const searchParams = useSearchParams();
  const studentIdFilter = searchParams.get("student_id");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let data = await invoiceService.getAll({
        type: "STUDENT_PAYMENT",
        ...(monthFilter ? { month: monthFilter } : {}),
        ...(statusFilter ? { status: statusFilter as InvoiceStatus } : {}),
      });

      // Filter by student if student_id parameter is present
      if (studentIdFilter) {
        data = data.filter((invoice) => invoice.student_id === studentIdFilter);
      }

      setInvoices(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [monthFilter, statusFilter, studentIdFilter]);

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

  const totalAmount = invoices.reduce((s, i) => s + i.total_amount, 0);
  const paidAmount = invoices
    .filter((i) => i.payment_status === "PAID")
    .reduce((s, i) => s + i.total_amount, 0);
  const pendingCount = invoices.filter(
    (i) => i.payment_status === "UNPAID",
  ).length;

  // Bulk selection functions
  const isAllSelected =
    invoices.length > 0 && selectedIds.size === invoices.length;
  const isSomeSelected =
    selectedIds.size > 0 && selectedIds.size < invoices.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(invoices.map((inv) => inv.id)));
    }
  };

  const handleSelectInvoice = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // Bulk actions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleBulkAction = async (
    action: "PAY" | "GENERATE_PDF" | "DELETE",
  ) => {
    if (selectedIds.size === 0) return;

    if (action === "DELETE") {
      setDeleteDialogOpen(true);
      return;
    }

    setBulkActionLoading(true);
    setBulkActionError(null);
    setBulkActionSuccess(null);

    try {
      const result = await invoiceService.bulkAction({
        action,
        invoice_ids: Array.from(selectedIds),
      });

      // Show success message
      const actionText =
        action === "PAY"
          ? "marked as paid"
          : action === "GENERATE_PDF"
            ? "PDFs generated"
            : "processed";
      setBulkActionSuccess(
        `${result.processed} invoice${result.processed !== 1 ? "s" : ""} ${actionText} successfully`,
      );

      // Clear selection and reload
      setSelectedIds(new Set());
      await load();

      // Auto-hide success message after 3 seconds
      setTimeout(() => setBulkActionSuccess(null), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Bulk operation failed";
      setBulkActionError(errorMessage);
      console.error("Bulk action failed:", error);

      // Auto-hide error message after 5 seconds
      setTimeout(() => setBulkActionError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const confirmBulkDelete = async () => {
    setBulkActionLoading(true);
    setBulkActionError(null);
    setBulkActionSuccess(null);
    setDeleteDialogOpen(false);

    try {
      const result = await invoiceService.bulkAction({
        action: "DELETE",
        invoice_ids: Array.from(selectedIds),
      });

      setBulkActionSuccess(
        `${result.processed} invoice${result.processed !== 1 ? "s" : ""} deleted successfully`,
      );

      // Clear selection and reload
      setSelectedIds(new Set());
      await load();

      // Auto-hide success message after 3 seconds
      setTimeout(() => setBulkActionSuccess(null), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete invoices";
      setBulkActionError(errorMessage);
      console.error("Bulk delete failed:", error);

      // Auto-hide error message after 5 seconds
      setTimeout(() => setBulkActionError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

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
                ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                : color === "amber"
                  ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30"
                  : ""
            }
          >
            <CardContent className="pt-4 pb-3 text-center">
              <p
                className={`text-2xl font-bold ${color === "green" ? "text-green-700 dark:text-green-300" : color === "amber" ? "text-amber-700 dark:text-amber-300" : ""}`}
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
            <CardTitle>
              Student Invoices
              {studentIdFilter && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Filtered by Student)
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {studentIdFilter
                ? "Invoices for the selected student."
                : "Monthly fee invoices for all enrolled students."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Success/Error Messages */}
            {bulkActionSuccess && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <span className="text-sm text-green-700 dark:text-green-300">
                  ✓ {bulkActionSuccess}
                </span>
              </div>
            )}
            {bulkActionError && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <span className="text-sm text-red-700 dark:text-red-300">
                  ⚠ {bulkActionError}
                </span>
              </div>
            )}

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedIds.size} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={bulkActionLoading}
                      className="h-7 text-xs"
                    >
                      {bulkActionLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Actions"
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction("PAY")}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Mark as Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("GENERATE_PDF")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate PDFs
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleBulkAction("DELETE")}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                  className="h-7 text-xs px-2"
                >
                  Clear
                </Button>
              </div>
            )}
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
            {studentIdFilter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.history.replaceState({}, "", "/finance?tab=invoices")
                }
                className="h-9 text-sm"
              >
                Clear Student Filter
              </Button>
            )}
            <GenerateDialog onGenerated={load} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected || isSomeSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all invoices"
                    />
                  </TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>
                    {studentIdFilter ? "Student" : "Student"}
                  </TableHead>
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
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No invoices found for the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className={
                        selectedIds.has(inv.id)
                          ? "bg-blue-50 dark:bg-blue-950/20"
                          : ""
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(inv.id)}
                          onCheckedChange={(checked) =>
                            handleSelectInvoice(inv.id, checked as boolean)
                          }
                          aria-label={`Select invoice for ${inv.student?.fullname}`}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {inv.billing_month}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <p className="font-medium">
                            {inv.student?.fullname ?? "Unknown Student"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {inv.student_id?.slice(0, 8) ?? "—"}…
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        Rs. {inv.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STATUS_COLORS[inv.payment_status] ?? ""}`}
                        >
                          <StatusIcon status={inv.payment_status} />
                          {inv.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {inv.paid_at
                          ? new Date(inv.paid_at).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.payment_status === "UNPAID" ? (
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

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Bulk Delete
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete {selectedIds.size} selected
              invoice{selectedIds.size !== 1 ? "s" : ""}? This action cannot be
              undone.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">
                ⚠️ Warning: This will permanently remove the invoices and their
                payment records.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={bulkActionLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={bulkActionLoading}
            >
              {bulkActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {selectedIds.size} Invoice
                  {selectedIds.size !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function StudentInvoiceTable() {
  return (
    <Suspense fallback={<div>Loading invoices...</div>}>
      <StudentInvoiceContent />
    </Suspense>
  );
}
