"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Loader2,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studentFeePaymentService, enrollmentService } from "@/lib/data";
import { useAuth } from "@/components/auth/AuthProvider";

interface AddPaymentDialogProps {
  studentId: string;
  trigger?: React.ReactNode;
  defaultMonth?: string;
  defaultClassId?: string;
  defaultAmount?: number;
  onPaymentAdded?: () => void;
}

interface Enrollment {
  id: string;
  class_id: string;
  student_id: string;
  status: string;
  class?: {
    id: string;
    name: string;
    base_monthly_fee: number;
  };
}

export function AddPaymentDialog({
  studentId,
  trigger,
  defaultMonth,
  defaultClassId,
  defaultAmount,
  onPaymentAdded,
}: AddPaymentDialogProps) {
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Form fields
  const [selectedClassId, setSelectedClassId] = useState(defaultClassId || "");
  const [amount, setAmount] = useState(defaultAmount?.toString() || "");
  const [paymentMonth, setPaymentMonth] = useState(
    defaultMonth || new Date().toISOString().slice(0, 7),
  );
  const [paymentStatus, setPaymentStatus] = useState<
    "PAID" | "UNPAID" | "PARTIAL" | "WAIVED"
  >("PAID");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");

  // Load student enrollments when dialog opens
  useEffect(() => {
    if (open) {
      loadEnrollments();
    }
  }, [open, studentId]);

  // Set default amount when class changes
  useEffect(() => {
    if (selectedClassId && enrollments.length > 0) {
      const selectedEnrollment = enrollments.find(
        (e) => e.class_id === selectedClassId,
      );
      if (selectedEnrollment?.class && !defaultAmount) {
        setAmount(selectedEnrollment.class.base_monthly_fee.toString());
      }
    }
  }, [selectedClassId, enrollments, defaultAmount]);

  const loadEnrollments = async () => {
    setLoadingEnrollments(true);
    try {
      const response = await enrollmentService.getByStudent(studentId);
      setEnrollments(response);

      // Auto-select class if only one enrollment or if default provided
      if (response.length === 1 && !defaultClassId) {
        setSelectedClassId(response[0].class_id);
      }
    } catch (err) {
      console.error("Failed to load enrollments:", err);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!selectedClassId) {
        throw new Error("Please select a class");
      }
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }
      if (!paymentMonth) {
        throw new Error("Please select a payment month");
      }

      // Get user ID for collected_by
      const collectedBy = userId || undefined;

      await studentFeePaymentService.createFeePayment({
        student_id: studentId,
        class_id: selectedClassId,
        amount: parseFloat(amount),
        payment_month: paymentMonth,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
        collected_by: collectedBy,
      });

      // Reset form and close dialog
      resetForm();
      setOpen(false);
      onPaymentAdded?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedClassId(defaultClassId || "");
    setAmount(defaultAmount?.toString() || "");
    setPaymentMonth(defaultMonth || new Date().toISOString().slice(0, 7));
    setPaymentStatus("PAID");
    setPaymentMethod("CASH");
    setNotes("");
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  const selectedClass = enrollments.find(
    (e) => e.class_id === selectedClassId,
  )?.class;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a fee payment for this student
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Class Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-3 w-3" />
                Class *
              </Label>
              {loadingEnrollments ? (
                <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading classes...
                </div>
              ) : (
                <Select
                  value={selectedClassId}
                  onValueChange={setSelectedClassId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollments.map((enrollment) => (
                      <SelectItem
                        key={enrollment.id}
                        value={enrollment.class_id}
                      >
                        {enrollment.class?.name ||
                          `Class ${enrollment.class_id}`}
                        {enrollment.class?.base_monthly_fee && (
                          <span className="text-muted-foreground ml-2">
                            (LKR{" "}
                            {enrollment.class.base_monthly_fee.toLocaleString()}
                            )
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Payment Month */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Payment Month *
              </Label>
              <Input
                type="month"
                value={paymentMonth}
                onChange={(e) => setPaymentMonth(e.target.value)}
                required
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-3 w-3" />
                Amount (LKR) *
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
              {selectedClass && (
                <p className="text-xs text-muted-foreground">
                  Expected: LKR{" "}
                  {selectedClass.base_monthly_fee.toLocaleString()}
                </p>
              )}
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <Label>Payment Status *</Label>
              <Select
                value={paymentStatus}
                onValueChange={(
                  value: "PAID" | "UNPAID" | "PARTIAL" | "WAIVED",
                ) => setPaymentStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="PARTIAL">Partial Payment</SelectItem>
                  <SelectItem value="UNPAID">Unpaid (Record Only)</SelectItem>
                  <SelectItem value="WAIVED">Waived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-3 w-3" />
                Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="ONLINE">Online Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this payment..."
                rows={3}
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingEnrollments}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Record Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
