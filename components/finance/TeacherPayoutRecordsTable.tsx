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
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  teacherPayoutRecordService,
  teacherService,
  classService,
} from "@/lib/data";
import type {
  TeacherPayoutRecord,
  CreateTeacherPayoutRequest,
  FinancialRecordFilters,
  PaginatedFinancialResponse,
  Teacher,
  Class,
  PayoutCalculationRequest,
} from "@/types";

const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CHEQUE"] as const;

export function TeacherPayoutRecordsTable() {
  const [records, setRecords] = useState<TeacherPayoutRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<TeacherPayoutRecord | null>(null);

  // Filter states
  const [filters, setFilters] = useState<FinancialRecordFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { toast } = useToast();

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateTeacherPayoutRequest>({
    teacher_id: "",
    class_id: "",
    amount: 0,
    total_revenue_collected: 0,
    payout_percentage: 0,
    payout_date: new Date().toISOString().split("T")[0],
    payout_month: new Date().toISOString().substring(0, 7),
    payment_method: "CASH",
    student_count: 0,
    notes: "",
  });

  // Calculator state
  const [calculatorData, setCalculatorData] = useState({
    total_revenue: 0,
    payout_percentage: 0,
    calculated_amount: 0,
  });

  const loadInitialData = useCallback(async () => {
    try {
      const [teachersData, classesData] = await Promise.all([
        teacherService.getAll(),
        classService.getAll(),
      ]);
      setTeachers(teachersData);
      setClasses(classesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teachers and classes",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadPayoutRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response: PaginatedFinancialResponse<TeacherPayoutRecord> =
        await teacherPayoutRecordService.getAll(filters);

      setRecords(response.data);
      setTotalCount(response.total_count);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load teacher payout records",
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
    loadPayoutRecords();
  }, [loadPayoutRecords]);

  const handleSearch = () => {
    const newFilters: FinancialRecordFilters = {
      ...filters,
      page: 1,
    };

    if (selectedTeacher && selectedTeacher !== "all")
      newFilters.teacher_id = selectedTeacher;
    if (selectedClass && selectedClass !== "all")
      newFilters.class_id = selectedClass;
    if (selectedPaymentMethod && selectedPaymentMethod !== "all")
      newFilters.payment_method = selectedPaymentMethod;
    if (selectedMonth) newFilters.month = selectedMonth;
    if (dateFrom) newFilters.from_date = dateFrom;
    if (dateTo) newFilters.to_date = dateTo;

    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSelectedTeacher("all");
    setSelectedClass("all");
    setSelectedPaymentMethod("all");
    setSelectedMonth("");
    setDateFrom("");
    setDateTo("");
    setFilters({ page: 1, limit: 20 });
  };

  const resetForm = () => {
    setFormData({
      teacher_id: "",
      class_id: "",
      amount: 0,
      total_revenue_collected: 0,
      payout_percentage: 0,
      payout_date: new Date().toISOString().split("T")[0],
      payout_month: new Date().toISOString().substring(0, 7),
      payment_method: "CASH",
      student_count: 0,
      notes: "",
    });
  };

  const calculatePayout = async () => {
    try {
      const request: PayoutCalculationRequest = {
        total_revenue: calculatorData.total_revenue,
        payout_percentage: calculatorData.payout_percentage,
      };

      const response =
        await teacherPayoutRecordService.calculatePayout(request);
      setCalculatorData({
        ...calculatorData,
        calculated_amount: response.amount,
      });

      toast({
        title: "Calculation Complete",
        description: `Calculated payout: LKR ${response.amount.toLocaleString()}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to calculate payout",
        variant: "destructive",
      });
    }
  };

  const useCalculatedAmount = () => {
    setFormData({
      ...formData,
      amount: calculatorData.calculated_amount,
      total_revenue_collected: calculatorData.total_revenue,
      payout_percentage: calculatorData.payout_percentage,
    });
    setIsCalculatorOpen(false);
    toast({
      title: "Amount Applied",
      description: "Calculated amount has been applied to the form",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teacherPayoutRecordService.create(formData);
      toast({
        title: "Success",
        description: "Teacher payout recorded successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadPayoutRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to record teacher payout",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      await teacherPayoutRecordService.update(editingRecord.id, formData);
      toast({
        title: "Success",
        description: "Payout record updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingRecord(null);
      resetForm();
      loadPayoutRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update payout record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payout record?")) return;

    try {
      await teacherPayoutRecordService.delete(id);
      toast({
        title: "Success",
        description: "Payout record deleted successfully",
      });
      loadPayoutRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete payout record",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (record: TeacherPayoutRecord) => {
    setEditingRecord(record);
    setFormData({
      teacher_id: record.teacher_id,
      class_id: record.class_id,
      amount: record.amount,
      total_revenue_collected: record.total_revenue_collected,
      payout_percentage: record.payout_percentage,
      payout_date: record.payout_date,
      payout_month: record.payout_month,
      payment_method: record.payment_method,
      student_count: record.student_count,
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

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.full_name : "Unknown Teacher";
  };

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    return cls ? cls.name : "Unknown Class";
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Teacher Payout Records</h3>
          <p className="text-muted-foreground">
            Record teacher payouts based on revenue percentage splits
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
                <DialogTitle>Payout Calculator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="calc-revenue">
                    Total Revenue Collected (LKR)
                  </Label>
                  <Input
                    id="calc-revenue"
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
                  <Label htmlFor="calc-percentage">Payout Percentage (%)</Label>
                  <Input
                    id="calc-percentage"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={calculatorData.payout_percentage}
                    onChange={(e) =>
                      setCalculatorData({
                        ...calculatorData,
                        payout_percentage: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <Label>Calculated Payout Amount</Label>
                  <div className="text-2xl font-bold">
                    LKR {calculatorData.calculated_amount.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={calculatePayout} className="flex-1">
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
                Record Payout
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Record Teacher Payout</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacher_id">Teacher</Label>
                    <Select
                      value={formData.teacher_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, teacher_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="class_id">Class</Label>
                    <Select
                      value={formData.class_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, class_id: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
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
                    <Label htmlFor="payout_percentage">Payout % </Label>
                    <Input
                      id="payout_percentage"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.payout_percentage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payout_percentage: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Payout Amount (LKR)</Label>
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
                    <Label htmlFor="student_count">Student Count</Label>
                    <Input
                      id="student_count"
                      type="number"
                      min="0"
                      value={formData.student_count}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          student_count: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payout_date">Payout Date</Label>
                    <Input
                      id="payout_date"
                      type="date"
                      value={formData.payout_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payout_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="payout_month">Payout Month</Label>
                    <Input
                      id="payout_month"
                      type="month"
                      value={formData.payout_month}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payout_month: e.target.value,
                        })
                      }
                      required
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
                    placeholder="Optional notes about this payout"
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
                  <Button type="submit">Record Payout</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label>Teacher</Label>
              <Select
                value={selectedTeacher === "all" ? "" : selectedTeacher}
                onValueChange={(value) => setSelectedTeacher(value || "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All teachers" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class</Label>
              <Select
                value={selectedClass === "all" ? "" : selectedClass}
                onValueChange={(value) => setSelectedClass(value || "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
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
              <Label>Payout Month</Label>
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
            <span>Payout Records ({totalCount} total)</span>
            <div className="text-sm font-normal text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading payout records...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        No payout records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.payout_date), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(record.payout_month + "-01"),
                            "MMM yyyy",
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="max-w-xs truncate">
                              {getTeacherName(record.teacher_id)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span>{getClassName(record.class_id)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          LKR {record.total_revenue_collected.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {record.payout_percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          LKR {record.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{record.student_count}</TableCell>
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
                {totalCount} payouts
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
            <DialogTitle>Edit Payout Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-teacher_id">Teacher</Label>
                <Select
                  value={formData.teacher_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teacher_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-class_id">Class</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, class_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                <Label htmlFor="edit-payout_percentage">Payout %</Label>
                <Input
                  id="edit-payout_percentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.payout_percentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payout_percentage: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-amount">Payout Amount (LKR)</Label>
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
                <Label htmlFor="edit-student_count">Student Count</Label>
                <Input
                  id="edit-student_count"
                  type="number"
                  min="0"
                  value={formData.student_count}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      student_count: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-payout_date">Payout Date</Label>
                <Input
                  id="edit-payout_date"
                  type="date"
                  value={formData.payout_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payout_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-payout_month">Payout Month</Label>
                <Input
                  id="edit-payout_month"
                  type="month"
                  value={formData.payout_month}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payout_month: e.target.value,
                    })
                  }
                  required
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
                placeholder="Optional notes about this payout"
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
              <Button type="submit">Update Payout</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
