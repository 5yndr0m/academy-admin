import { StudentList } from "@/components/students/StudentList";

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <p className="text-slate-500">
          Manage student enrollment and fee payments.
        </p>
      </div>
      <StudentList />
    </div>
  );
}
