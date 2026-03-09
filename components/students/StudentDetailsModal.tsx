"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student, Enrollment, Invoice, NotificationLog } from "@/types";
import {
  studentService,
  enrollmentService,
  invoiceService,
  notificationService,
} from "@/lib/data";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Eye,
  Loader2,
  Phone,
  User,
  MessageSquare,
  History,
  BookOpen,
  CreditCard,
  BadgeDollarSign,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentDetailsModalProps {
  studentId: string;
  trigger?: React.ReactNode;
  onUpdate?: () => void;
}

export function StudentDetailsModal({
  studentId,
  trigger,
  onUpdate,
}: StudentDetailsModalProps) {
  const { role } = useAuth();
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifs, setNotifs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, e, i, n] = await Promise.all([
        studentService.getById(studentId),
        enrollmentService.getByStudent(studentId),
        invoiceService.getByStudent(studentId),
        notificationService.getByStudent(studentId),
      ]);
      setStudent(s);
      setEnrollments(e);
      setInvoices(i);
      setNotifs(n);
    } catch {
      /* show partial data */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open, studentId]);

  const handleInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      await invoiceService.updateStatus(invoiceId, status);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv)),
      );
      onUpdate?.();
    } catch {
      /* silently fail */
    }
  };

  const handleEnrollStatus = async (enrollId: string, status: string) => {
    try {
      await enrollmentService.updateStatus(enrollId, status);
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollId ? { ...e, status } : e)),
      );
    } catch {
      /* silently fail */
    }
  };

  const fmt = (n: number) => `LKR ${n.toLocaleString()}`;
  const displayName = student?.full_name ?? "...";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[88vh] flex flex-col p-0 overflow-hidden rounded-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {displayName}
                </DialogTitle>
                <DialogDescription className="text-xs font-mono">
                  {student?.admission_no
                    ? `Adm. ${student.admission_no}`
                    : `ID: ${studentId}`}
                </DialogDescription>
              </div>
            </div>
            {role === "ADMIN" && student && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-2"
                onClick={async () => {
                  await invoiceService.generateMonthly(
                    new Date().toISOString().slice(0, 7),
                  );
                  load();
                }}
              >
                <BadgeDollarSign className="h-3.5 w-3.5" />
                Generate Bill
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : student ? (
            <>
              {/* Contact cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InfoCard
                  icon={<Phone className="h-3 w-3" />}
                  label="Student"
                  value={student.contact_number}
                />
                <InfoCard
                  icon={<User className="h-3 w-3" />}
                  label="Guardian"
                  value={student.guardian_name}
                />
                <InfoCard
                  icon={<Phone className="h-3 w-3" />}
                  label="Guardian Contact"
                  value={student.guardian_contact}
                />
                <InfoCard
                  icon={<CheckCircle2 className="h-3 w-3" />}
                  label="Admission Fee"
                  value={student.admission_fee_paid ? "Paid" : "Unpaid"}
                  valueClass={
                    student.admission_fee_paid
                      ? "text-green-700"
                      : "text-amber-600"
                  }
                />
              </div>

              <Tabs defaultValue="enrollments">
                <TabsList>
                  <TabsTrigger value="enrollments">
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                    Enrollments ({enrollments.length})
                  </TabsTrigger>
                  <TabsTrigger value="invoices">
                    <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                    Invoices ({invoices.length})
                  </TabsTrigger>
                  <TabsTrigger value="notifications">
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    Notifications ({notifs.length})
                  </TabsTrigger>
                </TabsList>

                {/* ── Enrollments ── */}
                <TabsContent value="enrollments" className="mt-4">
                  {enrollments.length === 0 ? (
                    <EmptyState
                      icon={<BookOpen />}
                      text="Not enrolled in any classes yet."
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Monthly Fee</TableHead>
                          <TableHead>Enrolled</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enr) => (
                          <TableRow key={enr.id}>
                            <TableCell className="font-medium text-sm">
                              {enr.class?.name ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {enr.class?.teacher?.full_name ??
                                (enr.class?.teacher as any)?.fullname ??
                                "—"}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {enr.class
                                ? fmt(enr.class.base_monthly_fee)
                                : "—"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {enr.enrollment_date
                                ? new Date(
                                    enr.enrollment_date,
                                  ).toLocaleDateString()
                                : new Date(enr.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {role === "ADMIN" ? (
                                <Select
                                  value={enr.status}
                                  onValueChange={(v) =>
                                    handleEnrollStatus(enr.id, v)
                                  }
                                >
                                  <SelectTrigger
                                    className={cn(
                                      "h-7 w-[110px] ml-auto text-[10px] font-bold",
                                      enr.status === "ACTIVE"
                                        ? "text-green-700 bg-green-50 border-green-200"
                                        : enr.status === "COMPLETED"
                                          ? "text-blue-700 bg-blue-50 border-blue-200"
                                          : "text-amber-700 bg-amber-50 border-amber-200",
                                    )}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ACTIVE">
                                      ACTIVE
                                    </SelectItem>
                                    <SelectItem value="INACTIVE">
                                      INACTIVE
                                    </SelectItem>
                                    <SelectItem value="COMPLETED">
                                      COMPLETED
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <StatusBadge status={enr.status} />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                {/* ── Invoices ── */}
                <TabsContent value="invoices" className="mt-4">
                  {invoices.length === 0 ? (
                    <EmptyState
                      icon={<CreditCard />}
                      text="No invoices generated yet."
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Month</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Due</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-mono text-sm">
                              {inv.billing_month}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="text-[10px] font-normal"
                              >
                                {inv.invoice_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono font-medium text-sm">
                              {fmt(inv.amount)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {inv.due_date
                                ? new Date(inv.due_date).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {role === "ADMIN" ? (
                                <Select
                                  value={inv.status}
                                  onValueChange={(v) =>
                                    handleInvoiceStatus(inv.id, v)
                                  }
                                >
                                  <SelectTrigger
                                    className={cn(
                                      "h-7 w-[110px] ml-auto text-[10px] font-bold",
                                      inv.status === "PAID"
                                        ? "text-green-700 bg-green-50 border-green-200"
                                        : inv.status === "OVERDUE"
                                          ? "text-red-700 bg-red-50 border-red-200"
                                          : "text-amber-700 bg-amber-50 border-amber-200",
                                    )}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING">
                                      PENDING
                                    </SelectItem>
                                    <SelectItem value="PAID">PAID</SelectItem>
                                    <SelectItem value="OVERDUE">
                                      OVERDUE
                                    </SelectItem>
                                    <SelectItem value="CANCELLED">
                                      CANCELLED
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <StatusBadge status={inv.status} />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                {/* ── Notifications ── */}
                <TabsContent value="notifications" className="mt-4 space-y-2">
                  {notifs.length === 0 ? (
                    <EmptyState
                      icon={<MessageSquare />}
                      text="No notifications sent yet."
                    />
                  ) : (
                    notifs.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start justify-between p-4 rounded-lg border bg-muted/10 hover:bg-muted/20 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] h-4 uppercase font-bold",
                                n.channel === "WHATSAPP"
                                  ? "bg-green-50 text-green-700"
                                  : n.channel === "SMS"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-purple-50 text-purple-700",
                              )}
                            >
                              {n.channel}
                            </Badge>
                            <span className="text-sm font-medium">
                              {n.message_type}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {n.recipient}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <History className="h-3 w-3" />
                            {new Date(
                              n.sent_at ?? n.created_at,
                            ).toLocaleDateString()}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] h-4 px-2 font-bold",
                              n.status === "SENT"
                                ? "border-green-200 text-green-700 bg-green-50"
                                : n.status === "FAILED"
                                  ? "border-red-200 text-red-700 bg-red-50"
                                  : "border-amber-200 text-amber-700 bg-amber-50",
                            )}
                          >
                            {n.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <User className="h-12 w-12 opacity-10" />
              <p className="text-sm">Student not found.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="border rounded-lg p-3 space-y-1 bg-muted/20">
      <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5 font-mono">
        {icon} {label}
      </p>
      <p className={cn("font-medium text-sm", valueClass)}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-bold",
        status === "ACTIVE" || status === "PAID"
          ? "text-green-700 bg-green-50 border-green-200"
          : status === "OVERDUE" || status === "FAILED"
            ? "text-red-700 bg-red-50 border-red-200"
            : "text-amber-700 bg-amber-50 border-amber-200",
      )}
    >
      {status}
    </Badge>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
      <div className="h-8 w-8 opacity-10">{icon}</div>
      <p className="text-xs font-mono italic">{text}</p>
    </div>
  );
}
