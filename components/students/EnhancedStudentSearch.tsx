"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Filter, X, Users, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Student } from "@/types";

interface SearchFilters {
  admissionFeePaid?: boolean;
  registrationDateFrom?: string;
  registrationDateTo?: string;
}

interface EnhancedStudentSearchProps {
  students: Student[];
  onFilteredResults: (filtered: Student[]) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  className?: string;
}

export function EnhancedStudentSearch({
  students,
  onFilteredResults,
  searchValue,
  onSearchChange,
  className = "",
}: EnhancedStudentSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Apply search and filters
  const filteredStudents = useMemo(() => {
    let result = students;

    // Text search
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase().trim();
      result = result.filter((student) => {
        const searchText = [
          student.fullname,
          student.admission_no,
          student.home_contact,
          student.guardian_name,
          student.guardian_contact,
          student.guardian_email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchText.includes(query);
      });
    }

    // Apply filters
    if (filters.admissionFeePaid !== undefined) {
      result = result.filter(
        (student) => student.admission_fee_paid === filters.admissionFeePaid,
      );
    }

    if (filters.registrationDateFrom) {
      const fromDate = new Date(filters.registrationDateFrom);
      result = result.filter((student) => {
        const regDate = student.registration_date
          ? new Date(student.registration_date)
          : new Date(student.created_at);
        return regDate >= fromDate;
      });
    }

    if (filters.registrationDateTo) {
      const toDate = new Date(filters.registrationDateTo);
      result = result.filter((student) => {
        const regDate = student.registration_date
          ? new Date(student.registration_date)
          : new Date(student.created_at);
        return regDate <= toDate;
      });
    }

    return result;
  }, [students, searchValue, filters]);

  // Notify parent of filtered results
  useEffect(() => {
    onFilteredResults(filteredStudents);
  }, [filteredStudents, onFilteredResults]);

  // Filter management
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilter = (key: keyof SearchFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    onSearchChange("");
    setShowFilters(false);
  };

  const activeFilterCount = Object.keys(filters).length + (searchValue ? 1 : 0);

  // Quick filter shortcuts
  const quickFilters = [
    {
      label: "Admission Unpaid",
      action: () => updateFilter("admissionFeePaid", false),
      count: students.filter((s) => !s.admission_fee_paid).length,
    },

    {
      label: "This Month",
      action: () => {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        updateFilter(
          "registrationDateFrom",
          thisMonth.toISOString().split("T")[0],
        );
      },
      count: students.filter((s) => {
        const regDate = s.registration_date
          ? new Date(s.registration_date)
          : new Date(s.created_at);
        const thisMonth = new Date();
        thisMonth.setDate(1);
        return regDate >= thisMonth;
      }).length,
    },
  ];

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {/* Main search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name, ID, contact, guardian..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Advanced filters toggle */}
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`relative ${activeFilterCount > 0 ? "border-blue-500" : ""}`}
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-blue-500 text-white"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Advanced Filters</CardTitle>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 px-2 text-xs"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick filters */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quick Filters
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {quickFilters.map((filter, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={filter.action}
                        className="h-6 px-2 text-xs"
                      >
                        {filter.label} ({filter.count})
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Admission Fee Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Admission Fee Status
                  </label>
                  <Select
                    value={
                      filters.admissionFeePaid === undefined
                        ? "all"
                        : filters.admissionFeePaid
                          ? "paid"
                          : "unpaid"
                    }
                    onValueChange={(value) => {
                      if (value === "all") {
                        clearFilter("admissionFeePaid");
                      } else {
                        updateFilter("admissionFeePaid", value === "paid");
                      }
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="paid">Fee Paid</SelectItem>
                      <SelectItem value="unpaid">Fee Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Registration Date
                  </label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      placeholder="From date"
                      value={filters.registrationDateFrom || ""}
                      onChange={(e) =>
                        updateFilter("registrationDateFrom", e.target.value)
                      }
                      className="h-8"
                    />
                    <Input
                      type="date"
                      placeholder="To date"
                      value={filters.registrationDateTo || ""}
                      onChange={(e) =>
                        updateFilter("registrationDateTo", e.target.value)
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        {/* Clear all button when filters are active */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {(searchValue || Object.keys(filters).length > 0) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {searchValue && (
            <Badge
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              <Search className="h-3 w-3" />"{searchValue}"
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 hover:bg-secondary-foreground/20 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.admissionFeePaid !== undefined && (
            <Badge
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              <GraduationCap className="h-3 w-3" />
              {filters.admissionFeePaid ? "Fee Paid" : "Fee Unpaid"}
              <button
                onClick={() => clearFilter("admissionFeePaid")}
                className="ml-1 hover:bg-secondary-foreground/20 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {(filters.registrationDateFrom || filters.registrationDateTo) && (
            <Badge
              variant="secondary"
              className="text-xs flex items-center gap-1"
            >
              📅
              {filters.registrationDateFrom && filters.registrationDateTo
                ? `${filters.registrationDateFrom} - ${filters.registrationDateTo}`
                : filters.registrationDateFrom
                  ? `From ${filters.registrationDateFrom}`
                  : `Until ${filters.registrationDateTo}`}
              <button
                onClick={() => {
                  clearFilter("registrationDateFrom");
                  clearFilter("registrationDateTo");
                }}
                className="ml-1 hover:bg-secondary-foreground/20 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results summary */}
      <div className="text-xs text-muted-foreground mt-2">
        Showing {filteredStudents.length} of {students.length} students
      </div>
    </div>
  );
}
