"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DraftStudent } from "@/lib/data";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Shield,
  MessageSquare,
} from "lucide-react";

interface DraftStudentViewDialogProps {
  student: DraftStudent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DraftStudentViewDialog({
  student,
  open,
  onOpenChange,
}: DraftStudentViewDialogProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-700 border-amber-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-700 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                {student.full_name}
              </DialogTitle>
              <DialogDescription>
                Student registration application details
              </DialogDescription>
            </div>
            {getStatusBadge(student.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Full Name
                </p>
                <p className="font-medium">{student.full_name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Gender
                </p>
                <p>{student.gender === "M" ? "Male" : "Female"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Date of Birth
                </p>
                <p className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDateOnly(student.date_of_birth)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Home Contact
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {student.home_contact}
                </p>
              </div>

              {student.nic_no && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    NIC / Birth Certificate
                  </p>
                  <p className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    {student.nic_no}
                  </p>
                </div>
              )}

              {student.occupation && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Occupation / School
                  </p>
                  <p>{student.occupation}</p>
                </div>
              )}

              <div className="col-span-1 md:col-span-2 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Address
                </p>
                <p className="flex items-start gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  {student.address}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Guardian Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Guardian Name
                </p>
                <p className="font-medium">{student.guardian_name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Guardian Contact
                </p>
                <p className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {student.guardian_contact}
                </p>
              </div>

              <div className="col-span-1 md:col-span-2 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Email Address
                </p>
                <p className="flex items-center gap-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {student.guardian_email}
                </p>
              </div>

              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Communication Preferences
                </p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    {student.guardian_email_consent ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Email Updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {student.guardian_whatsapp_consent ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">WhatsApp Messages</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {student.preferred_class_type && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Preferred Class Type
                  </p>
                  <Badge variant="secondary">
                    {student.preferred_class_type}
                  </Badge>
                </div>
              )}

              {student.additional_notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Additional Notes
                  </p>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {student.additional_notes}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Submission Date
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDate(student.submission_date)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Review Information */}
          {(student.reviewed_at ||
            student.review_notes ||
            student.created_student) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Review Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {student.reviewed_at && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Reviewed Date
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDate(student.reviewed_at)}
                    </p>
                  </div>
                )}

                {student.reviewed_by_user && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Reviewed By
                    </p>
                    <p className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {student.reviewed_by_user.full_name}
                    </p>
                  </div>
                )}

                {student.review_notes && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Review Notes
                    </p>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {student.review_notes}
                      </p>
                    </div>
                  </div>
                )}

                {student.created_student && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Student Account Created
                      </p>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Admission Number:</strong>{" "}
                      {student.created_student.admission_no}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
