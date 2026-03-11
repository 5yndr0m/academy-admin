"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  FileText,
  DollarSign,
  UserCheck,
  MoreHorizontal,
  AlertTriangle,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { studentService, invoiceService } from "@/lib/data";
import { Student } from "@/types";
import { AddStudentDialog } from "./AddStudentDialog";
import { EnhancedStudentSearch } from "./EnhancedStudentSearch";
import { useRouter } from "next/navigation";

export function StudentList() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkInvoiceDialogOpen, setBulkInvoiceDialogOpen] = useState(false);
  const [bulkActionError, setBulkActionError] = useState<string | null>(null);
  const [bulkActionSuccess, setBulkActionSuccess] = useState<string | null>(
    null,
  );
  const [billingMonth, setBillingMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Initialize filtered students when students load
  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);

  // Bulk selection functions
  const isAllSelected =
    filteredStudents.length > 0 && selectedIds.size === filteredStudents.length;
  const isSomeSelected =
    selectedIds.size > 0 && selectedIds.size < filteredStudents.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map((student) => student.id)));
    }
  };

  const handleSelectStudent = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // Bulk actions
  const handleBulkInvoiceGeneration = async () => {
    if (selectedIds.size === 0) return;

    setBulkActionLoading(true);
    setBulkActionError(null);
    setBulkActionSuccess(null);
    setBulkInvoiceDialogOpen(false);

    try {
      // Generate monthly invoices for selected students
      const result = await invoiceService.generateMonthly(billingMonth);

      setBulkActionSuccess(
        `Generated ${result.created} invoice${result.created !== 1 ? "s" : ""}, skipped ${result.skipped}`,
      );

      // Clear selection and reload
      setSelectedIds(new Set());
      await load();

      // Auto-hide success message after 3 seconds
      setTimeout(() => setBulkActionSuccess(null), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate invoices";
      setBulkActionError(errorMessage);
      console.error("Bulk invoice generation failed:", error);

      // Auto-hide error message after 5 seconds
      setTimeout(() => setBulkActionError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkMarkAdmissionPaid = async () => {
    if (selectedIds.size === 0) return;

    setBulkActionLoading(true);
    setBulkActionError(null);
    setBulkActionSuccess(null);

    try {
      // Mark admission fees as paid for selected students
      await Promise.all(
        Array.from(selectedIds).map((studentId) =>
          studentService.updateAdmissionFee(studentId, {
            admission_fee_paid: true,
          }),
        ),
      );

      setBulkActionSuccess(
        `Marked admission fees as paid for ${selectedIds.size} student${selectedIds.size !== 1 ? "s" : ""}`,
      );

      // Reload students and clear selection
      await load();
      setSelectedIds(new Set());

      // Auto-hide success message after 3 seconds
      setTimeout(() => setBulkActionSuccess(null), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update admission fees";
      setBulkActionError(errorMessage);
      console.error("Bulk admission fee update failed:", error);

      // Auto-hide error message after 5 seconds
      setTimeout(() => setBulkActionError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-8">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle>Student Roster</CardTitle>
          <CardDescription>
            {students.length} student{students.length !== 1 ? "s" : ""} enrolled
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Success/Error Messages */}
          {bulkActionSuccess && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <span className="text-sm text-green-700 dark:text-green-300">
                ✓ {bulkActionSuccess}
              </span>
            </div>
          )}
          {bulkActionError && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <span className="text-sm text-red-700 dark:text-red-300">
                ⚠ {bulkActionError}
              </span>
            </div>
          )}

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedIds.size} selected
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={bulkActionLoading}
                    className="h-7 text-xs"
                  >
                    {bulkActionLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Actions"
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setBulkInvoiceDialogOpen(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Invoices
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBulkMarkAdmissionPaid}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Mark Admission Paid
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="h-7 text-xs px-2"
              >
                Clear
              </Button>
            </div>
          )}
          <div className="flex-1">
            <EnhancedStudentSearch
              students={students}
              onFilteredResults={setFilteredStudents}
              searchValue={search}
              onSearchChange={setSearch}
            />
          </div>
          <AddStudentDialog onAdded={load} />
        </div>
      </CardHeader>

      <CardContent>
        {filteredStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {search || filteredStudents.length !== students.length
              ? "No students match your filters."
              : "No students enrolled yet."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected || isSomeSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all students"
                  />
                </TableHead>
                <TableHead>Adm. No</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Admission Fee</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow
                  key={student.id}
                  className={
                    selectedIds.has(student.id)
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : ""
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(student.id)}
                      onCheckedChange={(checked) =>
                        handleSelectStudent(student.id, checked as boolean)
                      }
                      aria-label={`Select ${student.fullname}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {student.admission_no || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">
                      {student.fullname}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {student.contact_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{student.guardian_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.guardian_contact}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        student.admission_fee_paid
                          ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700 text-[10px]"
                          : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700 text-[10px]"
                      }
                    >
                      {student.admission_fee_paid ? "Paid" : "Unpaid"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {student.registration_date
                      ? new Date(student.registration_date).toLocaleDateString()
                      : new Date(student.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/students/${student.id}`)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Bulk Invoice Generation Dialog */}
      <Dialog
        open={bulkInvoiceDialogOpen}
        onOpenChange={setBulkInvoiceDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Bulk Invoices
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Billing Month</label>
                <Input
                  type="month"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Generate monthly fee invoices for {selectedIds.size} selected
                  student{selectedIds.size !== 1 ? "s" : ""}.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ℹ️ This will create invoices for all active enrollments of the
                  selected students for the specified month.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkInvoiceDialogOpen(false)}
              disabled={bulkActionLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkInvoiceGeneration}
              disabled={bulkActionLoading}
            >
              {bulkActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Invoices
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
