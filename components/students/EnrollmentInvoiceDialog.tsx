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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Student, Enrollment, EnrollmentInvoiceRequest } from "@/types";
import { invoiceService, studentService } from "@/lib/data";
import {
  Loader2,
  Receipt,
  Users,
  AlertCircle,
  Calendar,
  DollarSign,
} from "lucide-react";

interface EnrollmentInvoiceDialogProps {
  student: Student;
  trigger?: React.ReactNode;
  onInvoiceCreated?: () => void;
}

export function EnrollmentInvoiceDialog({
  student,
  trigger,
  onInvoiceCreated,
}: EnrollmentInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<string>>(
    new Set(),
  );
  const [billingMonth, setBillingMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [notes, setNotes] = useState("");

  // Load student enrollments when dialog opens
  useEffect(() => {
    if (!open) return;

    setLoading(true);
    studentService
      .getById(student.id)
      .then((data) => {
        const activeEnrollments =
          data.enrollments?.filter((e) => e.status === "ENROLLED") || [];
        setEnrollments(activeEnrollments);

        // Auto-select all active enrollments
        setSelectedEnrollments(new Set(activeEnrollments.map((e) => e.id)));
      })
      .catch(() => {
        setError("Failed to load student enrollments");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, student.id]);

  const handleSubmit = async () => {
    if (selectedEnrollments.size === 0) {
      setError("Please select at least one enrollment");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const invoiceData: EnrollmentInvoiceRequest = {
        billing_month: billingMonth,
        enrollment_ids: Array.from(selectedEnrollments),
        notes: notes || undefined,
      };

      await invoiceService.createFromEnrollments(invoiceData);

      setOpen(false);
      reset();
      onInvoiceCreated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedEnrollments(new Set());
    setBillingMonth(new Date().toISOString().slice(0, 7));
    setNotes("");
    setError(null);
  };

  const handleEnrollmentToggle = (enrollmentId: string, checked: boolean) => {
    const newSelected = new Set(selectedEnrollments);
    if (checked) {
      newSelected.add(enrollmentId);
    } else {
      newSelected.delete(enrollmentId);
    }
    setSelectedEnrollments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEnrollments.size === enrollments.length) {
      setSelectedEnrollments(new Set());
    } else {
      setSelectedEnrollments(new Set(enrollments.map((e) => e.id)));
    }
  };

  const totalAmount = enrollments
    .filter((e) => selectedEnrollments.has(e.id))
    .reduce((sum, e) => sum + (e.class?.base_monthly_fee || 0), 0);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="w-full justify-start">
      <Users className="h-4 w-4 mr-2" />
      Generate from Enrollments
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
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Generate Enrollment Invoice
          </DialogTitle>
          <DialogDescription>
            Create an invoice from student's active enrollments for the
            specified billing month.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Billing Month */}
          <div className="grid gap-2">
            <Label htmlFor="billing-month">Billing Month</Label>
            <Input
              id="billing-month"
              type="month"
              value={billingMonth}
              onChange={(e) => setBillingMonth(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Enrollments Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Enrollments</Label>
              {enrollments.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-6 text-xs"
                >
                  {selectedEnrollments.size === enrollments.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : enrollments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No active enrollments found</p>
                    <p className="text-xs">
                      Student must be enrolled in classes to generate invoices
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                {enrollments.map((enrollment) => (
                  <Card
                    key={enrollment.id}
                    className={`transition-colors ${
                      selectedEnrollments.has(enrollment.id)
                        ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                        : ""
                    }`}
                  >
                    <CardContent className="pt-3 pb-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={selectedEnrollments.has(enrollment.id)}
                          onCheckedChange={(checked) =>
                            handleEnrollmentToggle(
                              enrollment.id,
                              checked as boolean,
                            )
                          }
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">
                              {enrollment.class?.subject?.name} -{" "}
                              {enrollment.class?.name}
                            </p>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <DollarSign className="h-3 w-3" />
                              Rs. {enrollment.class?.base_monthly_fee || 0}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Teacher: {enrollment.class?.teacher?.full_name} |
                            Status: {enrollment.status}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Total Amount Display */}
          {selectedEnrollments.size > 0 && (
            <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Total Amount
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-700 dark:text-green-300">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {selectedEnrollments.size} enrollment
                  {selectedEnrollments.size !== 1 ? "s" : ""} selected for{" "}
                  {billingMonth}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes for this invoice..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows={2}
            />
          </div>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || selectedEnrollments.size === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Receipt className="mr-2 h-4 w-4" />
                Create Invoice (Rs. {totalAmount.toLocaleString()})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
