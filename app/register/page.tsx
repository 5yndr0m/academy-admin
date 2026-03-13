"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { draftStudentService } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface SubmissionResponse {
  message: string;
  id: string;
  status: string;
}

function RegistrationFormComponent() {
  const searchParams = useSearchParams();
  const registrationToken = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [nicNo, setNicNo] = useState("");
  const [occupation, setOccupation] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [homeContact, setHomeContact] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianEmailConsent, setGuardianEmailConsent] = useState(false);
  const [guardianWhatsAppConsent, setGuardianWhatsAppConsent] = useState(false);
  const [preferredClassType, setPreferredClassType] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const validateForm = () => {
    if (!fullName.trim()) return "Student name is required";
    if (!gender) return "Gender is required";
    if (!dateOfBirth) return "Date of birth is required";
    if (!address.trim()) return "Address is required";
    if (!homeContact.trim()) return "Home contact is required";
    if (!guardianName.trim()) return "Guardian name is required";
    if (!guardianContact.trim()) return "Guardian contact is required";
    if (!guardianEmail.trim()) return "Guardian email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail)) {
      return "Valid email address is required";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await draftStudentService.submitRegistration({
        full_name: fullName,
        nic_no: nicNo || undefined,
        occupation: occupation || undefined,
        gender,
        date_of_birth: dateOfBirth,
        address,
        home_contact: homeContact,
        guardian_name: guardianName,
        guardian_contact: guardianContact,
        guardian_email: guardianEmail,
        guardian_email_consent: guardianEmailConsent,
        guardian_whatsapp_consent: guardianWhatsAppConsent,
        preferred_class_type: preferredClassType || undefined,
        additional_notes: additionalNotes || undefined,
        registration_token: registrationToken || undefined,
      });

      setSubmissionId(data.id);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to submit registration",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              Registration Submitted Successfully!
            </CardTitle>
            <CardDescription>
              Thank you for your interest in Music Academy
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Reference ID:</strong> {submissionId}
                <br />
                Please save this reference number for your records.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your application has been received and is currently under
                review.
              </p>
              <p className="text-sm text-muted-foreground">
                We will contact you within 2-3 business days with the next
                steps.
              </p>
              {guardianEmailConsent && (
                <p className="text-sm text-muted-foreground">
                  A confirmation email has been sent to{" "}
                  <strong>{guardianEmail}</strong>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <GraduationCap className="h-12 w-12 mx-auto text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Music Academy Student Registration
          </h1>
          <p className="text-gray-600">
            Complete the form below to apply for admission to our music programs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Student Registration Form
            </CardTitle>
            <CardDescription>
              All fields marked with * are required. We respect your privacy and
              will only use your information for academy purposes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter student's full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      value={gender}
                      onValueChange={(value: "M" | "F") => setGender(value)}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nicNo">NIC / Birth Certificate No.</Label>
                    <Input
                      id="nicNo"
                      value={nicNo}
                      onChange={(e) => setNicNo(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation / School</Label>
                    <Input
                      id="occupation"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="Student's occupation or school"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeContact">Home Contact *</Label>
                    <Input
                      id="homeContact"
                      value={homeContact}
                      onChange={(e) => setHomeContact(e.target.value)}
                      placeholder="0771234567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Complete home address"
                    required
                    rows={3}
                  />
                </div>
              </div>

              {/* Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Guardian Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian Name *</Label>
                    <Input
                      id="guardianName"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Parent or guardian's full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guardianContact">Guardian Contact *</Label>
                    <Input
                      id="guardianContact"
                      value={guardianContact}
                      onChange={(e) => setGuardianContact(e.target.value)}
                      placeholder="0771234567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Email Address *</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="guardian@example.com"
                    required
                  />
                </div>

                {/* Communication Preferences */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">Communication Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          Email Updates
                        </Label>
                        <p className="text-sm text-gray-600">
                          Receive important academy updates and announcements
                          via email
                        </p>
                      </div>
                      <Switch
                        checked={guardianEmailConsent}
                        onCheckedChange={setGuardianEmailConsent}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">
                          WhatsApp Messages
                        </Label>
                        <p className="text-sm text-gray-600">
                          Receive quick reminders and updates via WhatsApp
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

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Additional Information
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="preferredClassType">
                    Preferred Class Type
                  </Label>
                  <Select
                    value={preferredClassType}
                    onValueChange={setPreferredClassType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your preferred class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piano">Piano</SelectItem>
                      <SelectItem value="guitar">Guitar</SelectItem>
                      <SelectItem value="violin">Violin</SelectItem>
                      <SelectItem value="vocals">Vocals</SelectItem>
                      <SelectItem value="music-theory">Music Theory</SelectItem>
                      <SelectItem value="drums">Drums</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional information, questions, or special requirements..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Registration...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Submit Registration
                    </>
                  )}
                </Button>

                <p className="text-sm text-gray-500 text-center mt-4">
                  By submitting this form, you agree to our terms and
                  conditions. Your application will be reviewed and we will
                  contact you soon.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Music Academy © 2024 | 123 Music Street, Colombo 03 | +94 11 234
            5678
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PublicRegistrationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationFormComponent />
    </Suspense>
  );
}
