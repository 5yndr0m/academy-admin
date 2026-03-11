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
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { subjectService, classService } from "@/lib/data";
import { Subject, Class, SubjectDependencies } from "@/types";
import {
  Loader2,
  Plus,
  BookOpen,
  Search,
  Archive,
  Trash2,
  AlertTriangle,
  Info,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

function DeleteSubjectDialog({
  subject,
  onDeleted,
}: {
  subject: Subject;
  onDeleted: () => void;
}) {
  const { role } = useAuth();
  const [dependencies, setDependencies] = useState<SubjectDependencies | null>(
    null,
  );
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [open, setOpen] = useState(false);

  const loadDependencies = async () => {
    setLoadingDeps(true);
    try {
      const deps = await subjectService.getDependencies(subject.id);
      setDependencies(deps);
    } catch (err) {
      console.error("Failed to load dependencies:", err);
    } finally {
      setLoadingDeps(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      loadDependencies();
    } else {
      setConfirmName("");
    }
  };

  const handleArchive = async () => {
    setDeleting(true);
    try {
      await subjectService.archive(subject.id);
      setOpen(false);
      onDeleted();
    } catch (err) {
      console.error("Failed to archive subject:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    setDeleting(true);
    try {
      await subjectService.forceDelete(subject.id);
      setOpen(false);
      onDeleted();
    } catch (err) {
      console.error("Failed to delete subject:", err);
    } finally {
      setDeleting(false);
    }
  };

  const canForceDelete =
    role === "ADMIN" && dependencies && !dependencies.can_safe_delete;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Remove Subject &ldquo;{subject.name}&rdquo;?
          </DialogTitle>
          <DialogDescription>
            Choose how to handle this subject and its dependencies.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loadingDeps ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Checking dependencies...
              </span>
            </div>
          ) : dependencies ? (
            <div className="space-y-4">
              {/* Dependency Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">Dependencies Found:</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-lg">
                      {dependencies.active_teachers}
                    </div>
                    <div className="text-muted-foreground">Teachers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-lg">
                      {dependencies.active_classes}
                    </div>
                    <div className="text-muted-foreground">Classes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-lg">
                      {dependencies.historical_records}
                    </div>
                    <div className="text-muted-foreground">History</div>
                  </div>
                </div>
              </div>

              {/* Blocking Items */}
              {dependencies.blocking_items &&
                dependencies.blocking_items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Impact:
                    </h4>
                    <ul className="space-y-1">
                      {(dependencies.blocking_items || []).map(
                        (item, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                          >
                            <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {/* Primary Action */}
                {dependencies.can_safe_delete &&
                dependencies.historical_records === 0 ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Safe Remove (Recommended)
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirm Safe Removal
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This subject has no dependencies and will be
                          permanently removed. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleForceDelete}
                          disabled={deleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            "Remove Subject"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={handleArchive}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Archiving...
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Subject (Recommended)
                      </>
                    )}
                  </Button>
                )}

                {/* Force Delete (Admin only) */}
                {canForceDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        disabled={deleting}
                      >
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Force Delete (Admin)
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ⚠️ Force Delete Subject
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>
                            <strong>This is dangerous!</strong> This will
                            permanently delete the subject and may break data
                            integrity.
                          </p>
                          <p>Type the subject name to confirm:</p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Input
                        placeholder={`Type "${subject.name}" to confirm`}
                        value={confirmName}
                        onChange={(e) => setConfirmName(e.target.value)}
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleForceDelete}
                          disabled={deleting || confirmName !== subject.name}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Force Deleting...
                            </>
                          ) : (
                            "Force Delete"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Failed to load dependency information.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
        <Button variant="outline" size="sm" onClick={() => load()}>
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
                <TableHead className="text-right">Classes & Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      {subject.name}
                      {subject.status === "ARCHIVED" && (
                        <Badge variant="secondary" className="text-xs">
                          Archived
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(subject.created_at)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
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
                      {subject.status === "ACTIVE" && (
                        <DeleteSubjectDialog
                          subject={subject}
                          onDeleted={() => load()}
                        />
                      )}
                    </div>
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
