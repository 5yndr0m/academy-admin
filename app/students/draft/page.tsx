"use client";

import { DraftStudentsTable } from "@/components/students/draft/DraftStudentsTable";

export default function DraftStudentsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Draft Student Registrations</h1>
          <p className="text-muted-foreground">
            Manage student registration applications from the public form
          </p>
        </div>
      </div>

      <DraftStudentsTable />
    </div>
  );
}
