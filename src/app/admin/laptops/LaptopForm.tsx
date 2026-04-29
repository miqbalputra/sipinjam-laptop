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
import { Plus, Loader2, Monitor, Save, X } from "lucide-react";

interface LaptopFormProps {
  laptop?: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function LaptopForm({ laptop, open: controlledOpen, onOpenChange }: LaptopFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    merk: "",
    serialNumber: "",
    color: "",
    fundingSource: "",
    status: "AVAILABLE",
    imageUrl: "",
  });

  useEffect(() => {
    if (laptop) {
      setFormData({
        merk: laptop.merk || "",
        serialNumber: laptop.serialNumber || "",
        color: laptop.color || "",
        fundingSource: laptop.fundingSource || "",
        status: laptop.status || "AVAILABLE",
        imageUrl: laptop.imageUrl || "",
      });
    } else {
      setFormData({
        merk: "",
        serialNumber: "",
        color: "",
        fundingSource: "",
        status: "AVAILABLE",
        imageUrl: "",
      });
    }
  }, [laptop, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/laptops", {
        method: laptop ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(laptop ? { ...formData, id: laptop.id } : formData),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        alert("Gagal menyimpan data laptop.");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!laptop && (
        <DialogTrigger 
          render={
            <Button className="h-12 px-6">
              <Plus size={20} className="mr-2" strokeWidth={3} /> Tambah Unit
            </Button>
          }
        />
      )}
      <DialogContent className="bg-white border-4 border-black neo-shadow-lg rounded-[5px] max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader className="bg-[#FFD033] border-b-4 border-black p-4 shrink-0">
          <DialogTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-3 text-black">
             <div className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center neo-shadow-sm">
                <Monitor size={16} strokeWidth={3} />
             </div>
             {laptop ? "Edit Data Laptop" : "Registrasi Laptop"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 p-6">
          <form id="laptop-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Merk / Model Laptop</Label>
                <Input
                  value={formData.merk}
                  onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-11 rounded-[5px] font-bold text-sm"
                  placeholder="CONTOH: LENOVO THINKPAD"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Serial Number</Label>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-11 rounded-[5px] font-bold text-sm"
                  placeholder="SN-XXXX"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Warna Unit</Label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-11 rounded-[5px] font-bold text-sm"
                  placeholder="SILVER / BLACK"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Sumber Dana / Asal Aset</Label>
                <Input
                  value={formData.fundingSource}
                  onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-11 rounded-[5px] font-bold text-sm"
                  placeholder="BOS 2024 / YAYASAN"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Status Inventaris</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="bg-[#F3F4F6] border-2 border-black h-11 rounded-[5px] font-bold text-black text-xs">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-black rounded-[5px] neo-shadow">
                    <SelectItem value="AVAILABLE">TERSEDIA</SelectItem>
                    <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">URL Logo / Gambar (Opsional)</Label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-11 rounded-[5px] font-bold text-xs"
                  placeholder="https://..."
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
             form="laptop-form"
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
