"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Student,
  Enrollment,
  Invoice,
  NotificationLog,
  InvoiceStatus,
  EnrollmentStatus,
} from "@/types";
import {
  studentService,
  invoiceService,
  notificationService,
} from "@/lib/data";
import { EnrollStudentDialog } from "./EnrollStudentDialog";
import { AdmissionFeeDialog } from "./AdmissionFeeDialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { StudentFeeHistory } from "./StudentFeeHistory";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import {
  Eye,
  Loader2,
  Phone,
  User,
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  CreditCard,
  MessageSquare,
  BadgeDollarSign,
  CheckCircle2,
  XCircle,
  Plus,
  GraduationCap,
  Clock,
  Hash,
  Receipt,
  Edit,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentDetailsModalProps {
  studentId: string;
  trigger?: React.ReactNode;
  onUpdate?: () => void;
}

const fmt = (n: number) => `LKR ${Number(n ?? 0).toLocaleString()}`;

const fmtDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    fullname: string;
    contact_number: string;
    address: string;
    guardian_name: string;
    guardian_contact: string;
    guardian_email: string;
  }>({
    fullname: "",
    contact_number: "",
    address: "",
    guardian_name: "",
    guardian_contact: "",
    guardian_email: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [studentData, i, n] = await Promise.all([
        studentService.getById(studentId),
        invoiceService.getByStudent(studentId),
        notificationService.getByStudent(studentId),
      ]);
      setStudent(studentData.student);
      setEnrollments(studentData.enrollments ?? []);
      setInvoices(i);
      setNotifs(n);
    } catch {
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
        prev.map((inv) =>
          inv.id === invoiceId
            ? { ...inv, status: status as InvoiceStatus }
            : inv,
        ),
      );
      onUpdate?.();
    } catch {}
  };

  const handleEdit = () => {
    setEditForm({
      fullname: student?.fullname || "",
      contact_number: student?.contact_number || "",
      address: student?.address || "",
      guardian_name: student?.guardian_name || "",
      guardian_contact: student?.guardian_contact || "",
      guardian_email: student?.guardian_email || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!student) return;
    setSaving(true);
    try {
      await studentService.update(student.id, {
        full_name: editForm.fullname,
        address: editForm.address,
        contact_number: editForm.contact_number,
        guardian_name: editForm.guardian_name,
        guardian_contact: editForm.guardian_contact,
        guardian_email: editForm.guardian_email,
      });
      await load();
      setIsEditing(false);
      onUpdate?.();
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      fullname: "",
      contact_number: "",
      address: "",
      guardian_name: "",
      guardian_contact: "",
      guardian_email: "",
    });
  };

  const displayName = student?.fullname ?? "Loading...";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalBilled = invoices.reduce(
    (s, i) => s + Number(i.total_amount ?? 0),
    0,
  );
  const totalPaid = invoices
    .filter((i) => i.payment_status === "PAID")
    .reduce((s, i) => s + Number(i.total_amount ?? 0), 0);
  const totalPending = invoices
    .filter((i) => i.payment_status === "UNPAID")
    .reduce((s, i) => s + Number(i.total_amount ?? 0), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="!max-w-5xl w-[95vw] max-h-[92vh] flex flex-col p-0 overflow-hidden gap-0">
        <VisuallyHidden>
          <DialogTitle>Student Details - {displayName}</DialogTitle>
        </VisuallyHidden>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
            <p className="text-sm text-muted-foreground">
              Loading student profile...
            </p>
          </div>
        ) : !student ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <User className="h-12 w-12 opacity-10" />
            <p className="text-sm">Student not found.</p>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-6 flex-shrink-0 border-b">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg flex-shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {displayName}
                    </h2>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {student.admission_no && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <Hash className="h-3 w-3" /> {student.admission_no}
                        </span>
                      )}
                      {student.gender && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />{" "}
                          {student.gender === "M" ? "Male" : "Female"}
                        </span>
                      )}
                      {student.date_of_birth && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />{" "}
                          {fmtDate(student.date_of_birth)}
                        </span>
                      )}
                      <Badge
                        className={cn(
                          "text-[10px] h-5 font-semibold",
                          student.admission_fee_paid
                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                            : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
                        )}
                        variant="outline"
                      >
                        {student.admission_fee_paid
                          ? "✓ Admission Paid"
                          : "⚠ Admission Unpaid"}
                      </Badge>
                    </div>
                  </div>
                </div>
                {role === "ADMIN" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={async () => {
                      await invoiceService.generateMonthly(
                        new Date().toISOString().slice(0, 7),
                      );
                      load();
                    }}
                  >
                    <BadgeDollarSign className="mr-2 h-4 w-4" />
                    Generate Bill
                  </Button>
                )}
                {role === "ADMIN" && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] divide-y lg:divide-y-0 lg:divide-x min-h-full">
                {/* LEFT — Profile sidebar */}
                <div className="p-6 space-y-6 bg-muted/20">
                  <section className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Student
                    </p>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="student-phone" className="text-xs">
                            Phone
                          </Label>
                          <Input
                            id="student-phone"
                            value={editForm.contact_number || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                contact_number: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label htmlFor="student-address" className="text-xs">
                            Address
                          </Label>
                          <Textarea
                            id="student-address"
                            value={editForm.address || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                address: e.target.value,
                              })
                            }
                            className="min-h-[60px] text-xs resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <ProfileRow
                          icon={<Phone />}
                          label="Phone"
                          value={student.contact_number}
                        />
                        <ProfileRow
                          icon={<MapPin />}
                          label="Address"
                          value={student.address}
                        />
                      </>
                    )}
                    <ProfileRow
                      icon={<Hash />}
                      label="NIC / Birth Cert"
                      value={student.nic_no}
                    />
                    <ProfileRow
                      icon={<Calendar />}
                      label="Registered"
                      value={fmtDate(student.registration_date)}
                    />
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Guardian
                    </p>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="student-name" className="text-xs">
                            Full Name
                          </Label>
                          <Input
                            id="student-name"
                            value={editForm.fullname || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                fullname: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label htmlFor="guardian-name" className="text-xs">
                            Guardian Name
                          </Label>
                          <Input
                            id="guardian-name"
                            value={editForm.guardian_name || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                guardian_name: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label htmlFor="guardian-contact" className="text-xs">
                            Guardian Contact
                          </Label>
                          <Input
                            id="guardian-contact"
                            value={editForm.guardian_contact || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                guardian_contact: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label htmlFor="guardian-email" className="text-xs">
                            Guardian Email
                          </Label>
                          <Input
                            id="guardian-email"
                            type="email"
                            value={editForm.guardian_email || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                guardian_email: e.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <ProfileRow
                          icon={<User />}
                          label="Name"
                          value={student.guardian_name}
                        />
                        <ProfileRow
                          icon={<Phone />}
                          label="Contact"
                          value={student.guardian_contact}
                        />
                        <ProfileRow
                          icon={<Mail />}
                          label="Email"
                          value={student.guardian_email}
                        />
                      </>
                    )}
                  </section>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {student && (
                        <>
                          <EnrollStudentDialog
                            student={student}
                            onEnrolled={load}
                            trigger={
                              <Button variant="outline" size="sm">
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Enroll in Class
                              </Button>
                            }
                          />
                          <AdmissionFeeDialog
                            student={student}
                            onUpdate={load}
                            trigger={
                              <Button variant="outline" size="sm">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Manage Admission Fee
                              </Button>
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT — Tabs */}
                <div className="p-6">
                  <Tabs defaultValue="enrollments">
                    <TabsList className="w-full grid grid-cols-4">
                      <TabsTrigger value="enrollments" className="text-xs">
                        <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                        Classes ({enrollments.length})
                      </TabsTrigger>
                      <TabsTrigger value="fees" className="text-xs">
                        <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                        Fees
                      </TabsTrigger>
                      <TabsTrigger value="invoices" className="text-xs">
                        <Receipt className="mr-1.5 h-3.5 w-3.5" />
                        Invoices ({invoices.length})
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="text-xs">
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                        Messages ({notifs.length})
                      </TabsTrigger>
                    </TabsList>

                    {/* Enrollments */}
                    <TabsContent value="enrollments" className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Manage student class enrollments
                        </p>
                        {student && (
                          <EnrollStudentDialog
                            student={student}
                            onEnrolled={load}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Class
                              </Button>
                            }
                          />
                        )}
                      </div>
                      {enrollments.length === 0 ? (
                        <EmptyState
                          icon={<BookOpen />}
                          text="Not enrolled in any classes yet."
                        />
                      ) : (
                        enrollments.map((enr) => {
                          const teacherName =
                            enr.class?.teacher?.full_name ??
                            (enr.class?.teacher as any)?.fullname ??
                            "—";
                          return (
                            <div
                              key={enr.id}
                              className="rounded-xl border bg-card p-4 flex items-center justify-between gap-4 hover:bg-accent/30 transition-colors"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <GraduationCap className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {enr.class?.name ?? "—"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {teacherName}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="text-right hidden sm:block">
                                  <p className="text-sm font-mono font-semibold">
                                    {enr.class
                                      ? fmt(enr.class.base_monthly_fee)
                                      : "—"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    per month
                                  </p>
                                </div>
                                {role === "ADMIN" ? (
                                  <Select
                                    value={enr.status}
                                    onValueChange={(v) =>
                                      setEnrollments((prev) =>
                                        prev.map((e) =>
                                          e.id === enr.id
                                            ? {
                                                ...e,
                                                status: v as EnrollmentStatus,
                                              }
                                            : e,
                                        ),
                                      )
                                    }
                                  >
                                    <SelectTrigger
                                      className={cn(
                                        "h-8 w-[120px] text-[11px] font-bold",
                                        enr.status === "ENROLLED"
                                          ? "text-green-700 bg-green-50 border-green-200"
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
                              </div>
                            </div>
                          );
                        })
                      )}
                    </TabsContent>

                    {/* Fees */}
                    <TabsContent value="fees" className="mt-4">
                      <StudentFeeHistory
                        studentId={studentId}
                        onUpdate={() => {
                          load();
                          onUpdate?.();
                        }}
                      />
                    </TabsContent>

                    {/* Invoices */}
                    <TabsContent value="invoices" className="mt-4 space-y-3">
                      {invoices.length === 0 ? (
                        <EmptyState
                          icon={<CreditCard />}
                          text="No invoices generated yet."
                        />
                      ) : (
                        invoices.map((inv) => (
                          <div
                            key={inv.id}
                            className="rounded-xl border bg-card p-4 flex items-center justify-between gap-4 hover:bg-accent/30 transition-colors"
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div
                                className={cn(
                                  "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                  inv.payment_status === "PAID"
                                    ? "bg-green-100"
                                    : "bg-amber-100",
                                )}
                              >
                                {inv.payment_status === "PAID" ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                ) : (
                                  <Clock className="h-5 w-5 text-amber-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-sm font-mono">
                                  {inv.billing_month}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] h-4 font-normal"
                                  >
                                    {inv.invoice_type}
                                  </Badge>
                                  <p className="text-[10px] text-muted-foreground">
                                    {inv.billing_month}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <p className="font-mono font-bold text-base">
                                {fmt(inv.total_amount)}
                              </p>
                              {role === "ADMIN" ? (
                                <Select
                                  value={inv.payment_status}
                                  onValueChange={(v) =>
                                    handleInvoiceStatus(inv.id, v)
                                  }
                                >
                                  <SelectTrigger
                                    className={cn(
                                      "h-8 w-[120px] text-[11px] font-bold",
                                      inv.payment_status === "PAID"
                                        ? "text-green-700 bg-green-50 border-green-200"
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
                                <StatusBadge status={inv.payment_status} />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>

                    {/* Notifications */}
                    <TabsContent
                      value="notifications"
                      className="mt-4 space-y-3"
                    >
                      {notifs.length === 0 ? (
                        <EmptyState
                          icon={<MessageSquare />}
                          text="No messages sent yet."
                        />
                      ) : (
                        notifs.map((n) => (
                          <div
                            key={n.id}
                            className="rounded-xl border bg-card p-4 flex items-start justify-between gap-4 hover:bg-accent/30 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={cn(
                                  "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                                  n.channel === "WHATSAPP"
                                    ? "bg-green-100"
                                    : "bg-purple-100",
                                )}
                              >
                                <MessageSquare
                                  className={cn(
                                    "h-4 w-4",
                                    n.channel === "WHATSAPP"
                                      ? "text-green-600"
                                      : "text-purple-600",
                                  )}
                                />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] h-4 uppercase font-bold",
                                      n.channel === "WHATSAPP"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-purple-50 text-purple-700 border-purple-200",
                                    )}
                                  >
                                    {n.channel}
                                  </Badge>
                                  <span className="text-sm font-semibold">
                                    {n.notification_type}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {n.recipient}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span className="text-[10px] text-muted-foreground">
                                {fmtDate(n.sent_at || n.created_at)}
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
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          {label}
        </p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function SnapCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "green" | "amber" | "slate";
}) {
  return (
    <div
      className={cn(
        "rounded-lg px-3 py-2 flex items-center justify-between",
        color === "green"
          ? "bg-green-50 dark:bg-green-950/30"
          : color === "amber"
            ? "bg-amber-50 dark:bg-amber-950/30"
            : "bg-muted/50",
      )}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-bold font-mono",
          color === "green"
            ? "text-green-700"
            : color === "amber"
              ? "text-amber-700"
              : "text-foreground",
        )}
      >
        {value}
      </span>
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
          ? "text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950 dark:border-green-800"
          : status === "OVERDUE" || status === "FAILED"
            ? "text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-950 dark:border-red-800"
            : "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950 dark:border-amber-800",
      )}
    >
      {status}
    </Badge>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center opacity-40">
        {icon}
      </div>
      <p className="text-sm italic">{text}</p>
    </div>
  );
}
