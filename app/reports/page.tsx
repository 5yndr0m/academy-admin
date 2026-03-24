"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, CalendarDays, FileText, GraduationCap, TrendingUp, Users } from "lucide-react";
import { InstituteSummaryTab } from "@/components/reports/InstituteSummaryTab";
import { AttendanceReportTab } from "@/components/reports/AttendanceReportTab";
import { ClassPerformanceTab } from "@/components/reports/ClassPerformanceTab";
import { LecturerSummaryTab } from "@/components/reports/LecturerSummaryTab";
import { StudentProgressTab } from "@/components/reports/StudentProgressTab";
import { MonthlyReportGenerator } from "@/components/finance/MonthlyReportGenerator";

export default function ReportsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Institute-wide reporting across attendance, performance, lecturers, and students.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Class Performance
          </TabsTrigger>
          <TabsTrigger value="lecturers" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Lecturer Summary
          </TabsTrigger>
          <TabsTrigger value="student" className="gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Student Progress
          </TabsTrigger>
          <TabsTrigger value="monthly-report" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Monthly Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <InstituteSummaryTab />
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceReportTab />
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <ClassPerformanceTab />
        </TabsContent>

        <TabsContent value="lecturers" className="mt-6">
          <LecturerSummaryTab />
        </TabsContent>

        <TabsContent value="student" className="mt-6">
          <StudentProgressTab />
        </TabsContent>

        <TabsContent value="monthly-report" className="mt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">Monthly Financial Report</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Generate a formatted financial report from your monthly data and download it as a PDF.
              </p>
            </div>
            <MonthlyReportGenerator />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
