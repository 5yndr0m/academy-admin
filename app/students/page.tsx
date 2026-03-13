"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentList } from "@/components/students/StudentList";
import { DraftStudentsTable } from "@/components/students/draft/DraftStudentsTable";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserPlus } from "lucide-react";

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <p className="text-muted-foreground">
          Manage student enrollment, registrations, and fee payments.
        </p>
      </div>

      <Tabs defaultValue="enrolled" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-96">
          <TabsTrigger value="enrolled" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Enrolled Students
          </TabsTrigger>
          <TabsTrigger value="draft" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Draft Registrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-6">
          <StudentList />
        </TabsContent>

        <TabsContent value="draft" className="space-y-6">
          <DraftStudentsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
