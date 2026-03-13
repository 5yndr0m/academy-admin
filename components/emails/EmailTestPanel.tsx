"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { emailService } from "@/lib/data";
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  TestTube,
  Zap,
} from "lucide-react";

export function EmailTestPanel() {
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp?: string;
  } | null>(null);

  const [stats, setStats] = useState<{
    total_emails: number;
    sent_emails: number;
    failed_emails: number;
    pending_emails: number;
    success_rate: number;
  } | null>(null);

  const [customTest, setCustomTest] = useState({
    recipient: "sdilanjana18@gmail.com",
    subject: "Custom Test Email - Resend v3",
    message: "This is a custom test message to verify email functionality.",
  });

  const handleTestService = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await emailService.testService();
      setTestResult({
        success: true,
        message: response.message,
        timestamp: new Date().toLocaleString(),
      });

      toast({
        title: "Email Test Successful",
        description: "Resend v3 service is working correctly!",
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || "Email test failed",
        timestamp: new Date().toLocaleString(),
      });

      toast({
        title: "Email Test Failed",
        description: "Check your Resend API configuration",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleGetStats = async () => {
    try {
      const response = await emailService.getStats();
      setStats(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch email statistics",
        variant: "destructive",
      });
    }
  };

  const handleCustomTest = async () => {
    try {
      await emailService.sendCustomEmail({
        recipients: [customTest.recipient],
        subject: customTest.subject,
        body: customTest.message,
        is_html: false,
      });

      toast({
        title: "Custom Email Sent",
        description: `Test email sent to ${customTest.recipient}`,
      });
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "Custom test email failed",
        variant: "destructive",
      });
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return "text-green-600";
    if (rate >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 95) return "default";
    if (rate >= 80) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Email Service Test Panel</h2>
        <Badge variant="outline" className="ml-auto">
          <Zap className="h-3 w-3 mr-1" />
          Resend v3
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Service Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Service Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test the email service configuration with a simple test email.
            </p>

            <Button
              onClick={handleTestService}
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Test Email Service
                </>
              )}
            </Button>

            {testResult && (
              <div
                className={`p-3 rounded-lg border ${
                  testResult.success
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {testResult.success ? "Success" : "Failed"}
                </div>
                <p className="text-sm mt-1">{testResult.message}</p>
                {testResult.timestamp && (
                  <p className="text-xs mt-1 opacity-70">
                    {testResult.timestamp}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Email Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGetStats}
              variant="outline"
              className="w-full"
            >
              Refresh Stats
            </Button>

            {stats && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.total_emails}
                    </div>
                    <div className="text-xs text-blue-600">Total Emails</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.sent_emails}
                    </div>
                    <div className="text-xs text-green-600">Sent</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.pending_emails}
                    </div>
                    <div className="text-xs text-yellow-600">Pending</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.failed_emails}
                    </div>
                    <div className="text-xs text-red-600">Failed</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-600">Success Rate:</span>
                    <Badge variant={getSuccessRateBadge(stats.success_rate)}>
                      {stats.success_rate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Custom Email Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Custom Email Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="recipient">Recipient Email</Label>
              <Input
                id="recipient"
                type="email"
                value={customTest.recipient}
                onChange={(e) =>
                  setCustomTest({ ...customTest, recipient: e.target.value })
                }
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={customTest.subject}
                onChange={(e) =>
                  setCustomTest({ ...customTest, subject: e.target.value })
                }
                placeholder="Email subject"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={customTest.message}
              onChange={(e) =>
                setCustomTest({ ...customTest, message: e.target.value })
              }
              rows={4}
              placeholder="Your test message here..."
            />
          </div>

          <Button onClick={handleCustomTest} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send Custom Test Email
          </Button>
        </CardContent>
      </Card>

      {/* Resend v3 Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Resend v3 Features Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Core Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HTML & Plain Text Support</li>
                <li>• File Attachments (PDF, Images)</li>
                <li>• Bulk Email Sending</li>
                <li>• Email Templates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Enhanced Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Delivery Tracking</li>
                <li>• Better Error Handling</li>
                <li>• Improved Rate Limiting</li>
                <li>• Advanced Analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
