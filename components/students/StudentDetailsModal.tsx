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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  studentService,
  enrollmentService,
  attendanceService,
} from "@/lib/data";
import { Student, Enrollment, EnrollmentStatus } from "@/types";
import { EnrollStudentDialog } from "./EnrollStudentDialog";
import { StudentPaymentHistory } from "./StudentPaymentHistory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function StudentDetailsModal({
  studentId,
  trigger,
  onUpdate,
}: StudentDetailsModalProps) {
  const [open, setOpen] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [attendance, setAttendance] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullname: "",
    nic_no: "",
    occupation: "",
    home_contact: "",
    address: "",
    guardian_name: "",
    guardian_contact: "",
    guardian_email: "",
    guardian_email_consent: false,
    guardian_whatsapp_consent: false,
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
        nic_no: studentData.student.nic_no || "",
        occupation: studentData.student.occupation || "",
        home_contact: studentData.student.home_contact || "",
        address: studentData.student.address || "",
        guardian_name: studentData.student.guardian_name || "",
        guardian_contact: studentData.student.guardian_contact || "",
        guardian_email: studentData.student.guardian_email || "",
        guardian_email_consent:
          studentData.student.guardian_email_consent || false,
        guardian_whatsapp_consent:
          studentData.student.guardian_whatsapp_consent || false,
      });

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
              const totalSessions = summary.summary?.total || 0;
              const presentCount = summary.summary?.present || 0;
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
        nic_no: editForm.nic_no || null,
        occupation: editForm.occupation || null,
        home_contact: editForm.home_contact,
        address: editForm.address,
        guardian_name: editForm.guardian_name,
        guardian_contact: editForm.guardian_contact,
        guardian_email: editForm.guardian_email,
        guardian_email_consent: editForm.guardian_email_consent,
        guardian_whatsapp_consent: editForm.guardian_whatsapp_consent,
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
        nic_no: student.nic_no || "",
        occupation: student.occupation || "",
        home_contact: student.home_contact || "",
        address: student.address || "",
        guardian_name: student.guardian_name || "",
        guardian_contact: student.guardian_contact || "",
        guardian_email: student.guardian_email || "",
        guardian_email_consent: student.guardian_email_consent || false,
        guardian_whatsapp_consent: student.guardian_whatsapp_consent || false,
      });
    }
  };

  const handleEnrollmentStatusChange = async (
    enrollmentId: string,
    newStatus: string,
  ) => {
    try {
      if (newStatus === "DROPPED") {
        await enrollmentService.drop(enrollmentId);
      } else if (newStatus === "ENROLLED") {
        await enrollmentService.reactivate(enrollmentId);
      }

      // Update local state
      setEnrollments((prev) =>
        prev.map((enr) =>
          enr.id === enrollmentId
            ? { ...enr, status: newStatus as EnrollmentStatus }
            : enr,
        ),
      );

      onUpdate?.();
    } catch (error) {
      console.error("Failed to update enrollment status:", error);
    }
  };

  useEffect(() => {
    if (open) {
      loadStudentData();
    }
  }, [open, loadStudentData]);

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
                        <Label>Home Contact</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.home_contact}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                home_contact: e.target.value,
                              })
                            }
                          />
                        ) : (
                          <p className="p-2 border rounded">
                            {student.home_contact}
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
                        <Label>NIC / Birth Certificate</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.nic_no}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                nic_no: e.target.value,
                              })
                            }
                            placeholder="Optional"
                          />
                        ) : (
                          <p className="p-2 border rounded">
                            {student.nic_no || "Not provided"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Occupation</Label>
                        {isEditing ? (
                          <Input
                            value={editForm.occupation}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                occupation: e.target.value,
                              })
                            }
                            placeholder="Optional"
                          />
                        ) : (
                          <p className="p-2 border rounded">
                            {student.occupation || "Not provided"}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
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

                    {/* Communication Permissions */}
                    <div className="space-y-3 pt-3 border-t border-border/50">
                      <h4 className="font-medium text-sm">
                        Communication Permissions
                      </h4>
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">
                                Email Notifications
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Send updates and announcements via email
                              </p>
                            </div>
                            <Switch
                              checked={editForm.guardian_email_consent}
                              onCheckedChange={(checked) =>
                                setEditForm({
                                  ...editForm,
                                  guardian_email_consent: checked,
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm">
                                WhatsApp Messages
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Send reminders and quick updates via WhatsApp
                              </p>
                            </div>
                            <Switch
                              checked={editForm.guardian_whatsapp_consent}
                              onCheckedChange={(checked) =>
                                setEditForm({
                                  ...editForm,
                                  guardian_whatsapp_consent: checked,
                                })
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Email Notifications</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${student.guardian_email_consent ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                            >
                              {student.guardian_email_consent
                                ? "Allowed"
                                : "Not Allowed"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">WhatsApp Messages</span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${student.guardian_whatsapp_consent ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                            >
                              {student.guardian_whatsapp_consent
                                ? "Allowed"
                                : "Not Allowed"}
                            </span>
                          </div>
                        </div>
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
                                <Select
                                  value={enrollment.status}
                                  onValueChange={(value) =>
                                    handleEnrollmentStatusChange(
                                      enrollment.id,
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ENROLLED">
                                      Active
                                    </SelectItem>
                                    <SelectItem value="DROPPED">
                                      Dropped
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
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
                  <StudentPaymentHistory
                    studentId={studentId}
                    studentName={student.fullname}
                  />
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
                                  <span className="font-semibold text-lg">
                                    {record.percentage.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                                    <div
                                      className={`h-3 rounded-full transition-all ${
                                        record.percentage >= 85
                                          ? "bg-green-500"
                                          : record.percentage >= 70
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                      }`}
                                      style={{
                                        width: `${Math.max(record.percentage, 0)}%`,
                                      }}
                                    />
                                  </div>
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
