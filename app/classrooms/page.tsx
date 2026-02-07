import { ClassroomList } from "@/components/classrooms/ClassroomList";
import { AddClassroomDialog } from "@/components/classrooms/AddClassroomDialog";

export default function ClassroomsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Classrooms</h2>
                    <p className="text-slate-500">
                        View and manage classroom availability and capacity.
                    </p>
                </div>
                <AddClassroomDialog />
            </div>

            <ClassroomList />
        </div>
    );
}
