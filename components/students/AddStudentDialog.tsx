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

      <DialogContent className="!max-w-4xl  max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              Enroll New Student
            </DialogTitle>
            <DialogDescription className="text-base">
              Complete the enrollment form to add a new student to the academy.
              Please fill in all required fields.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-8 py-6">
            {/* Student Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Student Information
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <IdCard className="h-4 w-4" />
                    Admission Number *
                  </Label>
                  <Input
                    value={admissionNo}
                    onChange={(e) => setAdmissionNo(e.target.value)}
                    placeholder="e.g. 10001"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Student's full name"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <IdCard className="h-4 w-4" />
                    NIC / Birth Certificate *
                  </Label>
                  <Input
                    value={nicNo}
                    onChange={(e) => setNicNo(e.target.value)}
                    placeholder="NIC or Birth Cert No."
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Gender *</Label>
                  <Select
                    value={gender}
                    onValueChange={(v) => setGender(v as "M" | "F")}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Date of Birth *
                  </Label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4" />
                    Contact Number *
                  </Label>
                  <Input
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="0771234567"
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  Address *
                </Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Student's complete home address"
                  required
                  className="h-11"
                />
              </div>
            </div>

            {/* Guardian Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Guardian Information
                </h3>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Guardian Name *
                </Label>
                <Input
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Parent or guardian's full name"
                  required
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Phone className="h-4 w-4" />
                    Guardian Contact *
                  </Label>
                  <Input
                    value={guardianContact}
                    onChange={(e) => setGuardianContact(e.target.value)}
                    placeholder="0771234567"
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="guardian@example.com"
                    required
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Admission Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Admission Details
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Registration Date
                  </Label>
                  <Input
                    type="date"
                    value={registrationDate}
                    onChange={(e) => setRegistrationDate(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <CreditCard className="h-4 w-4" />
                    Admission Fee Status
                  </Label>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border h-11">
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

          <DialogFooter className="gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="h-11 px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 px-8 min-w-36"
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
