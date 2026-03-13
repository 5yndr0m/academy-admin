"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  Plus,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { studentPaymentRecordService, classService } from "@/lib/data";
import type {
  StudentPaymentRecord,
  CreateStudentPaymentRequest,
  Class,
} from "@/types";

const PAYMENT_METHODS = ["CASH", "BANK_TRANSFER", "CHEQUE"] as const;

interface StudentPaymentHistoryProps {
  studentId: string;
  studentName: string;
}

export function StudentPaymentHistory({
  studentId,
  studentName,
}: StudentPaymentHistoryProps) {
  const [payments, setPayments] = useState<StudentPaymentRecord[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] =
    useState<StudentPaymentRecord | null>(null);

  const { toast } = useToast();

  // Form state for create/edit
  const [formData, setFormData] = useState<CreateStudentPaymentRequest>({
    student_id: studentId,
    class_id: "",
    payment_type: "CLASS_PAYMENT",
    amount: 0,
    payment_date: new Date().toISOString().split("T")[0],
    payment_month: new Date().toISOString().substring(0, 7), // YYYY-MM
    payment_method: "CASH",
    notes: "",
  });

  const loadPaymentHistory = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsResponse, classesData] = await Promise.all([
        studentPaymentRecordService.getAll({
          student_id: studentId,
          limit: 100, // Get all payments for this student
        }),
        classService.getAll(),
      ]);

      setPayments(paymentsResponse.data);
      setClasses(classesData);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [studentId, toast]);

  useEffect(() => {
    loadPaymentHistory();
  }, [loadPaymentHistory]);

  const resetForm = () => {
    setFormData({
      student_id: studentId,
      class_id: "",
      payment_type: "CLASS_PAYMENT",
      amount: 0,
      payment_date: new Date().toISOString().split("T")[0],
      payment_month: new Date().toISOString().substring(0, 7),
      payment_method: "CASH",
      notes: "",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentPaymentRecordService.create(formData);
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      loadPaymentHistory();
    } catch {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    try {
      await studentPaymentRecordService.update(editingPayment.id, formData);
      toast({
        title: "Success",
        description: "Payment updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingPayment(null);
      resetForm();
      loadPaymentHistory();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update payment",
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
      loadPaymentHistory();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete payment record",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (payment: StudentPaymentRecord) => {
    setEditingPayment(payment);
    setFormData({
      student_id: payment.student_id,
      class_id: payment.class_id,
      payment_type: payment.payment_type,
      amount: payment.amount,
      payment_date: payment.payment_date,
      payment_month: payment.payment_month,
      payment_method: payment.payment_method,
      notes: payment.notes || "",
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

  const getClassName = (classId: string | undefined) => {
    if (!classId) return "No Class (Admission Fee)";
    const cls = classes.find((c) => c.id === classId);
    return cls ? cls.name : "Unknown Class";
  };

  const getTotalPayments = () => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading payment history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with total and add button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Payment History</h3>
          <p className="text-sm text-muted-foreground">
            Total Paid: LKR {getTotalPayments().toLocaleString()}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={resetForm}>
              <Plus className="h-4 w-4 mr-1" />
              Add Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Payment for {studentName}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="class_id">Class</Label>
                <Select
                  value={formData.class_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, class_id: value })
                  }
                  required
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
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
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

      {/* Payment Records */}
      {payments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              No payment records found
            </p>
            <p className="text-sm text-muted-foreground">
              Click "Add Payment" to record the first payment for {studentName}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments
            .sort(
              (a, b) =>
                new Date(b.payment_date).getTime() -
                new Date(a.payment_date).getTime(),
            )
            .map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(
                              new Date(payment.payment_date),
                              "MMM dd, yyyy",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {getClassName(payment.class_id)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-mono text-lg font-semibold text-green-600">
                            LKR {payment.amount.toLocaleString()}
                          </span>
                        </div>
                        <Badge
                          variant={getPaymentMethodBadge(
                            payment.payment_method,
                          )}
                        >
                          <CreditCard className="h-3 w-3 mr-1" />
                          {payment.payment_method.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Month:{" "}
                          {format(
                            new Date(payment.payment_month + "-01"),
                            "MMM yyyy",
                          )}
                        </span>
                        {payment.recorded_by_user && (
                          <span>
                            Recorded by: {payment.recorded_by_user.username}
                          </span>
                        )}
                      </div>

                      {payment.notes && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {payment.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(payment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(payment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment Record</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-class_id">Class</Label>
              <Select
                value={formData.class_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, class_id: value })
                }
                required
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-amount">Amount (LKR)</Label>
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
            </div>

            <div>
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
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
                  setEditingPayment(null);
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
