"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  Receipt,
  FileText,
} from "lucide-react";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studentFeePaymentService } from "@/lib/data";
import { cn } from "@/lib/utils";

interface StudentFeeHistoryProps {
  studentId: string;
  onUpdate?: () => void;
}

interface FeePayment {
  id: string;
  student_id: string;
  class_id: string;
  amount: number;
  payment_month: string;
  paid_at: string | null;
  payment_status: string;
  collected_by: string | null;
  created_by: string;
  payment_method: string;
  notes: string;
  created_at: string;
  student?: {
    id: string;
    admission_no: string;
    fullname: string;
    contact_number: string;
  };
  class?: {
    id: string;
    name: string;
    base_monthly_fee: number;
    teacher_name?: string;
  };
  collected_by_user?: {
    id: string;
    name: string;
    username: string;
  };
}

interface MissedMonth {
  month: string;
  expected_amount: number;
  class_name: string;
  class_id: string;
}

interface FeeHistoryData {
  student_id: string;
  student_name: string;
  admission_no: string;
  total_paid: number;
  total_outstanding: number;
  payments: FeePayment[];
  missed_months: MissedMonth[];
}

const fmt = (n: number) => `LKR ${Number(n ?? 0).toLocaleString()}`;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMonth = (monthString: string) => {
  const [year, month] = monthString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "PAID":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    case "PARTIAL":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
          <Clock className="h-3 w-3 mr-1" />
          Partial
        </Badge>
      );
    case "WAIVED":
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
          <FileText className="h-3 w-3 mr-1" />
          Waived
        </Badge>
      );
    default:
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Unpaid
        </Badge>
      );
  }
};

export function StudentFeeHistory({
  studentId,
  onUpdate,
}: StudentFeeHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FeeHistoryData | null>(null);

  const loadFeeHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response =
        await studentFeePaymentService.getStudentFeeHistory(studentId);
      setData(response);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load fee history",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeHistory();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading fee history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={loadFeeHistory}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Receipt className="h-8 w-8 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No fee data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Paid
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {fmt(data.total_paid)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Outstanding
                </p>
                <p
                  className={`text-2xl font-bold ${
                    data.total_outstanding > 0
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-green-700 dark:text-green-400"
                  }`}
                >
                  {fmt(data.total_outstanding)}
                </p>
              </div>
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  data.total_outstanding > 0
                    ? "bg-amber-100 dark:bg-amber-900/20"
                    : "bg-green-100 dark:bg-green-900/20"
                }`}
              >
                {data.total_outstanding > 0 ? (
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Missed Months
                </p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {data.missed_months.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Tabs */}
      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payments">
            Payment History ({data.payments.length})
          </TabsTrigger>
          <TabsTrigger value="missed">
            Missed Payments ({data.missed_months.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Payment Records</h3>
            <AddPaymentDialog
              studentId={studentId}
              onPaymentAdded={loadFeeHistory}
            />
          </div>

          {data.payments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No payments recorded yet
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Collected By</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.payments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {formatMonth(payment.payment_month)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {payment.class?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.class?.teacher_name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {fmt(payment.amount)}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(payment.payment_status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.paid_at ? formatDate(payment.paid_at) : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.collected_by_user?.name || "—"}
                        </TableCell>
                        <TableCell>
                          {payment.payment_method && (
                            <Badge variant="outline" className="text-xs">
                              {payment.payment_method}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="missed" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Missed Payments</h3>
            {data.missed_months.length > 0 && (
              <AddPaymentDialog
                studentId={studentId}
                defaultMonth={data.missed_months[0]?.month}
                defaultClassId={data.missed_months[0]?.class_id}
                defaultAmount={data.missed_months[0]?.expected_amount}
                onPaymentAdded={loadFeeHistory}
                trigger={
                  <Button size="sm" variant="destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Record First Missing
                  </Button>
                }
              />
            )}
          </div>

          {data.missed_months.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-green-700 dark:text-green-400 font-medium">
                    All payments are up to date!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    No missed payments found
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Expected Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.missed_months.map((missed, index) => (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            {formatMonth(missed.month)}
                          </div>
                        </TableCell>
                        <TableCell>{missed.class_name}</TableCell>
                        <TableCell className="font-mono font-medium">
                          {fmt(missed.expected_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <AddPaymentDialog
                            studentId={studentId}
                            defaultMonth={missed.month}
                            defaultClassId={missed.class_id}
                            defaultAmount={missed.expected_amount}
                            onPaymentAdded={loadFeeHistory}
                            trigger={
                              <Button size="sm" variant="outline">
                                Record Payment
                              </Button>
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
