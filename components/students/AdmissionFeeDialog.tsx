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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { studentService, invoiceService } from "@/lib/data";
import { useAuth } from "@/components/auth/AuthProvider";
import { Student } from "@/types";
import {
  CreditCard,
  Loader2,
  Receipt,
  User,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface AdmissionFeeDialogProps {
  student: Student;
  onUpdate?: () => void;
  trigger?: React.ReactNode;
}

export function AdmissionFeeDialog({
  student,
  onUpdate,
  trigger,
}: AdmissionFeeDialogProps) {
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState("1500"); // Default admission fee
  const [createInvoice, setCreateInvoice] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "UNPAID">("PAID");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setAmount("1500");
    setCreateInvoice(true);
    setPaymentStatus("PAID");
    setPaymentMethod("CASH");
    setNotes("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError("User authentication error. Please log in again.");
      return;
    }

    const admissionAmount = parseFloat(amount);
    if (isNaN(admissionAmount) || admissionAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (createInvoice) {
        // Create admission fee invoice
        await invoiceService.createAdmissionInvoice({
          student_id: student.id,
          amount: admissionAmount,
          payment_status: paymentStatus,
          payment_method: paymentStatus === "PAID" ? paymentMethod : undefined,
          notes: notes,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 30 days from now
        });
      }

      // Update student admission fee status
      await studentService.updateAdmissionFee(student.id, {
        admission_fee_paid: paymentStatus === "PAID",
        admission_fee_amount: admissionAmount,
        payment_method: paymentStatus === "PAID" ? paymentMethod : undefined,
        notes: notes,
      });

      setOpen(false);
      reset();
      onUpdate?.();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to process admission fee",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (student.admission_fee_paid) {
      return (
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      );
    }
    return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
  };

  const getStatusText = () => {
    return student.admission_fee_paid ? "Fee Paid" : "Payment Pending";
  };

  const getStatusColor = () => {
    return student.admission_fee_paid
      ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700"
      : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Admission Fee
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            Admission Fee Management
          </DialogTitle>
          <DialogDescription>
            Manage admission fee payment status and create invoices for{" "}
            <strong>{student.fullname}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Current Status */}
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{student.fullname}</p>
                    <p className="text-sm text-muted-foreground">
                      Admission No: {student.admission_no}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <Badge className={getStatusColor()}>{getStatusText()}</Badge>
                </div>
              </div>
            </div>

            {/* Fee Amount */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Admission Fee Amount *
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1500.00"
                required
              />
              <p className="text-xs text-muted-foreground">
                Standard admission fee amount
              </p>
            </div>

            {/* Create Invoice Option */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  <span className="text-sm font-medium">Create Invoice</span>
                </div>
                <Switch
                  checked={createInvoice}
                  onCheckedChange={setCreateInvoice}
                />
              </div>
              <p className="text-xs text-muted-foreground px-3">
                {createInvoice
                  ? "An admission fee invoice will be created for record keeping"
                  : "Only update the student's payment status"}
              </p>
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <Label>Payment Status *</Label>
              <Select
                value={paymentStatus}
                onValueChange={(value: "PAID" | "UNPAID") =>
                  setPaymentStatus(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Paid
                    </div>
                  </SelectItem>
                  <SelectItem value="UNPAID">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      Unpaid
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method (only if paid) */}
            {paymentStatus === "PAID" && (
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="CARD">Card Payment</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the payment..."
              />
            </div>

            {/* Warning for already paid */}
            {student.admission_fee_paid && paymentStatus === "PAID" && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/30 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  This student's admission fee is already marked as paid. This
                  will update the records.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Update Admission Fee
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
