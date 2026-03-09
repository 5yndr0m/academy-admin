import { TeacherList } from "@/components/teachers/TeacherList";

export default function TeachersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Teachers</h2>
        <p className="text-slate-500">Manage faculty and class schedules.</p>
      </div>
      <TeacherList />
    </div>
  );
}
