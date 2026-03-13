"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { emailService } from "@/lib/data";
import {
  Mail,
  Send,
  X,
  User,
  DollarSign,
  Calendar,
  CreditCard,
} from "lucide-react";

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: "payment_receipt" | "class_cancellation" | "custom";
  paymentRecords?: Array<{
    id: string;
    student_id: string;
    student_name: string;
    guardian_email: string;
    class_id?: string;
    class_name?: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    guardian_email_consent?: boolean;
  }>;
  defaultData?: {
    student_id?: string;
    student_name?: string;
    guardian_email?: string;
    class_id?: string;
    class_name?: string;
    amount?: number;
    payment_date?: string;
    payment_method?: string;
  };
}

export function SendEmailDialog({
  open,
  onOpenChange,
  type = "custom",
  paymentRecords = [],
  defaultData,
}: SendEmailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const { toast } = useToast();

  // Payment Receipt Form State
  const [paymentForm, setPaymentForm] = useState({
    student_id: defaultData?.student_id || "",
    amount: defaultData?.amount || 0,
    payment_date:
      defaultData?.payment_date || new Date().toISOString().split("T")[0],
    payment_method: defaultData?.payment_method || "CASH",
    class_name: defaultData?.class_name || "",
  });

  // Class Cancellation Form State
  const [cancellationForm, setCancellationForm] = useState({
    class_id: defaultData?.class_id || "",
    cancellation_date: new Date().toISOString().split("T")[0],
    reason: "",
  });

  // Custom Email Form State
  const [customForm, setCustomForm] = useState({
    recipients: defaultData?.guardian_email
      ? [defaultData.guardian_email]
      : [""],
    subject: "",
    body: "",
    is_html: false,
  });

  // Initialize selected records when dialog opens
  React.useEffect(() => {
    if (open && type === "payment_receipt" && paymentRecords.length > 0) {
      setSelectedRecords(paymentRecords.map((record) => record.id));
    }
  }, [open, type, paymentRecords]);

  const handleSendPaymentReceipt = async () => {
    setLoading(true);
    try {
      const recordsToSend = paymentRecords.filter(
        (record) =>
          selectedRecords.includes(record.id) && record.guardian_email_consent,
      );

      if (recordsToSend.length === 0) {
        toast({
          title: "No Emails Sent",
          description:
            "No records selected or guardians haven't consented to emails.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      let sent = 0;
      let failed = 0;

      for (const record of recordsToSend) {
        try {
          await emailService.sendPaymentReceipt({
            student_id: record.student_id,
            amount: record.amount,
            payment_date: record.payment_date,
            payment_method: record.payment_method,
            class_name: record.class_name,
          });
          sent++;
        } catch {
          failed++;
        }
      }

      toast({
        title: "Receipts Sent",
        description: `${sent} receipt(s) sent successfully${failed > 0 ? `, ${failed} failed` : ""}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send payment receipts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendClassCancellation = async () => {
    setLoading(true);
    try {
      const response =
        await emailService.sendClassCancellation(cancellationForm);
      toast({
        title: "Success",
        description: `Class cancellation emails sent! (${response.emails_sent} sent, ${response.emails_failed} failed)`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Failed to send class cancellation emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCustomEmail = async () => {
    setLoading(true);
    try {
      const recipients = customForm.recipients.filter(
        (email) => email.trim() !== "",
      );
      const response = await emailService.sendCustomEmail({
        ...customForm,
        recipients,
      });
      toast({
        title: "Success",
        description: `Custom emails sent! (${response.emails_sent} sent, ${response.emails_failed} failed)`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send custom emails. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRecipient = () => {
    setCustomForm((prev) => ({
      ...prev,
      recipients: [...prev.recipients, ""],
    }));
  };

  const removeRecipient = (index: number) => {
    setCustomForm((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const updateRecipient = (index: number, email: string) => {
    setCustomForm((prev) => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => (i === index ? email : r)),
    }));
  };

  const getTitle = () => {
    switch (type) {
      case "payment_receipt":
        return `Send Payment Receipt${paymentRecords.length > 1 ? "s" : ""}`;
      case "class_cancellation":
        return "Send Class Cancellation Notice";
      default:
        return "Send Custom Email";
    }
  };

  const getDescription = () => {
    switch (type) {
      case "payment_receipt":
        return `Send payment receipt email${paymentRecords.length > 1 ? "s" : ""} to guardian${paymentRecords.length > 1 ? "s" : ""} with PDF attachment${paymentRecords.length > 1 ? "s" : ""}.`;
      case "class_cancellation":
        return "Send class cancellation notifications to all enrolled students' guardians.";
      default:
        return "Send a custom email to specific recipients.";
    }
  };

  const handleSubmit = () => {
    switch (type) {
      case "payment_receipt":
        return handleSendPaymentReceipt();
      case "class_cancellation":
        return handleSendClassCancellation();
      default:
        return handleSendCustomEmail();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {type === "payment_receipt" && (
            <>
              {paymentRecords.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Select Payment Records to Email
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedRecords(paymentRecords.map((r) => r.id))
                        }
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRecords([])}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                    {paymentRecords.map((record) => (
                      <div
                        key={record.id}
                        className={`flex items-start space-x-3 p-3 border rounded-lg ${
                          !record.guardian_email_consent
                            ? "opacity-50 bg-gray-50"
                            : selectedRecords.includes(record.id)
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white"
                        }`}
                      >
                        <Checkbox
                          id={record.id}
                          checked={selectedRecords.includes(record.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedRecords([
                                ...selectedRecords,
                                record.id,
                              ]);
                            } else {
                              setSelectedRecords(
                                selectedRecords.filter(
                                  (id) => id !== record.id,
                                ),
                              );
                            }
                          }}
                          disabled={!record.guardian_email_consent}
                        />

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">
                              {record.student_name}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span>LKR {record.amount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{record.payment_date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              <span>
                                {record.payment_method.replace("_", " ")}
                              </span>
                            </div>
                            {record.class_name && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs">
                                  📚 {record.class_name}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs">
                              📧 {record.guardian_email}
                            </span>
                            {!record.guardian_email_consent && (
                              <Badge variant="destructive" className="text-xs">
                                No Email Consent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>{selectedRecords.length}</strong> receipt(s)
                      selected for sending.
                      {paymentRecords.some(
                        (r) => !r.guardian_email_consent,
                      ) && (
                        <span className="block text-xs mt-1 text-blue-600">
                          Records without email consent are disabled and won't
                          be sent.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No payment records provided</p>
                </div>
              )}
            </>
          )}

          {type === "class_cancellation" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cancellation_date">Cancellation Date</Label>
                  <Input
                    id="cancellation_date"
                    type="date"
                    value={cancellationForm.cancellation_date}
                    onChange={(e) =>
                      setCancellationForm((prev) => ({
                        ...prev,
                        cancellation_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reason">Reason for Cancellation</Label>
                <Textarea
                  id="reason"
                  value={cancellationForm.reason}
                  onChange={(e) =>
                    setCancellationForm((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  placeholder="Enter reason for class cancellation"
                  rows={3}
                />
              </div>
              {defaultData?.class_name && (
                <p className="text-sm text-muted-foreground">
                  Sending to all enrolled students in:{" "}
                  <strong>{defaultData.class_name}</strong>
                </p>
              )}
            </>
          )}

          {type === "custom" && (
            <>
              <div>
                <Label>Recipients</Label>
                <div className="space-y-2">
                  {customForm.recipients.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                        placeholder="Enter email address"
                      />
                      {customForm.recipients.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRecipient(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRecipient}
                  >
                    Add Recipient
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={customForm.subject}
                  onChange={(e) =>
                    setCustomForm((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={customForm.body}
                  onChange={(e) =>
                    setCustomForm((prev) => ({
                      ...prev,
                      body: e.target.value,
                    }))
                  }
                  placeholder="Enter your message"
                  rows={6}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_html"
                  checked={customForm.is_html}
                  onCheckedChange={(checked) =>
                    setCustomForm((prev) => ({
                      ...prev,
                      is_html: checked,
                    }))
                  }
                />
                <Label htmlFor="is_html">Send as HTML</Label>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
