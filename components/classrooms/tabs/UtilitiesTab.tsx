"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { classroomService } from "@/lib/data";
import type { ClassroomUtility } from "@/types";
import { Plus, Trash2, Loader2 } from "lucide-react";

interface UtilitiesTabProps {
  classroomId: string;
  utilities: ClassroomUtility[];
  onChanged: () => void;
}

const UTILITY_TYPES = ["AC", "PROJECTOR", "SMARTBOARD", "WHITEBOARD", "OTHER"] as const;
const UTILITY_LABELS: Record<string, string> = {
  AC: "AC Unit",
  PROJECTOR: "Projector",
  SMARTBOARD: "Smartboard",
  WHITEBOARD: "Whiteboard",
  OTHER: "Other",
};

export function UtilitiesTab({ classroomId, utilities, onChanged }: UtilitiesTabProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<string>("PROJECTOR");
  const [addQty, setAddQty] = useState("1");
  const [addFunctional, setAddFunctional] = useState(true);
  const [addNotes, setAddNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await classroomService.addUtility(classroomId, {
        utility_type: addType,
        quantity: parseInt(addQty) || 1,
        is_functional: addFunctional,
        notes: addNotes,
      });
      setAddOpen(false);
      setAddType("PROJECTOR");
      setAddQty("1");
      setAddFunctional(true);
      setAddNotes("");
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFunctional = async (u: ClassroomUtility) => {
    setTogglingId(u.id);
    try {
      await classroomService.updateUtility(classroomId, u.id, { is_functional: !u.is_functional });
      onChanged();
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await classroomService.deleteUtility(classroomId, id);
      onChanged();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{utilities.length} item{utilities.length !== 1 ? "s" : ""} recorded</p>
        <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {utilities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No utilities recorded. Add equipment above.</p>
      ) : (
        <div className="space-y-2">
          {utilities.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{UTILITY_LABELS[u.utility_type] ?? u.utility_type}</span>
                  <span className="text-xs text-muted-foreground">×{u.quantity}</span>
                  <Badge className={u.is_functional
                    ? "text-[9px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "text-[9px] px-1.5 py-0 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}>
                    {u.is_functional ? "Working" : "Broken"}
                  </Badge>
                </div>
                {u.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{u.notes}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {togglingId === u.id
                  ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  : <Switch checked={u.is_functional} onCheckedChange={() => handleToggleFunctional(u)} title="Toggle functional" />
                }
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(u.id)}
                  disabled={deletingId === u.id}
                >
                  {deletingId === u.id
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Trash2 className="h-3.5 w-3.5" />
                  }
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <form onSubmit={handleAdd}>
            <DialogHeader>
              <DialogTitle>Add Equipment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={addType} onValueChange={setAddType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UTILITY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{UTILITY_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" min={1} value={addQty} onChange={(e) => setAddQty(e.target.value)} required />
              </div>
              <div className="flex items-center justify-between">
                <Label>Functional</Label>
                <Switch checked={addFunctional} onCheckedChange={setAddFunctional} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input id="notes" value={addNotes} onChange={(e) => setAddNotes(e.target.value)} placeholder="e.g. ceiling-mounted, needs cleaning" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
