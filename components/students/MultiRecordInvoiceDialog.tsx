"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Student,
  Enrollment,
  InvoiceItemRequest,
  MultiRecordInvoiceRequest,
} from "@/types";
import { invoiceService, studentService } from "@/lib/data";
import {
  Plus,
  Trash2,
  Loader2,
  Receipt,
  Calculator,
  AlertCircle,
} from "lucide-react";

interface MultiRecordInvoiceDialogProps {
  student: Student;
  trigger?: React.ReactNode;
  onInvoiceCreated?: () => void;
}

const ITEM_TYPES = [
  { value: "MONTHLY_FEE", label: "Monthly Class Fee" },
  { value: "ADMISSION_FEE", label: "Admission Fee" },
  { value: "LATE_FEE", label: "Late Fee" },
  { value: "MATERIAL", label: "Material Fee" },
  { value: "EXAM", label: "Exam Fee" },
  { value: "OTHER", label: "Other" },
];

export function MultiRecordInvoiceDialog({
  student,
  trigger,
  onInvoiceCreated,
}: MultiRecordInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [billingMonth, setBillingMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItemRequest[]>([]);

  // Load student enrollments when dialog opens
  useEffect(() => {
    if (!open) return;

    studentService
      .getById(student.id)
      .then((data) => {
        setEnrollments(data.enrollments || []);
      })
      .catch(() => {
        setError("Failed to load student enrollments");
      });
  }, [open, student.id]);

  const addItem = (type: "enrollment" | "custom", enrollmentId?: string) => {
    if (type === "enrollment" && enrollmentId) {
      const enrollment = enrollments.find((e) => e.id === enrollmentId);
      if (!enrollment) return;

      const newItem: InvoiceItemRequest = {
        description: `Monthly fee - ${enrollment.class?.name || "Unknown Class"}`,
        amount: enrollment.class?.base_monthly_fee || 0,
        quantity: 1,
        item_type: "MONTHLY_FEE",
        enrollment_id: enrollmentId,
        class_id: enrollment.class?.id,
      };

      setItems((prev) => [...prev, newItem]);
    } else {
      const newItem: InvoiceItemRequest = {
        description: "",
        amount: 0,
        quantity: 1,
        item_type: "OTHER",
      };

      setItems((prev) => [...prev, newItem]);
    }
  };

  const updateItem = (index: number, updates: Partial<InvoiceItemRequest>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  };

  const getAvailableEnrollments = () => {
    const usedEnrollmentIds = items
      .map((item) => item.enrollment_id)
      .filter(Boolean);
    return enrollments.filter((e) => !usedEnrollmentIds.includes(e.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      setError("Please add at least one item to the invoice");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invoiceData: MultiRecordInvoiceRequest = {
        student_id: student.id,
        billing_month: billingMonth,
        due_date: dueDate || undefined,
        notes: notes || undefined,
        items: items,
      };

      await invoiceService.createMultiRecord(invoiceData);

      setOpen(false);
      reset();
      onInvoiceCreated?.();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to create invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setItems([]);
    setBillingMonth(new Date().toISOString().slice(0, 7));
    setDueDate("");
    setNotes("");
    setError(null);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="w-full justify-start">
      <Receipt className="h-4 w-4 mr-2" />
      Create Combined Invoice
    </Button>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Create Multi-Record Invoice
            </DialogTitle>
            <DialogDescription>
              Create a single invoice combining multiple charges for{" "}
              <strong>{student.fullname}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billing-month">Billing Month *</Label>
                <Input
                  id="billing-month"
                  type="month"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date (optional)</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Add Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Invoice Items</h4>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(enrollmentId) =>
                      addItem("enrollment", enrollmentId)
                    }
                    disabled={getAvailableEnrollments().length === 0}
                  >
                    <SelectTrigger className="w-[200px] h-9">
                      <SelectValue placeholder="Add Class Fee" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableEnrollments().map((enrollment) => (
                        <SelectItem key={enrollment.id} value={enrollment.id}>
                          {enrollment.class?.name || "Unknown Class"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addItem("custom")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Custom Item
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              {items.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                updateItem(index, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="Item description"
                              className="min-w-[200px]"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.item_type}
                              onValueChange={(value) =>
                                updateItem(index, { item_type: value })
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ITEM_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(index, {
                                  quantity: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-16"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.amount}
                              onChange={(e) =>
                                updateItem(index, {
                                  amount: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-24"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              Rs. {(item.amount * item.quantity).toLocaleString()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="border-t p-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Amount:</span>
                      <Badge className="text-lg font-bold">
                        Rs. {getTotalAmount().toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {items.length === 0 && (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium text-foreground mb-2">
                    No items added yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add class fees or custom items to create your invoice
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addItem("custom")}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add First Item
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes for this invoice..."
                rows={3}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
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
              disabled={loading || items.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-4 w-4" />
                  Create Invoice (Rs. {getTotalAmount().toLocaleString()})
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
