"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, UserPlus, Save, X } from "lucide-react";

interface TeacherFormProps {
  teacher?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function TeacherForm({ teacher, open: controlledOpen, onOpenChange }: TeacherFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    gender: "L",
    division: "",
    phone: "",
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name || "",
        gender: teacher.gender || "L",
        division: teacher.division || "",
        phone: teacher.phone || "",
      });
    } else {
      setFormData({ name: "", gender: "L", division: "", phone: "" });
    }
  }, [teacher, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/teachers", {
        method: teacher ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacher ? { ...formData, id: teacher.id } : formData),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        alert("Gagal menyimpan data.");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!teacher && (
        <DialogTrigger 
          render={
            <Button className="h-12 px-6">
              <Plus size={20} className="mr-2" strokeWidth={3} /> Tambah Guru
            </Button>
          }
        />
      )}
      <DialogContent className="bg-white border-4 border-black neo-shadow-lg rounded-[5px] max-w-md p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-[#A388EE] border-b-4 border-black p-4 shrink-0">
          <DialogTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
             <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center neo-shadow-sm">
                <UserPlus size={16} strokeWidth={3} />
             </div>
             {teacher ? "Edit Data Guru" : "Registrasi Guru"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-6">
          <form id="teacher-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nama Lengkap</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-11 rounded-[5px] font-bold text-sm"
                  placeholder="CONTOH: BUDI SANTOSO"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Jenis Kelamin</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(val) => setFormData({ ...formData, gender: val })}
                >
                  <SelectTrigger className="bg-[#F3F4F6] border-2 border-black h-11 rounded-[5px] font-bold text-sm">
                    <SelectValue placeholder="Pilih Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-black rounded-[5px] neo-shadow">
                    <SelectItem value="L">LAKI-LAKI</SelectItem>
                    <SelectItem value="P">PEREMPUAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Divisi / Unit Kerja</Label>
                <Input
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-11 rounded-[5px] font-bold text-sm"
                  placeholder="CONTOH: SMP / IT"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">No. WhatsApp (Awali 628)</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-11 rounded-[5px] font-bold text-sm"
                  placeholder="628123456789"
                  required
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t-2 border-black bg-zinc-50 shrink-0 flex gap-3">
           <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-12 border-2 border-black font-black uppercase text-xs"
           >
              Batal
           </Button>
           <Button
             form="teacher-form"
             type="submit"
             disabled={isLoading}
             className="flex-[2] h-12 uppercase tracking-widest text-xs bg-black text-white"
           >
             {isLoading ? <Loader2 className="animate-spin" /> : (
               <div className="flex items-center">
                 <Save size={16} className="mr-2" strokeWidth={3} /> Simpan
               </div>
             )}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
