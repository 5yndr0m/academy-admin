"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut, Menu } from "lucide-react";
import { QuickSearch, QuickSearchTrigger } from "@/components/dashboard/QuickSearch";

export function Topbar() {
  const [currentDate] = useState(() =>
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout } = useAuth();

  // Cmd+K / Ctrl+K global shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen((o) => !o);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px] justify-between z-30 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[240px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar className="border-none" />
            </SheetContent>
          </Sheet>
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
            {currentDate}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <QuickSearchTrigger onClick={() => setSearchOpen(true)} />
          <div className="text-sm font-medium hidden sm:block">
            Welcome, {user ?? ""}
          </div>
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={logout} title="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <QuickSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
