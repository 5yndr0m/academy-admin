"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Banknote, Users, Wallet, BarChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StaffList } from "@/components/finance/StaffList";
import { TeacherPayoutTable } from "@/components/finance/TeacherPayoutTable";
import { StudentInvoiceTable } from "@/components/finance/StudentInvoiceTable";
import { MonthlyReportView } from "@/components/finance/MonthlyReportView";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";

export default function FinancePage() {
  const { role } = useAuth();
  const [mounted, setMounted] = useState(false);

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
            Staff, teacher payouts, student invoices, and monthly revenue
            reports.
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
        <h2 className="text-3xl font-bold tracking-tight">Financial Hub</h2>
        <p className="text-muted-foreground">
          Staff, teacher payouts, student invoices, and monthly revenue reports.
        </p>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="bg-muted/60 p-1 inline-flex w-full justify-start md:w-fit">
            <TabsTrigger
              value="staff"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Users className="h-4 w-4" /> Staff
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
          <StaffList />
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
