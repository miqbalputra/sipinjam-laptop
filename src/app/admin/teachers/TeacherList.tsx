"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Teacher } from "@/generated/prisma/client";
import TeacherForm from "./TeacherForm";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, User } from "lucide-react";

interface TeacherListProps {
  initialTeachers: Teacher[];
}

export default function TeacherList({ initialTeachers }: TeacherListProps) {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetTeacher, setTargetTeacher] = useState<Teacher | null>(null);
  
  const router = useRouter();

  const handleToggleStatus = async () => {
    if (!targetTeacher) return;
    try {
      const res = await fetch(`/api/admin/teachers?id=${targetTeacher.id}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } catch (err) {
      alert("Gagal memproses status.");
    }
  };

  return (
    <div className="overflow-x-auto">
      {editingTeacher && (
        <TeacherForm 
          teacher={editingTeacher} 
          open={!!editingTeacher} 
          onOpenChange={(open) => !open && setEditingTeacher(null)} 
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Konfirmasi Status"
        description={`Yakin ingin ${targetTeacher?.isActive ? "menonaktifkan" : "mengaktifkan"} guru ${targetTeacher?.name}?`}
        onConfirm={handleToggleStatus}
        variant={targetTeacher?.isActive ? "danger" : "success"}
      />

      <Table>
        <TableHeader className="bg-[#F3F4F6]">
          <TableRow className="border-b-4 border-black hover:bg-transparent">
            <TableHead className="text-black font-black uppercase text-[10px] tracking-widest py-6">Nama Guru</TableHead>
            <TableHead className="text-black font-black uppercase text-[10px] tracking-widest py-6">Divisi</TableHead>
            <TableHead className="text-black font-black uppercase text-[10px] tracking-widest py-6">WhatsApp</TableHead>
            <TableHead className="text-black font-black uppercase text-[10px] tracking-widest py-6">Status</TableHead>
            <TableHead className="text-right text-black font-black uppercase text-[10px] tracking-widest py-6">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id} className="border-b-2 border-black hover:bg-zinc-50 transition-colors">
              <TableCell className="py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 border-2 border-black bg-[#FFD033] flex items-center justify-center neo-shadow-sm">
                    <User size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-black uppercase text-sm">{teacher.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400">{teacher.gender === "L" ? "Laki-laki" : "Perempuan"}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-bold text-xs uppercase py-5">{teacher.division}</TableCell>
              <TableCell className="font-bold text-xs py-5">{teacher.phone}</TableCell>
              <TableCell className="py-5">
                <div className={`${teacher.isActive ? "bg-[#A388EE]" : "bg-[#FF5252] text-white"} border-2 border-black px-2 py-0.5 font-black uppercase text-[9px] tracking-widest inline-block neo-shadow-sm`}>
                  {teacher.isActive ? "Aktif" : "Nonaktif"}
                </div>
              </TableCell>
              <TableCell className="text-right py-5">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button className="w-8 h-8 border-2 border-black bg-white hover:bg-[#F3F4F6] flex items-center justify-center transition-all neo-shadow-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                        <MoreHorizontal size={18} strokeWidth={3} />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end" className="bg-white border-2 border-black rounded-[5px] neo-shadow min-w-[160px]">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-widest p-3">Opsi Guru</DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-black" />
                    <DropdownMenuItem 
                      onClick={() => setEditingTeacher(teacher)}
                      className="p-3 font-bold text-xs uppercase focus:bg-[#A388EE] cursor-pointer"
                    >
                      <Edit className="mr-2 w-4 h-4" strokeWidth={3} /> Edit Data
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setTargetTeacher(teacher);
                        setConfirmOpen(true);
                      }}
                      className={`p-3 font-bold text-xs uppercase cursor-pointer ${teacher.isActive ? "focus:bg-[#FF5252] focus:text-white" : "focus:bg-[#A388EE]"}`}
                    >
                      <Trash2 className="mr-2 w-4 h-4" strokeWidth={3} /> {teacher.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {teachers.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center text-zinc-400 font-black uppercase tracking-widest">
                Belum ada data guru.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
