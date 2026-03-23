"use client";

import { useState, useCallback } from "react";
import { ClassroomList } from "@/components/classrooms/ClassroomList";
import { ClassroomDetailSheet } from "@/components/classrooms/ClassroomDetailSheet";
import { classroomService } from "@/lib/data";
import type { Classroom } from "@/types";

export default function ClassroomsPage() {
  const [selected, setSelected] = useState<Classroom | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [availableIds, setAvailableIds] = useState<string[]>([]);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const handleViewDetails = useCallback(async (classroom: Classroom) => {
    setSelected(classroom);
    setSheetOpen(true);
    // Refresh available rooms to know current occupancy
    try {
      const available = await classroomService.getAvailable();
      setAvailableIds(available.map((r) => r.id));
    } catch {
      // ignore — sheet shows occupancy as "unknown"
    }
  }, []);

  const handleClassroomUpdated = useCallback(() => {
    // Bump key to re-mount ClassroomList and reload from API
    setListRefreshKey((k) => k + 1);
    // Refresh available rooms
    classroomService.getAvailable()
      .then((r) => setAvailableIds(r.map((c) => c.id)))
      .catch(() => {});
    // Keep the sheet open but update the selected classroom from list
  }, []);

  const isOccupied = selected ? !availableIds.includes(selected.id) : false;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Classrooms</h2>
        <p className="text-muted-foreground">
          Manage rooms, equipment, maintenance, and usage history.
        </p>
      </div>

      <ClassroomList
        key={listRefreshKey}
        onViewDetails={handleViewDetails}
      />

      <ClassroomDetailSheet
        classroom={selected}
        isOccupied={isOccupied}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onClassroomUpdated={handleClassroomUpdated}
      />
    </div>
  );
}
