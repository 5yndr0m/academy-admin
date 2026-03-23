"use client";

import type { Teacher } from "@/types";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllocationsTab } from "./tabs/AllocationsTab";
import { CurriculumTab } from "./tabs/CurriculumTab";
import { DailyReportsTab } from "./tabs/DailyReportsTab";
import { ResultsTab } from "./tabs/ResultsTab";
import { Mail, Phone } from "lucide-react";

interface LecturerProfileSheetProps {
  teacher: Teacher | null;
  onClose: () => void;
}

export function LecturerProfileSheet({ teacher, onClose }: LecturerProfileSheetProps) {
  if (!teacher) return null;

  return (
    <Sheet open={!!teacher} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:w-[640px] sm:max-w-[640px] overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-base">{teacher.full_name}</SheetTitle>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {teacher.contact_number}
            </div>
            {teacher.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {teacher.email}
              </div>
            )}
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${
                teacher.status === "ACTIVE"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }`}
            >
              {teacher.status}
            </Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="allocations" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="allocations" className="flex-1 text-xs">Allocations</TabsTrigger>
            <TabsTrigger value="curriculum" className="flex-1 text-xs">Curriculum</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 text-xs">Daily Reports</TabsTrigger>
            <TabsTrigger value="results" className="flex-1 text-xs">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="allocations">
            <AllocationsTab teacherId={teacher.id} />
          </TabsContent>
          <TabsContent value="curriculum">
            <CurriculumTab teacherId={teacher.id} />
          </TabsContent>
          <TabsContent value="reports">
            <DailyReportsTab teacherId={teacher.id} />
          </TabsContent>
          <TabsContent value="results">
            <ResultsTab teacherId={teacher.id} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
