"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Share2,
} from "lucide-react";
import { DraftStudentApprovalDialog } from "./DraftStudentApprovalDialog";
import { DraftStudentViewDialog } from "./DraftStudentViewDialog";
import { DraftStudentRejectDialog } from "./DraftStudentRejectDialog";
import { ShareRegistrationDialog } from "./ShareRegistrationDialog";
import {
  DraftStudent,
  DraftStudentListResponse,
  draftStudentService,
} from "@/lib/data";

export function DraftStudentsTable() {
  const { toast } = useToast();
  const [draftStudents, setDraftStudents] = useState<DraftStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  // Dialog states
  const [viewingStudent, setViewingStudent] = useState<DraftStudent | null>(
    null,
  );
  const [approvingStudent, setApprovingStudent] = useState<DraftStudent | null>(
    null,
  );
  const [rejectingStudent, setRejectingStudent] = useState<DraftStudent | null>(
    null,
  );
  const [showShareDialog, setShowShareDialog] = useState(false);

  const loadDraftStudents = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== "all") {
        filters.status = statusFilter;
      }

      const data = await draftStudentService.getAll(filters);
      setDraftStudents(data.draft_students);
      setPendingCount(data.pending_count);
      setApprovedCount(data.approved_count);
      setRejectedCount(data.rejected_count);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load draft students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraftStudents();
  }, [statusFilter]);

  const filteredStudents = draftStudents.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.guardian_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.guardian_email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-700 border-amber-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleApprovalComplete = () => {
    setApprovingStudent(null);
    loadDraftStudents();
  };

  const handleRejectionComplete = () => {
    setRejectingStudent(null);
    loadDraftStudents();
  };

  const exportDraftStudents = () => {
    // Create CSV data
    const headers = [
      "Student Name",
      "Guardian Name",
      "Guardian Email",
      "Contact",
      "Preferred Class",
      "Status",
      "Submission Date",
    ];
    const csvData = [
      headers,
      ...filteredStudents.map((student) => [
        student.full_name,
        student.guardian_name,
        student.guardian_email,
        student.guardian_contact,
        student.preferred_class_type || "-",
        student.status,
        formatDate(student.submission_date),
      ]),
    ];

    const csvContent = csvData
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `draft-students-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Review
                </p>
                <p className="text-2xl font-bold text-amber-700">
                  {pendingCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approved
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {approvedCount}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Rejected
                </p>
                <p className="text-2xl font-bold text-red-700">
                  {rejectedCount}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold">
                  {pendingCount + approvedCount + rejectedCount}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Draft Student Registrations
              </CardTitle>
              <CardDescription>
                Manage student registration applications from the public form
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareDialog(true)}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share Form
              </Button>
              <Button variant="outline" size="sm" onClick={exportDraftStudents}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDraftStudents}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students, guardians, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Preferred Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                        Loading draft students...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {searchTerm || statusFilter !== "all"
                        ? "No students match your filters"
                        : "No draft students found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.full_name}</div>
                          {student.created_student && (
                            <div className="text-sm text-muted-foreground">
                              Student ID: {student.created_student.admission_no}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {student.guardian_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.guardian_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.guardian_contact}</TableCell>
                      <TableCell>
                        {student.preferred_class_type || "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(student.submission_date)}</div>
                          {student.reviewed_at && (
                            <div className="text-muted-foreground">
                              Reviewed: {formatDate(student.reviewed_at)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingStudent(student)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {student.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setApprovingStudent(student)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRejectingStudent(student)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {viewingStudent && (
        <DraftStudentViewDialog
          student={viewingStudent}
          open={!!viewingStudent}
          onOpenChange={() => setViewingStudent(null)}
        />
      )}

      {approvingStudent && (
        <DraftStudentApprovalDialog
          student={approvingStudent}
          open={!!approvingStudent}
          onOpenChange={() => setApprovingStudent(null)}
          onComplete={handleApprovalComplete}
        />
      )}

      {rejectingStudent && (
        <DraftStudentRejectDialog
          student={rejectingStudent}
          open={!!rejectingStudent}
          onOpenChange={() => setRejectingStudent(null)}
          onComplete={handleRejectionComplete}
        />
      )}

      <ShareRegistrationDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </div>
  );
}
