"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { draftStudentService } from "@/lib/data";
import {
  Share2,
  Copy,
  Download,
  QrCode,
  Link,
  MessageCircle,
  Mail,
  RefreshCw,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

interface RegistrationFormConfig {
  public_form_url: string;
  qr_code_data: string;
  qr_code_url: string;
  registration_token: string;
  institute_info: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    description?: string;
  };
}

interface ShareRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareRegistrationDialog({
  open,
  onOpenChange,
}: ShareRegistrationDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<RegistrationFormConfig | null>(null);
  const [copying, setCopying] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await draftStudentService.getFormConfig();
      setConfig(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load registration form configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadConfig();
    }
  }, [open]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      setCopying(type);
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setCopying(null), 1000);
    }
  };

  const downloadQRCode = () => {
    if (!config?.qr_code_data) return;

    // Create download link
    const link = document.createElement("a");
    link.href = config.qr_code_data;
    link.download = "student-registration-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded",
      description: "QR code image downloaded successfully",
    });
  };

  const shareViaWhatsApp = () => {
    if (!config?.public_form_url) return;

    const message = encodeURIComponent(
      `🎵 ${config.institute_info.name} - Student Registration\n\n` +
        `Register your child for our music programs:\n${config.public_form_url}\n\n` +
        `For more information, contact us at ${config.institute_info.phone}`,
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const shareViaEmail = () => {
    if (!config?.public_form_url) return;

    const subject = encodeURIComponent(
      `${config.institute_info.name} - Student Registration`,
    );
    const body = encodeURIComponent(
      `Dear Parent/Guardian,\n\n` +
        `We invite you to register your child for our music programs at ${config.institute_info.name}.\n\n` +
        `Please complete the online registration form at:\n${config.public_form_url}\n\n` +
        `If you have any questions, please contact us:\n` +
        `📧 ${config.institute_info.email}\n` +
        `📞 ${config.institute_info.phone}\n` +
        `📍 ${config.institute_info.address}\n\n` +
        `Best regards,\n${config.institute_info.name} Team`,
    );
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  const openFormPreview = () => {
    if (!config?.public_form_url) return;
    window.open(config.public_form_url, "_blank");
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            Share Student Registration Form
          </DialogTitle>
          <DialogDescription>
            Share the public registration form via link, QR code, or social
            media
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading registration form...</span>
          </div>
        ) : config ? (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Link and Share Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Link className="h-4 w-4" />
                    Registration Link
                  </CardTitle>
                  <CardDescription>
                    Direct link to the public registration form
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Public Form URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={config.public_form_url}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            config.public_form_url,
                            "Registration link",
                          )
                        }
                        disabled={copying === "Registration link"}
                      >
                        {copying === "Registration link" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openFormPreview}
                      className="flex-1"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Preview Form
                    </Button>
                  </div>

                  {/* Share Options */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      <span className="font-medium">Share Options</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        variant="outline"
                        onClick={shareViaWhatsApp}
                        className="justify-start"
                      >
                        <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                        Share via WhatsApp
                      </Button>

                      <Button
                        variant="outline"
                        onClick={shareViaEmail}
                        className="justify-start"
                      >
                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                        Share via Email
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            config.public_form_url,
                            "Registration link",
                          )
                        }
                        className="justify-start"
                        disabled={copying === "Registration link"}
                      >
                        {copying === "Registration link" ? (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </CardTitle>
                  <CardDescription>
                    Scannable QR code for easy mobile access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-6 rounded-lg border">
                      <img
                        src={config.qr_code_data}
                        alt="Registration QR Code"
                        className="w-64 h-64"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadQRCode}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(config.qr_code_data, "QR code image")
                      }
                      disabled={copying === "QR code image"}
                    >
                      {copying === "QR code image" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Failed to load registration form configuration
            </p>
            <Button variant="outline" onClick={loadConfig} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-1" />
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
