import { ClassList } from "@/components/classes/ClassList";

export default function ClassesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Classes</h2>
        <p className="text-slate-500">
          Manage classes, assign teachers, and configure fees and payout
          agreements.
        </p>
      </div>
      <ClassList />
    </div>
  );
}
