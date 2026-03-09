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
import { Plus, Loader2 } from "lucide-react";

export function AddStudentDialog({ onAdded }: { onAdded?: () => void }) {
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

      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Enroll New Student</DialogTitle>
            <DialogDescription>
              Fill in student and guardian details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              Student Information
            </p>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Admission No</Label>
              <Input
                value={admissionNo}
                onChange={(e) => setAdmissionNo(e.target.value)}
                className="col-span-3"
                placeholder="e.g. 10001"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">NIC / Birth Cert</Label>
              <Input
                value={nicNo}
                onChange={(e) => setNicNo(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Gender</Label>
              <div className="col-span-3">
                <Select
                  value={gender}
                  onValueChange={(v) => setGender(v as "M" | "F")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Date of Birth</Label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Address</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Contact</Label>
              <Input
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="col-span-3"
                placeholder="07XXXXXXXX"
                required
              />
            </div>

            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mt-2">
              Guardian Information
            </p>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Contact</Label>
              <Input
                value={guardianContact}
                onChange={(e) => setGuardianContact(e.target.value)}
                className="col-span-3"
                placeholder="07XXXXXXXX"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email</Label>
              <Input
                type="email"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                className="col-span-3"
                placeholder="guardian@email.com"
              />
            </div>

            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mt-2">
              Admission Details
            </p>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Reg. Date</Label>
              <Input
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Admission Fee</Label>
              <div className="col-span-3 flex items-center gap-2">
                <Switch
                  checked={admissionFeePaid}
                  onCheckedChange={setAdmissionFeePaid}
                />
                <span className="text-sm text-muted-foreground">
                  {admissionFeePaid ? "Paid" : "Not paid yet"}
                </span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                "Enroll Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
