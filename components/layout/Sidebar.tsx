"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  LayoutDashboard,
  Presentation,
  Users,
  User,
  CalendarDays,
  Clock,
  Wallet,
  Settings2,
  Mail,
  CalendarClock,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { draftStudentService, conflictService } from "@/lib/data";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: string;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Classrooms", href: "/classrooms", icon: Presentation },
  { name: "Classes", href: "/classes", icon: BookOpen },
  { name: "Teachers", href: "/teachers", icon: User },
  { name: "Students", href: "/students", icon: Users, badgeKey: "drafts" },
  { name: "Sessions", href: "/sessions", icon: Clock },
  { name: "Scheduling", href: "/scheduling", icon: CalendarClock, badgeKey: "conflicts" },
  { name: "Attendance", href: "/attendance", icon: CalendarDays },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Operations", href: "/operations", icon: Settings2, adminOnly: true },
  { name: "Finance", href: "/finance", icon: Wallet, adminOnly: true },
  { name: "Communications", href: "/communications", icon: Mail, adminOnly: true },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [conflictCount, setConflictCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    // Load badge counts
    draftStudentService
      .getAll({ status: "pending" })
      .then((r) => setDraftCount(r.pending_count ?? 0))
      .catch(() => {});
    conflictService
      .getAll({ status: "PENDING" })
      .then((r) => setConflictCount(r.count ?? 0))
      .catch(() => {});
  }, []);

  const badges: Record<string, number> = {
    drafts: draftCount,
    conflicts: conflictCount,
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight">ICBT</h1>
        <p className="text-sm font-medium text-muted-foreground">
          Business and Technology
        </p>
        <p className="text-xs text-muted-foreground mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          if (mounted && item.adminOnly && role !== "ADMIN") return null;

          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          const count = item.badgeKey ? badges[item.badgeKey] : 0;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {count > 0 && (
                <Badge
                  variant="destructive"
                  className="h-5 min-w-[20px] px-1 text-[10px] flex items-center justify-center"
                >
                  {count}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {mounted ? role?.charAt(0) || "U" : "U"}
          </div>
          <div className="text-sm">
            <p className="font-medium">{mounted ? role || "User" : "User"}</p>
            <p className="text-xs text-muted-foreground">
              {mounted && role === "ADMIN" ? "Full Access" : "Restricted Access"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
