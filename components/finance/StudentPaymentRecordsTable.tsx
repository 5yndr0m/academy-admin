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
import { Plus, Search, Edit, Trash2, User, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  studentPaymentRecordService,
  studentService,
  classService,
} from "@/lib/data";
import type {
  StudentPaymentRecord,
  CreateStudentPaymentRequest,
  FinancialRecordFilters,
  PaginatedFinancialResponse,
  Student,
  Class,
} from "@/types";

const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CHEQUE"] as const;

export function StudentPaymentRecordsTable() {
  const [records, setRecords] = useState<StudentPaymentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<StudentPaymentRecord | null>(null);

  // Filter states
  const [filters, setFilters] = useState<FinancialRecordFilters>({
    page: 1,
    limit: 20,
  });
  const [selectedStudent, setSelectedStudent] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { toast } = useToast();

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateStudentPaymentRequest>({
    student_id: "",
    class_id: "",
    payment_type: "CLASS_PAYMENT",
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_month: new Date().toISOString().substring(0, 7), // YYYY-MM
    payment_method: "CASH",
    notes: "",
  });

  const loadInitialData = useCallback(async () => {
    try {
      const [studentsData, classesData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load students and classes",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadPaymentRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response: PaginatedFinancialResponse<StudentPaymentRecord> =
        await studentPaymentRecordService.getAll(filters);

      setRecords(response.data);
      setTotalCount(response.total_count);
      setTotalPages(response.total_pages);
      setCurrentPage(response.page);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load student payment records",
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
    loadPaymentRecords();
  }, [loadPaymentRecords]);

  const handleSearch = () => {
    const newFilters: FinancialRecordFilters = {
      ...filters,
      page: 1,
    };

    if (selectedStudent && selectedStudent !== "all")
      newFilters.student_id = selectedStudent;
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
    setSelectedStudent("all");
    setSelectedClass("all");
    setSelectedPaymentMethod("all");
    setSelectedMonth("");
    setDateFrom("");
    setDateTo("");
    setFilters({ page: 1, limit: 20 });
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      class_id: "",
      payment_type: "CLASS_PAYMENT",
      amount: 0,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: "CASH",
      notes: "",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Process form data based on payment type
      const submitData: any = {
        student_id: formData.student_id,
        payment_type: formData.payment_type,
        amount: formData.amount,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        notes: formData.notes,
      };

      // Only include class_id and payment_month for class payments
      if (formData.payment_type === "CLASS_PAYMENT") {
        submitData.class_id = formData.class_id;
        submitData.payment_month = formData.payment_month;
      }

      await studentPaymentRecordService.create(submitData);
      toast({
        title: "Success",
        description: "Student payment recorded successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadPaymentRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to record student payment",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      await studentPaymentRecordService.update(editingRecord.id, formData);
      toast({
        title: "Success",
        description: "Payment record updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingRecord(null);
      resetForm();
      loadPaymentRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update payment record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment record?"))
      return;

    try {
      await studentPaymentRecordService.delete(id);
      toast({
        title: "Success",
        description: "Payment record deleted successfully",
      });
      loadPaymentRecords();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete payment record",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (record: StudentPaymentRecord) => {
    setEditingRecord(record);
    setFormData({
      student_id: record.student_id,
      class_id: record.class_id,
      amount: record.amount,
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

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student
      ? `${student.fullname} (${student.admission_no})`
      : "Unknown Student";
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
          <h3 className="text-2xl font-bold">Student Payment Records</h3>
          <p className="text-muted-foreground">
            Record and track student fee payments and other cash transactions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Student Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select
                  value={formData.payment_type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      payment_type: value as "CLASS_PAYMENT" | "ADMISSION_FEE",
                      class_id:
                        value === "ADMISSION_FEE" ? "" : formData.class_id,
                      payment_month:
                        value === "ADMISSION_FEE"
                          ? undefined
                          : new Date().toISOString().substring(0, 7),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLASS_PAYMENT">Class Payment</SelectItem>
                    <SelectItem value="ADMISSION_FEE">Admission Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="student_id">Student</Label>
                  <Select
                    value={formData.student_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, student_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.fullname} ({student.admission_no})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.payment_type === "CLASS_PAYMENT" && (
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
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_date: e.target.value })
                    }
                    required
                  />
                </div>
                {formData.payment_type === "CLASS_PAYMENT" && (
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
                )}
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
                  placeholder="Optional notes about this payment"
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
                <Button type="submit">Record Payment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label>Student</Label>
              <Select
                value={selectedStudent === "all" ? "" : selectedStudent}
                onValueChange={(value) => setSelectedStudent(value || "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All students" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.fullname}
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
            <span>Payment Records ({totalCount} total)</span>
            <div className="text-sm font-normal text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading payment records...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No payment records found
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
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="max-w-xs truncate">
                              {getStudentName(record.student_id)}
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
                        <TableCell>
                          {record.recorded_by_user?.username || "Unknown"}
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
                {totalCount} payments
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
            <DialogTitle>Edit Payment Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-student_id">Student</Label>
                <Select
                  value={formData.student_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, student_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.fullname} ({student.admission_no})
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-payment_date">Payment Date</Label>
                <Input
                  id="edit-payment_date"
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_date: e.target.value })
                  }
                  required
                />
              </div>
              {formData.payment_type === "CLASS_PAYMENT" && (
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
              )}
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
                placeholder="Optional notes about this payment"
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
              <Button type="submit">Update Payment</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
