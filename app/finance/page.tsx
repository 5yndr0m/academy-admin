"use client";

import { useState, useEffect, Suspense } from "react";
import {
  ShieldAlert,
  DollarSign,
  Users,
  Receipt,
  ArrowLeft,
  User,
  GraduationCap,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// Import new financial components
import { StudentPaymentRecordsTable } from "@/components/finance/StudentPaymentRecordsTable";
import { TeacherPayoutRecordsTable } from "@/components/finance/TeacherPayoutRecordsTable";
import { StaffCommissionRecordsTable } from "@/components/finance/StaffCommissionRecordsTable";
import { ExpenseRecordsTable } from "@/components/finance/ExpenseRecordsTable";

function FinanceContent() {
  const { role } = useAuth();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  // Get tab from URL parameters, default to 'payments'
  const defaultTab = searchParams.get("tab") || "payments";
  const studentId = searchParams.get("student_id");

  useEffect(() => {
    // Use a timer to avoid setState in effect warning
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Before mount, render the authorized shell so server & client HTML match
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Financial Management
          </h2>
          <p className="text-muted-foreground">
            Simplified cash-based transaction recording and financial tracking.
          </p>
        </div>
      </div>
    );
  }

  if (role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive animate-pulse" />
        <h1 className="text-2xl font-bold font-mono">ACCESS_DENIED</h1>
        <p className="text-muted-foreground max-w-xs">
          You do not have administrative privileges to access the financial
          module.
        </p>
        <Link
          href="/"
          className="text-primary hover:underline text-sm font-medium"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-4">
          {studentId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Student
            </Button>
          )}
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight">
              Financial Management
              {studentId && (
                <span className="text-xl font-normal text-muted-foreground ml-3">
                  Student View
                </span>
              )}
            </h2>
            <p className="text-muted-foreground">
              {studentId
                ? "Financial records for selected student"
                : "Simplified cash transaction recording and financial tracking"}
            </p>
          </div>
        </div>
        {studentId && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-800">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Viewing financial records for Student ID: {studentId.slice(0, 8)}
              ...
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 ml-2 text-blue-600 dark:text-blue-400"
                onClick={() =>
                  window.history.replaceState({}, "", "/finance?tab=payments")
                }
              >
                Clear filter
              </Button>
            </p>
          </div>
        )}
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="bg-muted/60 p-1 inline-flex w-full justify-start md:w-fit">
            <TabsTrigger
              value="payments"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <DollarSign className="h-4 w-4" /> Student Payments
            </TabsTrigger>
            <TabsTrigger
              value="payouts"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <GraduationCap className="h-4 w-4" /> Teacher Payouts
            </TabsTrigger>
            <TabsTrigger
              value="commissions"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Users className="h-4 w-4" /> Staff Commissions
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Receipt className="h-4 w-4" /> Expenses
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="payments" className="space-y-4">
          <StudentPaymentRecordsTable />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <TeacherPayoutRecordsTable />
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <StaffCommissionRecordsTable />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpenseRecordsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div>Loading financial management...</div>}>
      <FinanceContent />
    </Suspense>
  );
}
