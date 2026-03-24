"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const [mounted, setMounted] = useState(false);
  const { role } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (role !== "ADMIN") return <>{fallback}</>;
  return <>{children}</>;
}
