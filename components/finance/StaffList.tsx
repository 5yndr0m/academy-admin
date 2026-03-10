"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userService } from "@/lib/data";
import { User } from "@/types";
import { Plus, Loader2, ShieldCheck, Phone, UserCog, Mail } from "lucide-react";

function AddStaffDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    contact_number: "",
    role: "STAFF" as "ADMIN" | "STAFF",
    commission_percentage: "",
  });

  const reset = () => {
    setForm({
      username: "",
      password: "",
      name: "",
      email: "",
      contact_number: "",
      role: "STAFF",
      commission_percentage: "",
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await userService.register({
        username: form.username,
        password: form.password,
        name: form.name,
        email: form.email,
        contact_number: form.contact_number,
        role: form.role,
        commission_percentage: form.commission_percentage
          ? Number(form.commission_percentage)
          : undefined,
      });
      setOpen(false);
      reset();
      onAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create user");
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
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Create a new staff or admin account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Username</Label>
                <Input
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                  placeholder="john_doe"
                />
              </div>
              <div className="grid gap-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="John Doe"
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="john@academy.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Contact</Label>
                <Input
                  value={form.contact_number}
                  onChange={(e) =>
                    setForm({ ...form, contact_number: e.target.value })
                  }
                  required
                  placeholder="07XXXXXXXX"
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm({ ...form, role: v as "ADMIN" | "STAFF" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>
                Commission %{" "}
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.commission_percentage}
                onChange={(e) =>
                  setForm({ ...form, commission_percentage: e.target.value })
                }
                placeholder="e.g. 5"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function StaffList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch {
      setError("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    // Optimistic update — flip whichever field the backend populates
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        return {
          ...u,
          status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        };
      }),
    );
    try {
      await userService.toggleStatus(id);
      // Re-fetch to sync with server truth
      const fresh = await userService.getAll();
      setUsers(fresh);
    } catch {
      // Revert on failure
      await load();
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Staff Commission Management</CardTitle>
          <CardDescription>
            View and manage staff commission rates for financial calculations.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Financial Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No staff commission data found.
                </TableCell>
              </TableRow>
            ) : (
              users
                .filter(
                  (u) => u.commission_percentage != null || u.role === "STAFF",
                )
                .map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {u.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.role === "ADMIN" ? "default" : "secondary"}
                        className="flex w-fit items-center gap-1"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {u.contact_number}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {u.commission_percentage != null ? (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-300"
                        >
                          {u.commission_percentage}%
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          u.status === "ACTIVE" ? "outline" : "destructive"
                        }
                      >
                        {u.status === "ACTIVE" ? "Earning" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={u.commission_percentage == null}
                        className="text-xs"
                      >
                        View Earnings
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
