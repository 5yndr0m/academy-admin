"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Loader2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchPlaceholder?: string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
  onRowClick?: (row: T) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

type SortDir = "asc" | "desc" | null;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useMemo(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  error,
  onRetry,
  searchPlaceholder = "Search…",
  emptyIcon,
  emptyTitle = "No results",
  emptyDescription,
  pageSize = 20,
  toolbar,
  onRowClick,
  searchValue: externalSearch,
  onSearchChange: externalSearchChange,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  const isControlled = externalSearch !== undefined;
  const rawSearch = isControlled ? externalSearch : internalSearch;
  const debouncedSearch = useDebounce(rawSearch, 300);

  const handleSearch = useCallback(
    (v: string) => {
      setPage(1);
      if (isControlled) {
        externalSearchChange?.(v);
      } else {
        setInternalSearch(v);
      }
    },
    [isControlled, externalSearchChange]
  );

  const searchableCols = columns.filter((c) => c.searchable !== false);

  // In controlled mode the parent handles filtering; skip client-side filter.
  const filtered = useMemo(() => {
    if (isControlled || !debouncedSearch) return data;
    const q = debouncedSearch.toLowerCase();
    return data.filter((row) =>
      searchableCols.some((col) => {
        const cell = col.cell(row);
        if (typeof cell === "string") return cell.toLowerCase().includes(q);
        if (typeof cell === "number") return String(cell).includes(q);
        return false;
      })
    );
  }, [data, debouncedSearch, searchableCols, isControlled]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find((c) => c.key === sortKey);
      if (!col) return 0;
      const av = col.cell(a);
      const bv = col.cell(b);
      const as = typeof av === "string" ? av : String(av ?? "");
      const bs = typeof bv === "string" ? bv : String(bv ?? "");
      return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: string) => {
    setPage(1);
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16" role="status" aria-label="Loading">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={onRetry} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={rawSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {toolbar}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={col.headerClassName}
                  onClick={col.sortable !== false ? () => toggleSort(col.key) : undefined}
                  style={col.sortable !== false ? { cursor: "pointer", userSelect: "none" } : undefined}
                >
                  {col.header}
                  {col.sortable !== false && sortKey === col.key && (
                    <span className="ml-1 opacity-60">{sortDir === "asc" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {sorted.length} result{sorted.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setPage(1)} disabled={safePage === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2">
              {safePage} / {totalPages}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
