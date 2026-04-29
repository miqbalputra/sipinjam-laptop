import { prisma } from "@/lib/prisma";
import TeacherList from "./TeacherList";
import TeacherForm from "./TeacherForm";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-black pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#A388EE] border-2 border-black flex items-center justify-center neo-shadow-sm">
              <Users size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">DATA GURU</h1>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest ml-1">Kelola database pengajar dan akses sistem.</p>
        </div>
        
        <TeacherForm />
      </header>

      <div className="bg-white border-4 border-black neo-shadow-lg overflow-hidden rounded-[5px]">
        <TeacherList initialTeachers={teachers} />
      </div>
    </div>
  );
}
