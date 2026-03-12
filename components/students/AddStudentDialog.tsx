"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { studentService } from "@/lib/data";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Plus,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Users,
  IdCard,
} from "lucide-react";

export function AddStudentDialog({ onAdded }: { onAdded?: () => void }) {
  const { userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [admissionNo, setAdmissionNo] = useState("");
  const [fullName, setFullName] = useState("");
  const [nicNo, setNicNo] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianEmailConsent, setGuardianEmailConsent] = useState(false);
  const [guardianWhatsAppConsent, setGuardianWhatsAppConsent] = useState(false);
  const [admissionFeePaid, setAdmissionFeePaid] = useState(false);
  const [registrationDate, setRegistrationDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const reset = () => {
    setAdmissionNo("");
    setFullName("");
    setNicNo("");
    setGender("M");
    setDob("");
    setAddress("");
    setContactNumber("");
    setGuardianName("");
    setGuardianContact("");
    setGuardianEmail("");
    setGuardianEmailConsent(false);
    setGuardianWhatsAppConsent(false);
    setAdmissionFeePaid(false);
    setRegistrationDate(new Date().toISOString().split("T")[0]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userId) {
      setError("User authentication error. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      await studentService.create({
        admission_no: admissionNo,
        full_name: fullName,
        nic_no: nicNo,
        gender,
        date_of_birth: dob,
        address,
        contact_number: contactNumber,
        guardian_name: guardianName,
        guardian_contact: guardianContact,
        guardian_email: guardianEmail,
        guardian_email_consent: guardianEmailConsent,
        guardian_whatsapp_consent: guardianWhatsAppConsent,
        admission_fee_paid: admissionFeePaid,
        registration_date: registrationDate,
        authorized_by: userId,
      });
      setOpen(false);
      reset();
      onAdded?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to enroll student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </DialogTrigger>

      <DialogContent className="!max-w-6xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <User className="h-4 w-4 text-primary" />
              Enroll New Student
            </DialogTitle>
            <DialogDescription className="text-sm">
              Fill in all required fields to add a new student.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Student Information Section */}
            <div className="space-y-3">
              <h3 className="text-md font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Student Information
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Admission Number *</Label>
                  <Input
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    placeholder="e.g. 10001"
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Full Name *</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Student's full name"
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">NIC / Birth Certificate *</Label>
                  <Input
                    value={nicNo}
                    onChange={(e) => setNicNo(e.target.value)}
                    placeholder="NIC or Birth Cert No."
                    required
                    className="h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Gender *</Label>
                  <Select
                    value={gender}
                    onValueChange={(v) => setGender(v as "M" | "F")}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Date of Birth *</Label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Contact Number *</Label>
                  <Input
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="0771234567"
                    required
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm">Address *</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Student's complete home address"
                  required
                  className="h-9"
                />
              </div>
            </div>

            {/* Guardian Information Section */}
            <div className="space-y-3">
              <h3 className="text-md font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Guardian Information
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Guardian Name *</Label>
                  <Input
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="Parent or guardian's full name"
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Guardian Contact *</Label>
                  <Input
                    value={guardianContact}
                    onChange={(e) => setGuardianContact(e.target.value)}
                    placeholder="0771234567"
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Email Address *</Label>
                  <Input
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="guardian@example.com"
                    required
                    className="h-9"
                  />
                </div>

                {/* Communication Permissions */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <Label className="text-sm font-medium">
                    Communication Permissions
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">Email Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Send updates and announcements via email
                        </p>
                      </div>
                      <Switch
                        checked={guardianEmailConsent}
                        onCheckedChange={setGuardianEmailConsent}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm">WhatsApp Messages</Label>
                        <p className="text-xs text-muted-foreground">
                          Send reminders and quick updates via WhatsApp
                        </p>
                      </div>
                      <Switch
                        checked={guardianWhatsAppConsent}
                        onCheckedChange={setGuardianWhatsAppConsent}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admission Details Section */}
            <div className="space-y-3">
              <h3 className="text-md font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Admission Details
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm">Registration Date</Label>
                  <Input
                    type="date"
                    value={registrationDate}
                    onChange={(e) => setRegistrationDate(e.target.value)}
                    required
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm">Admission Fee Status</Label>
                  <div className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg border h-9">
                    <Switch
                      checked={admissionFeePaid}
                      onCheckedChange={setAdmissionFeePaid}
                    />
                    <span
                      className={`text-sm font-medium ${
                        admissionFeePaid
                          ? "text-green-700 dark:text-green-400"
                          : "text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {admissionFeePaid ? "✓ Fee Paid" : "Payment Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="h-9 px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-9 px-6 min-w-32"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling Student...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Enroll Student
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
