"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  enrollmentService,
} from "@/lib/data";
import { EnrollStudentDialog } from "@/components/students/EnrollStudentDialog";
import { AdmissionFeeDialog } from "@/components/students/AdmissionFeeDialog";
import { useAuth } from "@/components/auth/AuthProvider";
import { StudentFeeHistory } from "@/components/students/StudentFeeHistory";
import { MultiRecordInvoiceDialog } from "@/components/students/MultiRecordInvoiceDialog";
import { EnrollmentInvoiceDialog } from "@/components/students/EnrollmentInvoiceDialog";
import {
  ArrowLeft,
  Loader2,
  Phone,
  User,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  GraduationCap,
  FileText,
  Bell,
  Edit,
  Save,
  X,
  UserPlus,
  Receipt,
  ExternalLink,
  Users,
} from "lucide-react";

const formatDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { role } = useAuth();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifs, setNotifs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    full_name: string;
    contact_number: string;
    address: string;
    guardian_name: string;
    guardian_contact: string;
    guardian_email: string;
  }>({
    full_name: "",
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

      // Update edit form when student data loads
      if (studentData.student) {
        setEditForm({
          full_name: studentData.student.fullname,
          contact_number: studentData.student.contact_number,
          address: studentData.student.address,
          guardian_name: studentData.student.guardian_name,
          guardian_contact: studentData.student.guardian_contact,
          guardian_email: studentData.student.guardian_email,
        });
      }
    } catch (error) {
      console.error("Failed to load student data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      load();
    }
  }, [studentId]);

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
    } catch (error) {
      console.error("Failed to update invoice status:", error);
    }
  };

  const handleEnrollmentStatus = async (
    enrollmentId: string,
    status: string,
  ) => {
    try {
      if (status === "DROPPED") {
        await enrollmentService.drop(enrollmentId);
      } else if (status === "ENROLLED") {
        await enrollmentService.reactivate(enrollmentId);
      }
      setEnrollments((prev) =>
        prev.map((enr) =>
          enr.id === enrollmentId
            ? { ...enr, status: status as EnrollmentStatus }
            : enr,
        ),
      );
    } catch (error) {
      console.error("Failed to update enrollment status:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (student) {
      setEditForm({
        full_name: student.fullname,
        contact_number: student.contact_number,
        address: student.address,
        guardian_name: student.guardian_name,
        guardian_contact: student.guardian_contact,
        guardian_email: student.guardian_email,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!student) return;

    setSaving(true);
    try {
      const updatedStudent = await studentService.update(student.id, editForm);
      setStudent(updatedStudent);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update student:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/students")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/students")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Student not found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/students")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{student.fullname}</h1>
            <p className="text-muted-foreground">Student Details</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/finance?tab=invoices&student_id=${student.id}`)
            }
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View All Invoices
          </Button>
        </div>
      </div>

      {/* Student Hero Section */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {student.fullname.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{student.fullname}</h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {student.admission_no || "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {student.contact_number}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {student.address}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Registered:{" "}
                  {formatDate(student.registration_date || student.created_at)}
                </div>
              </div>
            </div>

            {/* Guardian Info */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Guardian Information
              </h4>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">{student.guardian_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {student.guardian_contact}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {student.guardian_email}
                </div>
              </div>
            </div>

            {/* Status Info */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Status Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Admission Fee
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      student.admission_fee_paid
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700"
                        : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700"
                    }
                  >
                    {student.admission_fee_paid ? "Paid" : "Unpaid"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Enrollments
                  </span>
                  <Badge variant="outline">{enrollments.length} Active</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Invoices
                  </span>
                  <Badge variant="outline">
                    {invoices.length} Invoice{invoices.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollments">
            Enrollments ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications ({notifs.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Details Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Student Information</CardTitle>
                  <CardDescription>
                    Personal and contact details
                  </CardDescription>
                </div>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input
                          id="fullname"
                          value={editForm.full_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              full_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact">Contact Number</Label>
                        <Input
                          id="contact"
                          value={editForm.contact_number}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              contact_number: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm({ ...editForm, address: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="guardian_name">Guardian Name</Label>
                        <Input
                          id="guardian_name"
                          value={editForm.guardian_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              guardian_name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="guardian_contact">
                          Guardian Contact
                        </Label>
                        <Input
                          id="guardian_contact"
                          value={editForm.guardian_contact}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              guardian_contact: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="guardian_email">Guardian Email</Label>
                        <Input
                          id="guardian_email"
                          type="email"
                          value={editForm.guardian_email}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              guardian_email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Full Name
                        </Label>
                        <p className="font-medium">{student.fullname}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Contact</Label>
                        <p className="font-medium">{student.contact_number}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          NIC Number
                        </Label>
                        <p className="font-medium">{student.nic_no || "—"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Date of Birth
                        </Label>
                        <p className="font-medium">
                          {formatDate(student.date_of_birth)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Address</Label>
                      <p className="font-medium">{student.address}</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label className="text-muted-foreground">
                          Guardian Name
                        </Label>
                        <p className="font-medium">{student.guardian_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Guardian Contact
                        </Label>
                        <p className="font-medium">
                          {student.guardian_contact}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">
                          Guardian Email
                        </Label>
                        <p className="font-medium">{student.guardian_email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <EnrollStudentDialog
                    student={student}
                    onEnrolled={load}
                    trigger={
                      <Button variant="outline" className="justify-start">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Enroll in Class
                      </Button>
                    }
                  />

                  <AdmissionFeeDialog
                    student={student}
                    onUpdate={load}
                    trigger={
                      <Button variant="outline" className="justify-start">
                        <Receipt className="h-4 w-4 mr-2" />
                        Manage Admission Fee
                      </Button>
                    }
                  />

                  <MultiRecordInvoiceDialog
                    student={student}
                    onInvoiceCreated={load}
                    trigger={
                      <Button variant="outline" className="justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Create Multi-Record Invoice
                      </Button>
                    }
                  />

                  <EnrollmentInvoiceDialog
                    student={student}
                    onInvoiceCreated={load}
                    trigger={
                      <Button variant="outline" className="justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Generate from Enrollments
                      </Button>
                    }
                  />

                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={async () => {
                      await invoiceService.generateMonthly(
                        new Date().toISOString().slice(0, 7),
                      );
                      load();
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Generate Monthly Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Class Enrollments
              </CardTitle>
              <CardDescription>
                Manage student class enrollments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No enrollments found
                  </p>
                  <EnrollStudentDialog
                    student={student}
                    onEnrolled={load}
                    trigger={
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Enroll in First Class
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {enrollment.class?.subject?.name} -{" "}
                          {enrollment.class?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Teacher: {enrollment.class?.teacher?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Enrolled: {formatDate(enrollment.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={enrollment.status}
                          onValueChange={(value) =>
                            handleEnrollmentStatus(enrollment.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ENROLLED">Active</SelectItem>
                            <SelectItem value="DROPPED">Dropped</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <StudentFeeHistory studentId={student.id} />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification History
              </CardTitle>
              <CardDescription>
                Recent notifications sent to this student
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No notifications found
                </p>
              ) : (
                <div className="space-y-4">
                  {notifs.map((notif) => (
                    <div key={notif.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {notif.notification_type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notif.message}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {formatDate(notif.created_at)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
