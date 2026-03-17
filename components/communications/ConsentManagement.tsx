"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, Mail, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { emailService, classService } from "@/lib/data";
import type { GuardianCommunicationResponse } from "@/lib/data";
import type { Class } from "@/types";
import { format } from "date-fns";

export function ConsentManagement() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [guardians, setGuardians] = useState<GuardianCommunicationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    classService.getAll().then(setClasses).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await emailService.getGuardians({
        class_id: selectedClass !== "all" ? selectedClass : undefined,
        search: search || undefined,
      });
      setGuardians(res);
    } catch {
      toast({ title: "Error", description: "Failed to load guardians", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [selectedClass, search, toast]);

  useEffect(() => { load(); }, [load]);

  const updateConsent = async (
    studentId: string,
    field: "email_consent" | "whatsapp_consent",
    value: boolean,
  ) => {
    setUpdating(studentId + field);
    try {
      await emailService.updateCommunicationPreferences(studentId, { [field]: value });
      setGuardians((prev) =>
        prev.map((g) =>
          g.student_id === studentId ? { ...g, [field]: value } : g
        )
      );
    } catch {
      toast({ title: "Error", description: "Failed to update consent", variant: "destructive" });
    } finally {
      setUpdating(null);
    }
  };

  const emailConsentCount = guardians.filter((g) => g.email_consent).length;
  const whatsappConsentCount = guardians.filter((g) => g.whatsapp_consent).length;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <Label>Filter by class</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Search</Label>
          <Input
            placeholder="Student or guardian name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-52"
          />
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {/* Summary */}
      {!loading && guardians.length > 0 && (
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{guardians.length} guardians</span>
          <span className="flex items-center gap-1 text-green-600">
            <Mail className="h-3.5 w-3.5" /> {emailConsentCount} email consent
          </span>
          <span className="flex items-center gap-1 text-green-600">
            <MessageSquare className="h-3.5 w-3.5" /> {whatsappConsentCount} WhatsApp consent
          </span>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center">Email consent</TableHead>
                  <TableHead className="text-center">WhatsApp consent</TableHead>
                  <TableHead>Last emailed</TableHead>
                  <TableHead className="text-right">Total sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && guardians.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      No guardians found
                    </TableCell>
                  </TableRow>
                )}
                {!loading && guardians.map((g) => (
                  <TableRow key={g.student_id}>
                    <TableCell className="font-medium text-sm">{g.student_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{g.guardian_name}</TableCell>
                    <TableCell className="text-sm">
                      <div>{g.guardian_email || <span className="text-muted-foreground">No email</span>}</div>
                      <div className="text-xs text-muted-foreground">{g.guardian_contact}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Switch
                          checked={g.email_consent}
                          disabled={updating === g.student_id + "email_consent" || !g.guardian_email}
                          onCheckedChange={(v) => updateConsent(g.student_id, "email_consent", v)}
                        />
                        {!g.guardian_email && (
                          <Badge variant="outline" className="text-xs text-muted-foreground">No email</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Switch
                          checked={g.whatsapp_consent}
                          disabled={updating === g.student_id + "whatsapp_consent"}
                          onCheckedChange={(v) => updateConsent(g.student_id, "whatsapp_consent", v)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {g.last_email_sent ? format(new Date(g.last_email_sent), "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">{g.total_emails_sent}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
