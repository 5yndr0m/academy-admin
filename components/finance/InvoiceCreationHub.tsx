"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  invoiceService,
  templateService,
  studentService,
  teacherService,
  userService,
} from "@/lib/data";
import { Template, Student, Teacher, User } from "@/types";
import {
  Plus,
  User as UserIcon,
  GraduationCap,
  Users,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  Search,
  Calendar,
  DollarSign,
  Zap,
  Eye,
  CreditCard,
} from "lucide-react";

interface SearchableUser {
  id: string;
  name: string;
  identifier: string;
  type: "student" | "teacher" | "staff";
}

export function InvoiceCreationHub() {
  const [activeCard, setActiveCard] = useState<
    "student" | "teacher" | "staff" | "bulk" | null
  >(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchableUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchableUser | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);

  const [formData, setFormData] = useState({
    amount: "",
    dueDate: "",
    billingMonth: new Date().toISOString().slice(0, 7),
    notes: "",
    paymentStatus: "UNPAID" as "PAID" | "UNPAID",
    paymentMethod: "",
  });

  // Load templates
  useEffect(() => {
    templateService
      .getAll("INVOICE")
      .then(setTemplates)
      .catch(() => setTemplates([]));
  }, []);

  // Search functionality
  const searchUsers = async (query: string, type: "student" | "teacher" | "staff") => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      let results: SearchableUser[] = [];

      if (type === "student") {
        const studentResults = await studentService.search(query);
        results = studentResults.results.map((s: Student) => ({
          id: s.id,
          name: s.fullname,
          identifier: s.admission_no,
          type: "student" as const,
        }));
      } else if (type === "teacher") {
        const teacherResults = await teacherService.search(query);
        results = teacherResults.results.map((t: Teacher) => ({
          id: t.id,
          name: t.full_name,
          identifier: t.employee_id,
          type: "teacher" as const,
        }));
      } else if (type === "staff") {
        const staffResults = await userService.getAll();
        results = staffResults
          .filter((u: User) =>
            u.role === "ADMIN" &&
            (u.name.toLowerCase().includes(query.toLowerCase()) ||
             u.user_name.toLowerCase().includes(query.toLowerCase()))
          )
          .map((u: User) => ({
            id: u.id,
            name: u.name,
            identifier: u.user_name,
            type: "staff" as const,
          }));
      }

      setSearchResults(results.slice(0, 10));
    } catch (error) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!activeCard || activeCard === "bulk") return;

    const timer = setTimeout(() => {
      searchUsers(searchQuery, activeCard);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeCard]);

  // Reset form when changing invoice type
  useEffect(() => {
    setFormData({
      amount: "",
      dueDate: "",
      billingMonth: new Date().toISOString().slice(0, 7),
      notes: "",
      paymentStatus: "UNPAID",
      paymentMethod: "",
    });
    setSelectedUser(null);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedTemplate(null);
    setSuccess(false);
    setCreatedInvoice(null);
  }, [activeCard]);

  const handleCreateInvoice = async () => {
    if (!activeCard || activeCard === "bulk") return;

    setLoading(true);
    try {
      let invoice;

      if (activeCard === "student") {
        invoice = await invoiceService.createAdmissionInvoice({
          student_id: selectedUser!.id,
          amount: parseFloat(formData.amount),
          payment_status: formData.paymentStatus,
          payment_method: formData.paymentMethod || undefined,
          notes: formData.notes || undefined,
          due_date: formData.dueDate,
        });
      } else if (activeCard === "teacher") {
        invoice = await invoiceService.createTeacherPayout({
          teacher_id: selectedUser!.id,
          billing_month: formData.billingMonth,
          total_amount: parseFloat(formData.amount),
          notes: formData.notes || undefined,
        });
      } else if (activeCard === "staff") {
        invoice = await invoiceService.createStaffCommission({
          staff_id: selectedUser!.id,
          billing_month: formData.billingMonth,
          total_amount: parseFloat(formData.amount),
          notes: formData.notes || undefined,
        });
      }

      setCreatedInvoice(invoice);
      setSuccess(true);
    } catch (error) {
      console.error("Failed to create invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async () => {
    setLoading(true);
    try {
      const result = await invoiceService.generateMonthly(formData.billingMonth);
      setCreatedInvoice({ created: result.created, skipped: result.skipped });
      setSuccess(true);
    } catch (error) {
      console.error("Failed to generate bulk invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setActiveCard(null);
    setSuccess(false);
    setCreatedInvoice(null);
  };

  const invoiceTypes = [
    {
      id: "student",
      title: "Student Invoice",
      description: "Create individual student payment invoices",
      icon: GraduationCap,
      color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: "teacher",
      title: "Teacher Payout",
      description: "Generate teacher salary and commission invoices",
      icon: UserIcon,
      color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      id: "staff",
      title: "Staff Commission",
      description: "Create staff commission and bonus invoices",
      icon: Users,
      color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      id: "bulk",
      title: "Bulk Generation",
      description: "Generate monthly invoices for all students",
      icon: Zap,
      color: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Invoice Creation Hub
          </CardTitle>
          <CardDescription>
            Create and manage different types of invoices for your institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {invoiceTypes.map((type) => (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all hover:shadow-md ${type.color}`}
                onClick={() => setActiveCard(type.id)}
              >
                <CardContent className="p-6 text-center">
                  <type.icon className={`h-8 w-8 mx-auto mb-3 ${type.iconColor}`} />
                  <h3 className="font-semibold mb-2">{type.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Creation Dialog */}
      <Dialog open={!!activeCard} onOpenChange={() => setActiveCard(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeCard === "student" && "Create Student Invoice"}
              {activeCard === "teacher" && "Create Teacher Payout"}
              {activeCard === "staff" && "Create Staff Commission"}
              {activeCard === "bulk" && "Generate Bulk Invoices"}
            </DialogTitle>
            <DialogDescription>
              {activeCard === "student" && "Create a payment invoice for a specific student"}
              {activeCard === "teacher" && "Generate a payout invoice for teacher salary/commission"}
              {activeCard === "staff" && "Create a commission invoice for staff member"}
              {activeCard === "bulk" && "Generate monthly invoices for all active students"}
            </DialogDescription>
          </DialogHeader>

          {!success ? (
            <div className="space-y-4">
              {/* User Search for Individual Invoices */}
              {activeCard !== "bulk" && (
                <div className="space-y-3">
                  <Label>
                    Search {activeCard === "student" ? "Student" : activeCard === "teacher" ? "Teacher" : "Staff Member"}
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search by name or ${activeCard === "student" ? "admission number" : "employee ID"}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Search Results */}
                  {searchQuery && searchResults.length > 0 && (
                    <div className="border rounded-md max-h-48 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0"
                          onClick={() => {
                            setSelectedUser(user);
                            setSearchQuery(user.name);
                            setSearchResults([]);
                          }}
                        >
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.identifier}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected User */}
                  {selectedUser && (
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {activeCard === "student" && <GraduationCap className="h-5 w-5 text-primary" />}
                            {activeCard === "teacher" && <UserIcon className="h-5 w-5 text-primary" />}
                            {activeCard === "staff" && <Users className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <h3 className="font-semibold">{selectedUser.name}</h3>
                            <p className="text-sm text-muted-foreground">{selectedUser.identifier}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount (LKR)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                {activeCard === "student" ? (
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Billing Month</Label>
                    <Input
                      type="month"
                      value={formData.billingMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, billingMonth: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {activeCard === "student" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Payment Status</Label>
                    <Select
                      value={formData.paymentStatus}
                      onValueChange={(value: "PAID" | "UNPAID") =>
                        setFormData(prev => ({ ...prev, paymentStatus: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payment Method (if paid)</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="ONLINE">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Additional notes or description..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="mt-1"
                />
              </div>

              {/* Template Selection */}
              {templates.length > 0 && (
                <div className="space-y-3">
                  <Label>Invoice Template (Optional)</Label>
                  <div className="grid gap-2">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id
                            ? "ring-2 ring-primary"
                            : ""
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {template.description}
                              </p>
                            </div>
                            {template.is_default && (
                              <Badge variant="secondary" className="text-xs">Default</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Success State */
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">Invoice Created Successfully!</h3>
                {activeCard === "bulk" ? (
                  <p className="text-muted-foreground">
                    Generated {createdInvoice?.created || 0} invoices,
                    skipped {createdInvoice?.skipped || 0} existing ones
                  </p>
                ) : (
                  <p className="text-muted-foreground">
                    Your invoice has been created and is ready for download
                  </p>
                )}
              </div>

              {activeCard !== "bulk" && createdInvoice && (
                <div className="flex justify-center gap-2">
                  <a
                    href={invoiceService.downloadPDF(createdInvoice.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </a>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {!success ? (
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={() => setActiveCard(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={activeCard === "bulk" ? handleBulkGenerate : handleCreateInvoice}
                  disabled={
                    loading ||
                    (activeCard !== "bulk" && !selectedUser) ||
                    !formData.amount ||
                    (activeCard === "student" && !formData.dueDate)
                  }
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  {activeCard === "bulk" ? "Generate Invoices" : "Create Invoice"}
                </Button>
              </div>
            ) : (
              <Button onClick={resetAndClose}>
                Create Another Invoice
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
