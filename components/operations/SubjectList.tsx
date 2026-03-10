"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { subjectService, classService } from "@/lib/data";
import { Subject, Class } from "@/types";
import { Loader2, Plus, BookOpen, Search } from "lucide-react";

export function SubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Add dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");

  const load = useCallback(async (search?: string) => {
    if (search !== undefined) {
      setSearching(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const [subjectsData, classesData] = await Promise.all([
        subjectService.getAll(search),
        classService.getAll(),
      ]);
      setSubjects(subjectsData);
      setClasses(classesData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Handle search with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        load(searchQuery.trim());
      } else {
        load();
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, load]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setAddLoading(true);
    setAddError(null);
    try {
      const newSubject = await subjectService.create(newSubjectName.trim());
      setSubjects((prev) => [...prev, newSubject]);
      setNewSubjectName("");
      setAddOpen(false);
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to add subject");
    } finally {
      setAddLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getClassCountForSubject = (subjectId: string) => {
    return classes.filter((cls) => cls.subject_id === subjectId).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 p-8">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={load}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subjects
            {subjects.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({subjects.length})
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Manage academic subjects offered at the academy.
            {subjects.length > 0 && (
              <span className="block text-xs mt-1 text-muted-foreground">
                {searchQuery
                  ? `Found ${subjects.length} subject${subjects.length === 1 ? "" : "s"}`
                  : `${classes.length} total classes across ${subjects.length} subjects`}
              </span>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-9 pr-3"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="h-9 px-2 text-muted-foreground hover:text-foreground"
              title="Clear search"
            >
              ×
            </Button>
          )}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <form onSubmit={handleAddSubject}>
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subject-name">Subject Name</Label>
                    <Input
                      id="subject-name"
                      placeholder="e.g., Ballet, Mathematics, Piano"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  {addError && (
                    <p className="text-sm text-destructive">{addError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addLoading}>
                    {addLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Subject"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-medium text-lg mb-2 text-foreground">
              {searchQuery ? "No matching subjects" : "No subjects yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? `No subjects found matching "${searchQuery}". Try a different search term.`
                : "Add your first academic subject to get started."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setAddOpen(true)} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Classes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject, index) => (
                <TableRow key={subject.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      {subject.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(subject.created_at)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {getClassCountForSubject(subject.id) > 0 ? (
                      <div
                        className="inline-flex items-center justify-center h-6 w-6 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors cursor-default"
                        title={`${getClassCountForSubject(subject.id)} ${getClassCountForSubject(subject.id) === 1 ? "class" : "classes"} using this subject`}
                      >
                        {getClassCountForSubject(subject.id)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground opacity-50 text-xs">
                        0
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
