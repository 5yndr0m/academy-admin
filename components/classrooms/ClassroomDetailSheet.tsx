"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { classroomService } from "@/lib/data";
import type { Classroom, ClassroomUtility, ClassroomMaintenanceRecord } from "@/types";
import { OverviewTab } from "./tabs/OverviewTab";
import { UtilitiesTab } from "./tabs/UtilitiesTab";
import { MaintenanceTab } from "./tabs/MaintenanceTab";
import { UsageHistoryTab } from "./tabs/UsageHistoryTab";

interface ClassroomDetailSheetProps {
  classroom: Classroom | null;
  isOccupied: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClassroomUpdated: () => void;
}

export function ClassroomDetailSheet({
  classroom,
  isOccupied,
  open,
  onOpenChange,
  onClassroomUpdated,
}: ClassroomDetailSheetProps) {
  const [utilities, setUtilities] = useState<ClassroomUtility[]>([]);
  const [maintenance, setMaintenance] = useState<ClassroomMaintenanceRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [togglingUsable, setTogglingUsable] = useState(false);

  const loadExtras = useCallback(async () => {
    if (!classroom) return;
    setLoadingData(true);
    try {
      const [utils, maint] = await Promise.all([
        classroomService.getUtilities(classroom.id),
        classroomService.getMaintenance(classroom.id),
      ]);
      setUtilities(utils);
      setMaintenance(maint);
    } catch {
      // silent — tabs show empty states
    } finally {
      setLoadingData(false);
    }
  }, [classroom]);

  useEffect(() => {
    if (open && classroom) loadExtras();
  }, [open, classroom, loadExtras]);

  const handleToggleUsable = async () => {
    if (!classroom) return;
    setTogglingUsable(true);
    try {
      await classroomService.toggleUsability(classroom.id);
      onClassroomUpdated();
    } finally {
      setTogglingUsable(false);
    }
  };

  if (!classroom) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="pb-3">
          <SheetTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{classroom.name}</span>
              <Badge className={classroom.is_usable
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px]"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px]"}>
                {classroom.is_usable ? "Usable" : "Unusable"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {togglingUsable && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
              <Switch
                checked={classroom.is_usable}
                onCheckedChange={handleToggleUsable}
                disabled={togglingUsable}
                title={classroom.is_usable ? "Mark unusable" : "Mark usable"}
              />
            </div>
          </SheetTitle>
        </SheetHeader>

        {loadingData ? (
          <div className="flex justify-center pt-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="mt-1">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview"   className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="utilities"  className="text-xs">Utilities</TabsTrigger>
              <TabsTrigger value="maintenance" className="text-xs">Maint.</TabsTrigger>
              <TabsTrigger value="history"    className="text-xs">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab
                classroom={classroom}
                isOccupied={isOccupied}
                utilities={utilities}
                maintenance={maintenance}
              />
            </TabsContent>

            <TabsContent value="utilities">
              <UtilitiesTab
                classroomId={classroom.id}
                utilities={utilities}
                onChanged={loadExtras}
              />
            </TabsContent>

            <TabsContent value="maintenance">
              <MaintenanceTab
                classroomId={classroom.id}
                records={maintenance}
                onChanged={loadExtras}
              />
            </TabsContent>

            <TabsContent value="history">
              <UsageHistoryTab classroomId={classroom.id} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
