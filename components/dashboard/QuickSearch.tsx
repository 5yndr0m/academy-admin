"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, BookOpen, DoorOpen, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { QuickSearchResult } from "@/types";
import { Button } from "@/components/ui/button";

interface QuickSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function QuickSearch({ open, onOpenChange }: QuickSearchProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const [results, setResults] = useState<QuickSearchResult>({ students: [], lecturers: [], classrooms: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults({ students: [], lecturers: [], classrooms: [] });
    }
  }, [open]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults({ students: [], lecturers: [], classrooms: [] });
      return;
    }
    const q = encodeURIComponent(debouncedQuery);
    Promise.all([
      apiClient.get<{ results: { id: string; full_name: string; admission_no: string }[] }>(`/search/students?q=${q}`).catch(() => ({ results: [] })),
      apiClient.get<{ results: { id: string; full_name: string; subjects?: { name: string }[] }[] }>(`/search/teachers?q=${q}`).catch(() => ({ results: [] })),
    ]).then(([studentRes, teacherRes]) => {
      setResults({
        students: studentRes.results.map((s) => ({
          id:          s.id,
          name:        s.full_name,
          admissionNo: s.admission_no,
          programme:   "",
        })),
        lecturers: teacherRes.results.map((t) => ({
          id:       t.id,
          name:     t.full_name,
          subjects: (t.subjects ?? []).map((s) => s.name),
        })),
        classrooms: [],
      });
    });
  }, [debouncedQuery]);

  const hasResults =
    results.students.length > 0 ||
    results.lecturers.length > 0 ||
    results.classrooms.length > 0;

  const statusColor = (status: string) =>
    status === "In Use" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Quick Search</DialogTitle>

        {/* Search input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search students, lecturers, classrooms…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 shadow-none p-0 h-auto text-sm focus-visible:ring-0 bg-transparent"
          />
          {query && (
            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => setQuery("")}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[420px] overflow-y-auto">
          {!query && (
            <p className="text-xs text-muted-foreground text-center py-8">
              Start typing to search across students, lecturers, and classrooms.
            </p>
          )}

          {query && !hasResults && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No results for &ldquo;{query}&rdquo;
            </p>
          )}

          {results.students.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Students</span>
              </div>
              {results.students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onOpenChange(false)}
                  className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      {s.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.admissionNo} · {s.programme}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.lecturers.length > 0 && (
            <div className="p-2 border-t">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lecturers</span>
              </div>
              {results.lecturers.map((l) => (
                <button
                  key={l.id}
                  onClick={() => onOpenChange(false)}
                  className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                      {l.name.replace(/^(Dr\.|Ms\.|Mr\.)\s/, "").split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{l.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{l.subjects.join(", ")}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.classrooms.length > 0 && (
            <div className="p-2 border-t">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <DoorOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Classrooms</span>
              </div>
              {results.classrooms.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onOpenChange(false)}
                  className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <DoorOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">Capacity: {c.capacity}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${statusColor(c.currentStatus)}`}>
                    {c.currentStatus}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t px-4 py-2 flex items-center justify-end">
          <span className="text-[11px] text-muted-foreground">Press <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono bg-muted">Esc</kbd> to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Trigger button rendered in the Topbar */
export function QuickSearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">Search…</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] font-mono bg-background">
        ⌘K
      </kbd>
    </button>
  );
}
