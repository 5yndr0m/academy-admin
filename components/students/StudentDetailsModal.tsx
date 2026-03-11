"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  studentService,
  enrollmentService,
  attendanceService,
  studentFeePaymentService,
} from "@/lib/data";
import { Student, Enrollment } from "@/types";
import { EnrollStudentDialog } from "./EnrollStudentDialog";
import {
  Loader2,
  Save,
  X,
  Edit,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  DollarSign,
  UserCheck,
  Plus,
} from "lucide-react";

interface StudentDetailsModalProps {
  studentId: string;
  trigger?: React.ReactNode;
  onUpdate?: () => void;
}

interface PaymentStatus {
  month: string;
  class_id: string;
  class_name: string;
  amount: number;
  paid: boolean;
  payment_status: string;
}

interface AttendanceData {
  class_id: string;
  class_name: string;
  total_sessions: number;
  attended_sessions: number;
  percentage: number;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMonth = (monthString: string) => {
  const [year, month] = monthString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

export function StudentDetailsModal({
  studentId,
  trigger,
  onUpdate,
}: StudentDetailsModalProps) {
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<PaymentStatus[]>([]);
  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: "",
    contact_number: "",
    address: "",
    guardian_name: "",
    guardian_contact: "",
    guardian_email: "",
  });

  const loadStudentData = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      // Load student and enrollments
      const studentData = await studentService.getById(studentId);
      setStudent(studentData.student);
      setEnrollments(studentData.enrollments || []);

      // Set edit form
      setEditForm({
        fullname: studentData.student.fullname || "",
        contact_number: studentData.student.contact_number || "",
        address: studentData.student.address || "",
        guardian_name: studentData.student.guardian_name || "",
        guardian_contact: studentData.student.guardian_contact || "",
        guardian_email: studentData.student.guardian_email || "",
      });

      // Load payment history
      try {
        const paymentData =
          await studentFeePaymentService.getStudentFeeHistory(studentId);
        const paymentStatusList: PaymentStatus[] = [];

        // Process payments and missed months
        paymentData.payments.forEach((payment: any) => {
          paymentStatusList.push({
            month: payment.payment_month,
            class_id: payment.class_id,
            class_name: payment.class?.name || "Unknown Class",
            amount: payment.amount,
            paid: payment.payment_status === "PAID",
            payment_status: payment.payment_status,
          });
        });

        paymentData.missed_months.forEach((missed: any) => {
          paymentStatusList.push({
            month: missed.month,
            class_id: missed.class_id,
            class_name: missed.class_name,
            amount: missed.expected_amount,
            paid: false,
            payment_status: "UNPAID",
          });
        });

        setPayments(
          paymentStatusList.sort((a, b) => b.month.localeCompare(a.month)),
        );
      } catch (error) {
        console.error("Failed to load payment data:", error);
        setPayments([]);
      }

      // Load attendance data
      try {
        const attendanceData: AttendanceData[] = [];
        for (const enrollment of studentData.enrollments || []) {
          if (enrollment.class?.id) {
            try {
              const summary = await attendanceService.getByStudent(
                studentId,
                enrollment.class.id,
              );
              const totalSessions = summary.total_sessions || 0;
              const presentCount = summary.present_count || 0;
              const percentage =
                totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

              attendanceData.push({
                class_id: enrollment.class.id,
                class_name: enrollment.class.name || "Unknown Class",
                total_sessions: totalSessions,
                attended_sessions: presentCount,
                percentage: percentage,
              });
            } catch (error) {
              console.error(
                `Failed to load attendance for class ${enrollment.class.id}:`,
                error,
              );
            }
          }
        }
        setAttendance(attendanceData);
      } catch (error) {
        console.error("Failed to load attendance data:", error);
        setAttendance([]);
      }
    } catch (error) {
      console.error("Failed to load student data:", error);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const handleSave = async () => {
    if (!student) return;
    setSaving(true);
    try {
      await studentService.update(student.id, {
        full_name: editForm.fullname,
        contact_number: editForm.contact_number,
        address: editForm.address,
        guardian_name: editForm.guardian_name,
        guardian_contact: editForm.guardian_contact,
        guardian_email: editForm.guardian_email,
      });
      setIsEditing(false);
      await loadStudentData();
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update student:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (student) {
      setEditForm({
        fullname: student.fullname || "",
        contact_number: student.contact_number || "",
        address: student.address || "",
        guardian_name: student.guardian_name || "",
        guardian_contact: student.guardian_contact || "",
        guardian_email: student.guardian_email || "",
      });
    }
  };

  useEffect(() => {
    if (open) {
      loadStudentData();
    }
  }, [open, loadStudentData]);

  const getPaymentStatusBadge = (status: string, paid: boolean) => {
    if (paid || status === "PAID") {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Paid
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">Unpaid</Badge>
      );
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="!max-w-6xl !h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>
                {student
                  ? `${student.fullname} - Student Details`
                  : "Student Details"}
              </span>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            {isEditing && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : student ? (
          <div className="flex h-full overflow-hidden">
            {/* LEFT PANEL - Student & Guardian Info */}
            <div className="w-2/5 border-r flex flex-col">
              <div className="p-6 space-y-6 overflow-auto">
                {/* Student Info */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Student Information
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.fullname}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                fullname: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="p-2 border rounded">
                            {student.fullname}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Admission Number</Label>
                        <p className="p-2 border rounded">
                          {student.admission_no || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Contact Number</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.contact_number}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                contact_number: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="p-2 border rounded">
                            {student.contact_number}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <p className="p-2 border rounded">
                          {formatDate(student.date_of_birth)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label>Address</Label>
                      {isEditing ? (
                        <Textarea
                          value={editForm.address}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              address: e.target.value,
                            })
                          }
                          rows={3}
                        />
                      ) : (
                        <p className="p-2 border rounded min-h-[80px]">
                          {student.address}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>NIC Number</Label>
                        <p className="p-2 border rounded">
                          {student.nic_no || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label>Registered Date</Label>
                        <p className="p-2 border rounded">
                          {formatDate(
                            student.registration_date || student.created_at,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Guardian Info */}
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Guardian Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Guardian Name</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.guardian_name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              guardian_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="p-2 border rounded">
                          {student.guardian_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Guardian Contact</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.guardian_contact}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              guardian_contact: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="p-2 border rounded">
                          {student.guardian_contact}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Guardian Email</Label>
                      {isEditing ? (
                        <Input
                          type="email"
                          value={editForm.guardian_email}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              guardian_email: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="p-2 border rounded">
                          {student.guardian_email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL - Tabs */}
            <div className="flex-1 flex flex-col">
              <Tabs defaultValue="enrollments" className="flex-1 flex flex-col">
                <div className="border-b px-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="enrollments">
                      <GraduationCap className="h-4 w-4 mr-1" />
                      Classes ({enrollments.length})
                    </TabsTrigger>
                    <TabsTrigger value="payments">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Payments
                    </TabsTrigger>
                    <TabsTrigger value="attendance">
                      <UserCheck className="h-4 w-4 mr-1" />
                      Attendance
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Enrollments Tab */}
                <TabsContent
                  value="enrollments"
                  className="flex-1 overflow-auto p-6"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Class Enrollments</h3>
                      <EnrollStudentDialog
                        student={student}
                        onEnrolled={loadStudentData}
                        trigger={
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Enroll in Class
                          </Button>
                        }
                      />
                    </div>

                    {enrollments.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">
                            No class enrollments yet
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {enrollments.map((enrollment) => (
                          <Card key={enrollment.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <h4 className="font-medium">
                                    {enrollment.class?.subject?.name} -{" "}
                                    {enrollment.class?.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Teacher:{" "}
                                    {enrollment.class?.teacher?.full_name}
                                  </p>
                                  <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span>
                                      Enrolled:{" "}
                                      {formatDate(enrollment.created_at)}
                                    </span>
                                    <span>
                                      Fee: LKR{" "}
                                      {(
                                        enrollment.class?.base_monthly_fee || 0
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    enrollment.status === "ENROLLED"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {enrollment.status === "ENROLLED"
                                    ? "Active"
                                    : "Dropped"}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent
                  value="payments"
                  className="flex-1 overflow-auto p-6"
                >
                  <div className="space-y-4">
                    <h3 className="font-semibold">Payment History</h3>

                    {payments.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">
                            No payment records found
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {payments.map((payment, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {formatMonth(payment.month)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      - {payment.class_name}
                                    </span>
                                  </div>
                                  <p className="font-mono text-sm">
                                    LKR {payment.amount.toLocaleString()}
                                  </p>
                                </div>
                                {getPaymentStatusBadge(
                                  payment.payment_status,
                                  payment.paid,
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent
                  value="attendance"
                  className="flex-1 overflow-auto p-6"
                >
                  <div className="space-y-4">
                    <h3 className="font-semibold">Attendance Summary</h3>

                    {attendance.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">
                            No attendance records found
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {attendance.map((record, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium">
                                    {record.class_name}
                                  </h4>
                                  <span className="font-semibold">
                                    {record.percentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <Progress
                                    value={record.percentage}
                                    className="h-2"
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>
                                      {record.attended_sessions} of{" "}
                                      {record.total_sessions} sessions attended
                                    </span>
                                    <span
                                      className={`font-medium ${
                                        record.percentage >= 85
                                          ? "text-green-600"
                                          : record.percentage >= 70
                                            ? "text-yellow-600"
                                            : "text-red-600"
                                      }`}
                                    >
                                      {record.percentage >= 85
                                        ? "Excellent"
                                        : record.percentage >= 70
                                          ? "Good"
                                          : "Needs Improvement"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load student details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
