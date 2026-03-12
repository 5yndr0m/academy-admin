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
import { Plus, Search, Edit, Trash2, Receipt } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { expenseRecordService } from "@/lib/data";
import type {
  ExpenseRecord,
  CreateExpenseRecordRequest,
  FinancialRecordFilters,
  PaginatedFinancialResponse,
} from "@/types";

const EXPENSE_CATEGORIES = [
  "UTILITIES",
  "MAINTENANCE",
  "SUPPLIES",
  "RENT",
  "INSURANCE",
  "MARKETING",
  "SALARY",
  "OTHER",
] as const;

const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CHEQUE", "CARD"] as const;

export function ExpenseRecordsTable() {
  const [records, setRecords] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(
    null,
  );

  // Filter states
  const [filters, setFilters] = useState<FinancialRecordFilters>({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { toast } = useToast();

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateExpenseRecordRequest>({
    category: "OTHER",
    description: "",
    amount: 0,
    vendor: "",
    expense_date: new Date().toISOString().split("T")[0],
    payment_method: "CASH",
    receipt_ref: "",
    notes: "",
  });

  const loadExpenseRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response: PaginatedFinancialResponse<ExpenseRecord> =
        await expenseRecordService.getAll(filters);

      setRecords(response.data);
      setTotalCount(response.total_count);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load expense records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    loadExpenseRecords();
  }, [loadExpenseRecords]);

  const handleSearch = () => {
    const newFilters: FinancialRecordFilters = {
      ...filters,
      page: 1,
    };

    if (selectedCategory && selectedCategory !== "all")
      newFilters.category = selectedCategory;
    if (selectedPaymentMethod && selectedPaymentMethod !== "all")
      newFilters.payment_method = selectedPaymentMethod;
    if (dateFrom) newFilters.from_date = dateFrom;
    if (dateTo) newFilters.to_date = dateTo;

    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedPaymentMethod("all");
    setDateFrom("");
    setDateTo("");
    setFilters({ page: 1, limit: 20 });
  };

  const resetForm = () => {
    setFormData({
      category: "OTHER",
      description: "",
      amount: 0,
      vendor: "",
      expense_date: new Date().toISOString().split("T")[0],
      payment_method: "CASH",
      receipt_ref: "",
      notes: "",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await expenseRecordService.create(formData);
      toast({
        title: "Success",
        description: "Expense record created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadExpenseRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create expense record",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      await expenseRecordService.update(editingRecord.id, formData);
      toast({
        title: "Success",
        description: "Expense record updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingRecord(null);
      resetForm();
      loadExpenseRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update expense record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?"))
      return;

    try {
      await expenseRecordService.delete(id);
      toast({
        title: "Success",
        description: "Expense record deleted successfully",
      });
      loadExpenseRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete expense record",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (record: ExpenseRecord) => {
    setEditingRecord(record);
    setFormData({
      category: record.category,
      description: record.description,
      amount: record.amount,
      vendor: record.vendor || "",
      expense_date: record.expense_date,
      payment_method: record.payment_method,
      receipt_ref: record.receipt_ref || "",
      notes: record.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case "UTILITIES":
        return "secondary";
      case "MAINTENANCE":
        return "destructive";
      case "SUPPLIES":
        return "default";
      case "SALARY":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "CASH":
        return "default";
      case "BANK_TRANSFER":
        return "secondary";
      case "CHEQUE":
        return "outline";
      case "CARD":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Expense Records</h3>
          <p className="text-muted-foreground">
            Track utility bills, supplies, maintenance and other expenses
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Expense Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        category: value as typeof formData.category,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (LKR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) =>
                      setFormData({ ...formData, vendor: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="expense_date">Expense Date</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) =>
                      setFormData({ ...formData, expense_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        payment_method: value as typeof formData.payment_method,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="receipt_ref">Receipt Reference</Label>
                  <Input
                    id="receipt_ref"
                    value={formData.receipt_ref}
                    onChange={(e) =>
                      setFormData({ ...formData, receipt_ref: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Expense</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={selectedCategory === "all" ? "" : selectedCategory}
                onValueChange={(value) => setSelectedCategory(value || "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select
                value={
                  selectedPaymentMethod === "all" ? "" : selectedPaymentMethod
                }
                onValueChange={(value) =>
                  setSelectedPaymentMethod(value || "all")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Expense Records ({totalCount} total)</span>
            <div className="text-sm font-normal text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading expenses...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Receipt Ref</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No expense records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(
                            new Date(record.expense_date),
                            "MMM dd, yyyy",
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getCategoryBadgeVariant(record.category)}
                          >
                            {record.category.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.description}
                        </TableCell>
                        <TableCell>{record.vendor || "-"}</TableCell>
                        <TableCell className="font-medium">
                          LKR {record.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getPaymentMethodBadge(
                              record.payment_method,
                            )}
                          >
                            {record.payment_method.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.receipt_ref || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(record.id)}
                            >
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * (filters.limit || 20) + 1} to{" "}
                {Math.min(currentPage * (filters.limit || 20), totalCount)} of{" "}
                {totalCount} expenses
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      category: value as typeof formData.category,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-amount">Amount (LKR)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: Number(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-vendor">Vendor</Label>
                <Input
                  id="edit-vendor"
                  value={formData.vendor}
                  onChange={(e) =>
                    setFormData({ ...formData, vendor: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-expense_date">Expense Date</Label>
                <Input
                  id="edit-expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expense_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-payment_method">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      payment_method: value as typeof formData.payment_method,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-receipt_ref">Receipt Reference</Label>
                <Input
                  id="edit-receipt_ref"
                  value={formData.receipt_ref}
                  onChange={(e) =>
                    setFormData({ ...formData, receipt_ref: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingRecord(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Expense</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
