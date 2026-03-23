"use client";

import { useState } from "react";
import type { ClassSession } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimetableGrid } from "@/components/scheduling/TimetableGrid";
import { SessionActionPanel } from "@/components/scheduling/SessionActionPanel";
import { OverrideHistoryTab } from "@/components/scheduling/OverrideHistoryTab";
import { ConflictsTab } from "@/components/scheduling/ConflictsTab";
import { CalendarClock } from "lucide-react";

export default function SchedulingPage() {
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdated = () => {
    setSelectedSession(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <CalendarClock className="h-6 w-6" />
          Scheduling
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage the class timetable, session overrides, and conflict tracking.
        </p>
      </div>

      <Tabs defaultValue="timetable">
        <TabsList>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="overrides">Override History</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        </TabsList>

        <TabsContent value="timetable" className="mt-4">
          <TimetableGrid
            onSessionClick={setSelectedSession}
            refreshKey={refreshKey}
          />
        </TabsContent>

        <TabsContent value="overrides" className="mt-4">
          <OverrideHistoryTab />
        </TabsContent>

        <TabsContent value="conflicts" className="mt-4">
          <ConflictsTab />
        </TabsContent>
      </Tabs>

      <SessionActionPanel
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
