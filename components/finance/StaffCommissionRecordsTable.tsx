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
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calculator,
  Users,
  Percent,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { staffCommissionRecordService, userService } from "@/lib/data";
import type {
  StaffCommissionRecord,
  CreateStaffCommissionRequest,
  FinancialRecordFilters,
  PaginatedFinancialResponse,
  User,
  CommissionCalculationRequest,
} from "@/types";

const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CHEQUE"] as const;

export function StaffCommissionRecordsTable() {
  const [records, setRecords] = useState<StaffCommissionRecord[]>([]);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<StaffCommissionRecord | null>(null);

  // Filter states
  const [filters, setFilters] = useState<FinancialRecordFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { toast } = useToast();

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateStaffCommissionRequest>({
    staff_id: "",
    amount: 0,
    total_revenue_collected: 0,
    total_teacher_payouts: 0,
    net_revenue: 0,
    commission_percentage: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_month: new Date().toISOString().substring(0, 7),
    payment_method: "CASH",
    notes: "",
  });

  // Calculator state
  const [calculatorData, setCalculatorData] = useState({
    total_revenue: 0,
    total_teacher_payouts: 0,
    commission_percentage: 0,
    net_revenue: 0,
    calculated_amount: 0,
  });

  const loadInitialData = useCallback(async () => {
    try {
      const usersData = await userService.getAll();
      // Filter to only show staff members
      const staff = usersData.filter((user) => user.role === "STAFF");
      setStaffMembers(staff);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load staff members",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadCommissionRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response: PaginatedFinancialResponse<StaffCommissionRecord> =
        await staffCommissionRecordService.getAll(filters);

      setRecords(response.data);
      setTotalCount(response.total_count);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load staff commission records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadCommissionRecords();
  }, [loadCommissionRecords]);

  const handleSearch = () => {
    const newFilters: FinancialRecordFilters = {
      ...filters,
      page: 1,
    };

    if (selectedStaff && selectedStaff !== "all")
      newFilters.staff_id = selectedStaff;
    if (selectedPaymentMethod && selectedPaymentMethod !== "all")
      newFilters.payment_method = selectedPaymentMethod;
    if (selectedMonth) newFilters.month = selectedMonth;
    if (dateFrom) newFilters.from_date = dateFrom;
    if (dateTo) newFilters.to_date = dateTo;

    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSelectedStaff("all");
    setSelectedPaymentMethod("all");
    setSelectedMonth("");
    setDateFrom("");
    setDateTo("");
    setFilters({ page: 1, limit: 20 });
  };

  const resetForm = () => {
    setFormData({
      staff_id: "",
      amount: 0,
      total_revenue_collected: 0,
      total_teacher_payouts: 0,
      net_revenue: 0,
      commission_percentage: 0,
      payment_date: new Date().toISOString().split("T")[0],
      payment_month: new Date().toISOString().substring(0, 7),
      payment_method: "CASH",
      notes: "",
    });
  };

  const calculateCommission = async () => {
    try {
      const netRevenue =
        calculatorData.total_revenue - calculatorData.total_teacher_payouts;

      const request: CommissionCalculationRequest = {
        total_revenue: calculatorData.total_revenue,
        total_teacher_payouts: calculatorData.total_teacher_payouts,
        commission_percentage: calculatorData.commission_percentage,
      };

      const response =
        await staffCommissionRecordService.calculateCommission(request);
      setCalculatorData({
        ...calculatorData,
        net_revenue: response.net_revenue || netRevenue,
        calculated_amount: response.amount,
      });

      toast({
        title: "Calculation Complete",
        description: `Calculated commission: LKR ${response.amount.toLocaleString()}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to calculate commission",
        variant: "destructive",
      });
    }
  };

  const useCalculatedAmount = () => {
    setFormData({
      ...formData,
      amount: calculatorData.calculated_amount,
      total_revenue_collected: calculatorData.total_revenue,
      total_teacher_payouts: calculatorData.total_teacher_payouts,
      net_revenue: calculatorData.net_revenue,
      commission_percentage: calculatorData.commission_percentage,
    });
    setIsCalculatorOpen(false);
    toast({
      title: "Amount Applied",
      description: "Calculated commission has been applied to the form",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await staffCommissionRecordService.create(formData);
      toast({
        title: "Success",
        description: "Staff commission recorded successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadCommissionRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to record staff commission",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      await staffCommissionRecordService.update(editingRecord.id, formData);
      toast({
        title: "Success",
        description: "Commission record updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingRecord(null);
      resetForm();
      loadCommissionRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update commission record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this commission record?"))
      return;

    try {
      await staffCommissionRecordService.delete(id);
      toast({
        title: "Success",
        description: "Commission record deleted successfully",
      });
      loadCommissionRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete commission record",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (record: StaffCommissionRecord) => {
    setEditingRecord(record);
    setFormData({
      staff_id: record.staff_id,
      amount: record.amount,
      total_revenue_collected: record.total_revenue_collected,
      total_teacher_payouts: record.total_teacher_payouts,
      net_revenue: record.net_revenue,
      commission_percentage: record.commission_percentage,
      payment_date: record.payment_date,
      payment_month: record.payment_month,
      payment_method: record.payment_method,
      notes: record.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case "CASH":
        return "default";
      case "BANK_TRANSFER":
        return "secondary";
      case "CHEQUE":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const getStaffName = (staffId: string) => {
    const staff = staffMembers.find((s) => s.id === staffId);
    return staff ? `${staff.name} (${staff.username})` : "Unknown Staff";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Staff Commission Records</h3>
          <p className="text-muted-foreground">
            Record staff commissions based on net revenue percentages
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Calculator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Commission Calculator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calc-total-revenue">
                    Total Revenue Collected (LKR)
                  </Label>
                  <Input
                    id="calc-total-revenue"
                    type="number"
                    step="0.01"
                    value={calculatorData.total_revenue}
                    onChange={(e) =>
                      setCalculatorData({
                        ...calculatorData,
                        total_revenue: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="calc-teacher-payouts">
                    Total Teacher Payouts (LKR)
                  </Label>
                  <Input
                    id="calc-teacher-payouts"
                    type="number"
                    step="0.01"
                    value={calculatorData.total_teacher_payouts}
                    onChange={(e) =>
                      setCalculatorData({
                        ...calculatorData,
                        total_teacher_payouts: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="calc-commission-percentage">
                    Commission Percentage (%)
                  </Label>
                  <Input
                    id="calc-commission-percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={calculatorData.commission_percentage}
                    onChange={(e) =>
                      setCalculatorData({
                        ...calculatorData,
                        commission_percentage: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <Label>Net Revenue:</Label>
                    <span className="font-medium">
                      LKR {calculatorData.net_revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <Label>Commission Amount:</Label>
                    <div className="text-lg font-bold text-green-600">
                      LKR {calculatorData.calculated_amount.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={calculateCommission} className="flex-1">
                    Calculate
                  </Button>
                  <Button
                    onClick={useCalculatedAmount}
                    variant="outline"
                    disabled={calculatorData.calculated_amount === 0}
                  >
                    Use Amount
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Record Commission
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Record Staff Commission</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="staff_id">Staff Member</Label>
                  <Select
                    value={formData.staff_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, staff_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name} ({staff.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="total_revenue_collected">
                      Total Revenue (LKR)
                    </Label>
                    <Input
                      id="total_revenue_collected"
                      type="number"
                      step="0.01"
                      value={formData.total_revenue_collected}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_revenue_collected: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="total_teacher_payouts">
                      Teacher Payouts (LKR)
                    </Label>
                    <Input
                      id="total_teacher_payouts"
                      type="number"
                      step="0.01"
                      value={formData.total_teacher_payouts}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          total_teacher_payouts: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="net_revenue">Net Revenue (LKR)</Label>
                    <Input
                      id="net_revenue"
                      type="number"
                      step="0.01"
                      value={formData.net_revenue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          net_revenue: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="commission_percentage">Commission %</Label>
                    <Input
                      id="commission_percentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.commission_percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          commission_percentage: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Commission Amount (LKR)</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_method">Payment Method</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          payment_method:
                            value as typeof formData.payment_method,
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
                    <Label htmlFor="payment_date">Payment Date</Label>
                    <Input
                      id="payment_date"
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payment_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="payment_month">Payment Month</Label>
                  <Input
                    id="payment_month"
                    type="month"
                    value={formData.payment_month}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_month: e.target.value,
                      })
                    }
                    required
                  />
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
                    placeholder="Optional notes about this commission"
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
                  <Button type="submit">Record Commission</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Staff Member</Label>
              <Select
                value={selectedStaff === "all" ? "" : selectedStaff}
                onValueChange={(value) => setSelectedStaff(value || "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
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
              <Label>Payment Month</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
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
            <span>Commission Records ({totalCount} total)</span>
            <div className="text-sm font-normal text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              Loading commission records...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Teacher Payouts</TableHead>
                    <TableHead>Net Revenue</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        No commission records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(
                            new Date(record.payment_date),
                            "MMM dd, yyyy",
                          )}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(record.payment_month + "-01"),
                            "MMM yyyy",
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="max-w-xs truncate">
                              {getStaffName(record.staff_id)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          LKR {record.total_revenue_collected.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-red-600">
                          -LKR {record.total_teacher_payouts.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          LKR {record.net_revenue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Percent className="h-3 w-3 mr-1" />
                            {record.commission_percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
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
                {totalCount} commissions
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Commission Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-staff_id">Staff Member</Label>
              <Select
                value={formData.staff_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, staff_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name} ({staff.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-total_revenue_collected">
                  Total Revenue (LKR)
                </Label>
                <Input
                  id="edit-total_revenue_collected"
                  type="number"
                  step="0.01"
                  value={formData.total_revenue_collected}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_revenue_collected: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-total_teacher_payouts">
                  Teacher Payouts (LKR)
                </Label>
                <Input
                  id="edit-total_teacher_payouts"
                  type="number"
                  step="0.01"
                  value={formData.total_teacher_payouts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_teacher_payouts: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-net_revenue">Net Revenue (LKR)</Label>
                <Input
                  id="edit-net_revenue"
                  type="number"
                  step="0.01"
                  value={formData.net_revenue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      net_revenue: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-commission_percentage">Commission %</Label>
                <Input
                  id="edit-commission_percentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.commission_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_percentage: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-amount">Commission Amount (LKR)</Label>
                <Input
                  id="edit-amount"
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
                <Label htmlFor="edit-payment_date">Payment Date</Label>
                <Input
                  id="edit-payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-payment_month">Payment Month</Label>
              <Input
                id="edit-payment_month"
                type="month"
                value={formData.payment_month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    payment_month: e.target.value,
                  })
                }
                required
              />
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
                placeholder="Optional notes about this commission"
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
              <Button type="submit">Update Commission</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
