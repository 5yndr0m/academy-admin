"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Send, Mail, MessageSquare, Users, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { emailService, classService } from "@/lib/data";
import type { GuardianCommunicationResponse } from "@/lib/data";
import type { Class } from "@/types";

export function BulkSendPanel() {
  const { toast } = useToast();

  // Target selection
  const [targetMode, setTargetMode] = useState<"class" | "custom">("class");
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [guardians, setGuardians] = useState<GuardianCommunicationResponse[]>([]);
  const [selectedGuardians, setSelectedGuardians] = useState<Set<string>>(new Set());
  const [loadingGuardians, setLoadingGuardians] = useState(false);

  // Custom recipients
  const [customRecipients, setCustomRecipients] = useState("");

  // Compose
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isHtml, setIsHtml] = useState(false);
  const [onlyWithConsent, setOnlyWithConsent] = useState(true);

  // Send state
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  useEffect(() => {
    classService.getAll().then(setClasses).catch(() => {});
  }, []);

  const loadGuardians = useCallback(async () => {
    if (selectedClassIds.length === 0) { setGuardians([]); return; }
    setLoadingGuardians(true);
    try {
      // Fetch guardians for each selected class and merge
      const results = await Promise.all(
        selectedClassIds.map((cid) => emailService.getGuardians({ class_id: cid }))
      );
      // Deduplicate by student_id
      const map = new Map<string, GuardianCommunicationResponse>();
      results.flat().forEach((g) => map.set(g.student_id, g));
      const merged = Array.from(map.values());
      setGuardians(merged);
      // Auto-select those with email consent
      setSelectedGuardians(new Set(merged.filter((g) => g.email_consent).map((g) => g.student_id)));
    } catch {
      toast({ title: "Error", description: "Failed to load guardians", variant: "destructive" });
    } finally {
      setLoadingGuardians(false);
    }
  }, [selectedClassIds, toast]);

  useEffect(() => { loadGuardians(); }, [loadGuardians]);

  const toggleClass = (id: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleGuardian = (studentId: string) => {
    setSelectedGuardians((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId); else next.add(studentId);
      return next;
    });
  };

  const consentCount = guardians.filter((g) => g.email_consent).length;
  const noConsentCount = guardians.length - consentCount;

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Missing fields", description: "Subject and message are required", variant: "destructive" });
      return;
    }

    setSending(true);
    setResult(null);
    try {
      let res;
      if (targetMode === "class") {
        const recipientEmails = guardians
          .filter((g) => selectedGuardians.has(g.student_id) && g.guardian_email)
          .map((g) => g.guardian_email);

        if (recipientEmails.length === 0) {
          toast({ title: "No recipients", description: "No guardians selected with valid emails", variant: "destructive" });
          setSending(false);
          return;
        }
        res = await emailService.sendBulkAnnouncement({
          subject,
          body,
          is_html: isHtml,
          recipients: recipientEmails,
          only_with_email: onlyWithConsent,
        });
      } else {
        const emails = customRecipients
          .split(/[\n,;]/)
          .map((e) => e.trim())
          .filter((e) => e.includes("@"));
        if (emails.length === 0) {
          toast({ title: "No recipients", description: "Enter at least one valid email address", variant: "destructive" });
          setSending(false);
          return;
        }
        res = await emailService.sendBulkAnnouncement({
          subject,
          body,
          is_html: isHtml,
          recipients: emails,
          only_with_email: false,
        });
      }

      setResult({ sent: res.emails_sent, failed: res.emails_failed, total: res.total_recipients });
      toast({
        title: "Emails sent",
        description: `${res.emails_sent} sent, ${res.emails_failed} failed`,
      });
    } catch {
      toast({ title: "Error", description: "Failed to send emails", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={targetMode} onValueChange={(v) => setTargetMode(v as "class" | "custom")}>
        <TabsList>
          <TabsTrigger value="class" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> By Class
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Custom Recipients
          </TabsTrigger>
        </TabsList>

        {/* ── By Class ── */}
        <TabsContent value="class" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {classes.filter((c) => c.status === "ACTIVE").map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => toggleClass(cls.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedClassIds.includes(cls.id)
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Checkbox checked={selectedClassIds.includes(cls.id)} onCheckedChange={() => {}} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{cls.name}</p>
                      {cls.teacher && (
                        <p className="text-xs text-muted-foreground truncate">{cls.teacher.full_name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedClassIds.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Guardians</CardTitle>
                  {loadingGuardians ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-green-600 font-medium">{consentCount} with consent</span>
                      {noConsentCount > 0 && <span className="text-red-500">{noConsentCount} no consent</span>}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Button variant="outline" size="sm" onClick={() =>
                    setSelectedGuardians(new Set(guardians.filter((g) => g.email_consent).map((g) => g.student_id)))
                  }>
                    Select consented
                  </Button>
                  <Button variant="outline" size="sm" onClick={() =>
                    setSelectedGuardians(new Set(guardians.map((g) => g.student_id)))
                  }>
                    Select all
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedGuardians(new Set())}>
                    Clear
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-2">
                  {guardians.map((g) => (
                    <div
                      key={g.student_id}
                      className={`flex items-center gap-3 p-2 rounded-md ${
                        selectedGuardians.has(g.student_id) ? "bg-primary/5" : ""
                      }`}
                    >
                      <Checkbox
                        checked={selectedGuardians.has(g.student_id)}
                        onCheckedChange={() => toggleGuardian(g.student_id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{g.student_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {g.guardian_name} · {g.guardian_email || "No email"}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {g.email_consent ? (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300">Email ✓</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-red-500 border-red-300">No consent</Badge>
                        )}
                        {g.whatsapp_consent && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300">WA ✓</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {guardians.length === 0 && !loadingGuardians && (
                    <p className="text-sm text-muted-foreground text-center py-4">No students found in selected classes</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedGuardians.size} guardian(s) selected for sending
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Custom recipients ── */}
        <TabsContent value="custom" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <Label>Email Addresses</Label>
              <Textarea
                value={customRecipients}
                onChange={(e) => setCustomRecipients(e.target.value)}
                placeholder="Enter email addresses separated by commas, semicolons, or new lines&#10;e.g. parent1@example.com, parent2@example.com"
                rows={5}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customRecipients.split(/[\n,;]/).filter((e) => e.trim().includes("@")).length} valid email(s) entered
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Compose ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Compose Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Class schedule update – March 2026"
            />
          </div>
          <div>
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message here..."
              rows={8}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="html" checked={isHtml} onCheckedChange={setIsHtml} />
              <Label htmlFor="html" className="text-sm font-normal">Send as HTML</Label>
            </div>
            {targetMode === "class" && (
              <div className="flex items-center gap-2">
                <Switch id="consent" checked={onlyWithConsent} onCheckedChange={setOnlyWithConsent} />
                <Label htmlFor="consent" className="text-sm font-normal">Respect email consent</Label>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Send button + result ── */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSend} disabled={sending} className="flex items-center gap-2">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {sending ? "Sending..." : "Send Email"}
        </Button>
        <Button variant="outline" className="flex items-center gap-2" disabled title="WhatsApp sending coming soon">
          <MessageSquare className="h-4 w-4" />
          Send WhatsApp
          <Badge variant="outline" className="text-xs">Soon</Badge>
        </Button>
      </div>

      {result && (
        <Card className="border-none bg-muted/40">
          <CardContent className="pt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>{result.sent} sent</span>
            </div>
            {result.failed > 0 && (
              <div className="flex items-center gap-2 text-red-500">
                <XCircle className="h-4 w-4" />
                <span>{result.failed} failed</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>{result.total} total recipients</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
