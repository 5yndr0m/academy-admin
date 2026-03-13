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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { DraftStudent, draftStudentService } from "@/lib/data";
import {
  XCircle,
  Loader2,
  AlertTriangle,
  User,
  MessageSquare,
} from "lucide-react";

interface DraftStudentRejectDialogProps {
  student: DraftStudent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function DraftStudentRejectDialog({
  student,
  open,
  onOpenChange,
  onComplete,
}: DraftStudentRejectDialogProps) {
  const { toast } = useToast();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
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
      await draftStudentService.reject(student.id, {
        status: "rejected",
        review_notes: reviewNotes.trim(),
        reviewed_by: userId,
      });

      toast({
        title: "Student Rejected",
        description: "The registration application has been rejected",
      });

      onComplete();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Reject Registration
          </DialogTitle>
          <DialogDescription>
            Reject {student.full_name}'s registration application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Student Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Student Details
            </h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Name:</span> {student.full_name}
              </div>
              <div>
                <span className="font-medium">Guardian:</span>{" "}
                {student.guardian_name}
              </div>
              <div>
                <span className="font-medium">Email:</span>{" "}
                {student.guardian_email}
              </div>
              {student.preferred_class_type && (
                <div>
                  <span className="font-medium">Preferred Class:</span>{" "}
                  {student.preferred_class_type}
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-800 dark:text-red-200">
                  This action cannot be undone
                </p>
                <p className="text-red-700 dark:text-red-300">
                  The guardian will be notified about the rejection via email if
                  they have given consent.
                </p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="reviewNotes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Reason for Rejection *
            </Label>
            <Textarea
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Please provide a clear reason for rejecting this application. This will be included in the notification email to the guardian."
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              This reason will be shared with the guardian in their rejection
              notification.
            </p>
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
            variant="destructive"
            onClick={handleReject}
            disabled={loading || !reviewNotes.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Reject Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
