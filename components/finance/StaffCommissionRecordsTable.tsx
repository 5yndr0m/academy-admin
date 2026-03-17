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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { staffCommissionRecordService, userService, financeOverviewService } from "@/lib/data";
import type {
  StaffCommissionRecord,
  CreateStaffCommissionRequest,
  FinancialRecordFilters,
  PaginatedFinancialResponse,
  User,
  MonthlyOverviewResponse,
} from "@/types";

const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CHEQUE"] as const;

const emptyForm = (): CreateStaffCommissionRequest => ({
  staff_id: "",
  amount: 0,
  commission_percentage: 0,
  payment_date: new Date().toISOString().split("T")[0],
  payment_month: new Date().toISOString().substring(0, 7),
  payment_method: "CASH",
  notes: "",
});

export function StaffCommissionRecordsTable() {
  const [records, setRecords] = useState<StaffCommissionRecord[]>([]);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StaffCommissionRecord | null>(null);
  const [formData, setFormData] = useState<CreateStaffCommissionRequest>(emptyForm());

  const [filters, setFilters] = useState<FinancialRecordFilters>({ page: 1, limit: 20 });
  const [overviewSuggestion, setOverviewSuggestion] = useState<MonthlyOverviewResponse | null>(null);
  const [selectedStaff, setSelectedStaff] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { toast } = useToast();

  const loadStaff = useCallback(async () => {
    try {
      const data = await userService.getAll();
      setStaffMembers(data);
    } catch {
      toast({ title: "Error", description: "Failed to load staff members", variant: "destructive" });
    }
  }, [toast]);

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response: PaginatedFinancialResponse<StaffCommissionRecord> =
        await staffCommissionRecordService.getAll(filters);
      setRecords(response.data);
      setTotalCount(response.total_count);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
    } catch {
      toast({ title: "Error", description: "Failed to load commission records", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => { loadStaff(); }, [loadStaff]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  // Auto-fetch monthly net revenue when payment_month changes in create form
  useEffect(() => {
    if (!isCreateOpen || !formData.payment_month) {
      setOverviewSuggestion(null);
      return;
    }
    let cancelled = false;
    financeOverviewService
      .getMonthlyOverview(formData.payment_month)
      .then((r) => { if (!cancelled) setOverviewSuggestion(r); })
      .catch(() => { if (!cancelled) setOverviewSuggestion(null); });
    return () => { cancelled = true; };
  }, [formData.payment_month, isCreateOpen]);

  const handleSearch = () => {
    const f: FinancialRecordFilters = { page: 1, limit: 20 };
    if (selectedStaff !== "all") f.staff_id = selectedStaff;
    if (selectedPaymentMethod !== "all") f.payment_method = selectedPaymentMethod;
    if (selectedMonth) f.month = selectedMonth;
    if (dateFrom) f.from_date = dateFrom;
    if (dateTo) f.to_date = dateTo;
    setFilters(f);
  };

  const clearFilters = () => {
    setSelectedStaff("all");
    setSelectedPaymentMethod("all");
    setSelectedMonth("");
    setDateFrom("");
    setDateTo("");
    setFilters({ page: 1, limit: 20 });
  };

  // Auto-fill commission % when a staff member is selected
  const handleStaffSelect = (staffId: string) => {
    const staff = staffMembers.find((s) => s.id === staffId);
    setFormData({
      ...formData,
      staff_id: staffId,
      commission_percentage: staff?.commission_percentage ?? formData.commission_percentage,
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await staffCommissionRecordService.create(formData);
      toast({ title: "Success", description: "Commission recorded successfully" });
      setIsCreateOpen(false);
      setFormData(emptyForm());
      loadRecords();
    } catch {
      toast({ title: "Error", description: "Failed to record commission", variant: "destructive" });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    try {
      await staffCommissionRecordService.update(editingRecord.id, formData);
      toast({ title: "Success", description: "Commission updated successfully" });
      setIsEditOpen(false);
      setEditingRecord(null);
      setFormData(emptyForm());
      loadRecords();
    } catch {
      toast({ title: "Error", description: "Failed to update commission", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this commission record? This cannot be undone.")) return;
    try {
      await staffCommissionRecordService.delete(id);
      toast({ title: "Success", description: "Commission record deleted" });
      loadRecords();
    } catch {
      toast({ title: "Error", description: "Failed to delete commission", variant: "destructive" });
    }
  };

  const openEdit = (record: StaffCommissionRecord) => {
    setEditingRecord(record);
    setFormData({
      staff_id: record.staff_id,
      amount: record.amount,
      commission_percentage: record.commission_percentage,
      payment_date: record.payment_date,
      payment_month: record.payment_month,
      payment_method: record.payment_method,
      notes: record.notes || "",
    });
    setIsEditOpen(true);
  };

  const CommissionForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>Staff Member</Label>
        <Select
          value={formData.staff_id}
          onValueChange={handleStaffSelect}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {staffMembers.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} ({s.username})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Amount Paid (LKR)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount || ""}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            placeholder="e.g. 15000"
            required
          />
        </div>
        <div>
          <Label htmlFor="commission_pct">Commission %</Label>
          <Input
            id="commission_pct"
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={formData.commission_percentage || ""}
            onChange={(e) => setFormData({ ...formData, commission_percentage: Number(e.target.value) })}
            placeholder="e.g. 10"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_month">For Month</Label>
          <Input
            id="payment_month"
            type="month"
            value={formData.payment_month}
            onChange={(e) => setFormData({ ...formData, payment_month: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="payment_date">Date Paid</Label>
          <Input
            id="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Net revenue suggestion banner (only shown in create form) */}
      {overviewSuggestion && (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg text-sm dark:bg-green-950/30 dark:border-green-800">
          <span className="text-green-800 dark:text-green-300">
            Net revenue for {formData.payment_month}:{" "}
            <strong>LKR {overviewSuggestion.net_revenue.toLocaleString()}</strong>
            {formData.commission_percentage > 0 && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                → {formData.commission_percentage}% ={" "}
                LKR{" "}
                {((overviewSuggestion.net_revenue * formData.commission_percentage) / 100).toLocaleString()}
              </span>
            )}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-3 shrink-0"
            onClick={() => {
              const commPct = formData.commission_percentage || 0;
              setFormData({
                ...formData,
                amount: commPct > 0
                  ? parseFloat(((overviewSuggestion.net_revenue * commPct) / 100).toFixed(2))
                  : formData.amount,
              });
              setOverviewSuggestion(null);
            }}
          >
            Use calculated
          </Button>
        </div>
      )}

      <div>
        <Label>Payment Method</Label>
        <Select
          value={formData.payment_method}
          onValueChange={(v) => setFormData({ ...formData, payment_method: v as typeof formData.payment_method })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          placeholder="e.g. March 2026 commission"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Staff Commission Records</h3>
          <p className="text-muted-foreground">Record commission payments made to staff members</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(v) => { setIsCreateOpen(v); if (!v) setFormData(emptyForm()); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Commission
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Staff Commission</DialogTitle>
            </DialogHeader>
            <CommissionForm onSubmit={handleCreate} submitLabel="Record Commission" />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Staff Member</Label>
              <Select
                value={selectedStaff === "all" ? "" : selectedStaff}
                onValueChange={(v) => setSelectedStaff(v || "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select
                value={selectedPaymentMethod === "all" ? "" : selectedPaymentMethod}
                onValueChange={(v) => setSelectedPaymentMethod(v || "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Month</Label>
              <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            </div>
            <div>
              <Label>From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button onClick={clearFilters} variant="outline">Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Commission Records ({totalCount} total)</span>
            <span className="text-sm font-normal text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Date Paid</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Commission %</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No commission records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">
                          {format(new Date(r.payment_month + "-01"), "MMM yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(r.payment_date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>{r.staff_name || r.staff_id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.commission_percentage}%</Badge>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          LKR {r.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{r.payment_method.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                          {r.notes || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * (filters.limit || 20) + 1}–
                {Math.min(currentPage * (filters.limit || 20), totalCount)} of {totalCount}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={currentPage <= 1}
                  onClick={() => setFilters({ ...filters, page: currentPage - 1 })}>
                  Previous
                </Button>
                <Button size="sm" variant="outline" disabled={currentPage >= totalPages}
                  onClick={() => setFilters({ ...filters, page: currentPage + 1 })}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(v) => { setIsEditOpen(v); if (!v) { setEditingRecord(null); setFormData(emptyForm()); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Commission Record</DialogTitle>
          </DialogHeader>
          <CommissionForm onSubmit={handleEdit} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
