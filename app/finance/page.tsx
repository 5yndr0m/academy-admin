"use client";

import { useState, useEffect, Suspense } from "react";
import {
  ShieldAlert,
  Banknote,
  Users,
  Wallet,
  BarChart,
  ArrowLeft,
  User,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StaffPayoutsTable } from "@/components/finance/StaffPayoutsTable";
import { TeacherPayoutTable } from "@/components/finance/TeacherPayoutTable";
import { StudentInvoiceTable } from "@/components/finance/StudentInvoiceTable";
import { MonthlyReportView } from "@/components/finance/MonthlyReportView";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function FinanceContent() {
  const { role } = useAuth();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  // Get tab from URL parameters, default to 'staff'
  const defaultTab = searchParams.get("tab") || "staff";
  const studentId = searchParams.get("student_id");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Before mount, render the authorised shell so server & client HTML match
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Hub</h2>
          <p className="text-muted-foreground">
            Staff payouts, teacher payouts, student invoices, and monthly
            revenue reports.
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
              Financial Hub
              {studentId && (
                <span className="text-xl font-normal text-muted-foreground ml-3">
                  Student View
                </span>
              )}
            </h2>
            <p className="text-muted-foreground">
              {studentId
                ? "Invoice and payment management for selected student"
                : "Staff payouts, teacher payouts, student invoices, and monthly revenue reports"}
            </p>
          </div>
        </div>
        {studentId && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950/30 dark:border-blue-800">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Viewing invoices for Student ID: {studentId.slice(0, 8)}...
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 ml-2 text-blue-600 dark:text-blue-400"
                onClick={() =>
                  window.history.replaceState({}, "", "/finance?tab=invoices")
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
              value="staff"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Users className="h-4 w-4" /> Staff Payouts
            </TabsTrigger>
            <TabsTrigger
              value="payouts"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Wallet className="h-4 w-4" /> Teacher Payouts
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Banknote className="h-4 w-4" /> Student Invoices
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <BarChart className="h-4 w-4" /> Monthly Report
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="staff">
          <StaffPayoutsTable />
        </TabsContent>
        <TabsContent value="payouts">
          <TeacherPayoutTable />
        </TabsContent>
        <TabsContent value="invoices">
          <StudentInvoiceTable />
        </TabsContent>
        <TabsContent value="reports">
          <MonthlyReportView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FinanceContent />
    </Suspense>
  );
}
