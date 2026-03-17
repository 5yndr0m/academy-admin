"use client";

import { useState, useEffect, Suspense } from "react";
import { ShieldAlert, Send, History, Users, Mail, MessageSquare, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import Link from "next/link";
import { BulkSendPanel } from "@/components/communications/BulkSendPanel";
import { EmailLogsTable } from "@/components/communications/EmailLogsTable";
import { ConsentManagement } from "@/components/communications/ConsentManagement";
import { emailService } from "@/lib/data";
import type { EmailServiceStats } from "@/lib/data";

function StatsRow() {
  const [stats, setStats] = useState<EmailServiceStats | null>(null);

  useEffect(() => {
    emailService.getStats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Sent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-2xl font-bold">{stats.total_emails}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delivered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-2xl font-bold text-green-600">{stats.sent_emails}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Failed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-2xl font-bold text-red-500">{stats.failed_emails}</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">{stats.success_rate.toFixed(1)}%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CommunicationsContent() {
  const { role } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
          <p className="text-muted-foreground">Guardian notification and email management.</p>
        </div>
      </div>
    );
  }

  if (role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive animate-pulse" />
        <h1 className="text-2xl font-bold font-mono">ACCESS_DENIED</h1>
        <p className="text-muted-foreground max-w-xs">
          You do not have administrative privileges to access the communications module.
        </p>
        <Link href="/" className="text-primary hover:underline text-sm font-medium">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communications</h2>
          <p className="text-muted-foreground">
            Send emails to guardians, manage consent, and track delivery.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Mail className="h-3 w-3" /> Email via Resend
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-3 w-3" /> WhatsApp (soon)
          </Badge>
        </div>
      </div>

      <StatsRow />

      <Tabs defaultValue="compose" className="space-y-4">
        <div className="w-full overflow-x-auto pb-1">
          <TabsList className="bg-muted/60 p-1 inline-flex w-full justify-start md:w-fit">
            <TabsTrigger value="compose" className="flex items-center gap-2 whitespace-nowrap">
              <Send className="h-4 w-4" /> Compose & Send
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2 whitespace-nowrap">
              <History className="h-4 w-4" /> Email Logs
            </TabsTrigger>
            <TabsTrigger value="consent" className="flex items-center gap-2 whitespace-nowrap">
              <Users className="h-4 w-4" /> Consent Management
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="compose">
          <BulkSendPanel />
        </TabsContent>

        <TabsContent value="logs">
          <EmailLogsTable />
        </TabsContent>

        <TabsContent value="consent">
          <ConsentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function CommunicationsPage() {
  return (
    <Suspense fallback={<div>Loading communications...</div>}>
      <CommunicationsContent />
    </Suspense>
  );
}
