"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { DraftStudent, draftStudentService } from "@/lib/data";
import {
  CheckCircle,
  Loader2,
  User,
  CreditCard,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface DraftStudentApprovalDialogProps {
  student: DraftStudent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function DraftStudentApprovalDialog({
  student,
  open,
  onOpenChange,
  onComplete,
}: DraftStudentApprovalDialogProps) {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [admissionNo, setAdmissionNo] = useState("");
  const [admissionFeePaid, setAdmissionFeePaid] = useState(false);
  const [admissionFeeAmount, setAdmissionFeeAmount] = useState<string>("");
  const [admissionFeePaymentMethod, setAdmissionFeePaymentMethod] =
    useState("");
  const [admissionFeeNotes, setAdmissionFeeNotes] = useState("");
  const [registrationDate, setRegistrationDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [reviewNotes, setReviewNotes] = useState("");

  const handleApprove = async () => {
    if (!admissionNo.trim()) {
      toast({
        title: "Error",
        description: "Admission number is required",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "User authentication error",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await draftStudentService.approve(student.id, {
        admission_no: admissionNo,
        admission_fee_paid: admissionFeePaid,
        admission_fee_amount: admissionFeeAmount
          ? parseFloat(admissionFeeAmount)
          : undefined,
        admission_fee_payment_method: admissionFeePaymentMethod || undefined,
        admission_fee_notes: admissionFeeNotes || undefined,
        registration_date: registrationDate,
        authorized_by: userId,
        review_notes: reviewNotes || undefined,
      });

      toast({
        title: "Success",
        description: `Student approved successfully. Admission No: ${data.admission_no}`,
      });

      onComplete();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Approve Student Registration
          </DialogTitle>
          <DialogDescription>
            Approve {student.full_name}'s registration and create their student
            account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Student Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Student Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {student.full_name}
              </div>
              <div>
                <span className="font-medium">Guardian:</span>{" "}
                {student.guardian_name}
              </div>
              <div>
                <span className="font-medium">Contact:</span>{" "}
                {student.home_contact}
              </div>
              <div>
                <span className="font-medium">Email:</span>{" "}
                {student.guardian_email}
              </div>
              {student.preferred_class_type && (
                <div className="col-span-2">
                  <span className="font-medium">Preferred Class:</span>{" "}
                  {student.preferred_class_type}
                </div>
              )}
            </div>
          </div>

          {/* Approval Form */}
          <div className="space-y-4">
            <h4 className="font-medium">Approval Details</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admissionNo">Admission Number *</Label>
                <Input
                  id="admissionNo"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  placeholder="e.g. 10001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationDate">Registration Date</Label>
                <Input
                  id="registrationDate"
                  type="date"
                  value={registrationDate}
                  onChange={(e) => setRegistrationDate(e.target.value)}
                />
              </div>
            </div>

            {/* Admission Fee Section */}
            <div className="space-y-4 border rounded-lg p-4">
              <h5 className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Admission Fee Details
              </h5>

              <div className="flex items-center space-x-2">
                <Switch
                  id="admissionFeePaid"
                  checked={admissionFeePaid}
                  onCheckedChange={setAdmissionFeePaid}
                />
                <Label htmlFor="admissionFeePaid">Admission fee paid</Label>
              </div>

              {admissionFeePaid && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admissionFeeAmount">Amount (LKR)</Label>
                    <Input
                      id="admissionFeeAmount"
                      type="number"
                      step="0.01"
                      value={admissionFeeAmount}
                      onChange={(e) => setAdmissionFeeAmount(e.target.value)}
                      placeholder="5000.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admissionFeePaymentMethod">
                      Payment Method
                    </Label>
                    <Input
                      id="admissionFeePaymentMethod"
                      value={admissionFeePaymentMethod}
                      onChange={(e) =>
                        setAdmissionFeePaymentMethod(e.target.value)
                      }
                      placeholder="Cash, Bank Transfer, etc."
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="admissionFeeNotes">Payment Notes</Label>
                    <Textarea
                      id="admissionFeeNotes"
                      value={admissionFeeNotes}
                      onChange={(e) => setAdmissionFeeNotes(e.target.value)}
                      placeholder="Additional payment details..."
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Review Notes */}
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
              <Textarea
                id="reviewNotes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Any additional notes about this approval..."
                rows={3}
              />
            </div>

            {/* Communication Consent Info */}
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">
                    Communication Consent
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Email updates:{" "}
                    {student.guardian_email_consent ? "Allowed" : "Not allowed"}
                    {" • "}
                    WhatsApp messages:{" "}
                    {student.guardian_whatsapp_consent
                      ? "Allowed"
                      : "Not allowed"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={loading || !admissionNo.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve & Create Student
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
