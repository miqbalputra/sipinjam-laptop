"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Laptop } from "@/generated/prisma/client";
import LaptopForm from "./LaptopForm";
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
import { MoreHorizontal, Edit, Trash2, Monitor } from "lucide-react";

interface LaptopListProps {
  initialLaptops: Laptop[];
}

export default function LaptopList({ initialLaptops }: LaptopListProps) {
  const [laptops, setLaptops] = useState(initialLaptops);
  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetLaptop, setTargetLaptop] = useState<Laptop | null>(null);
  
  const router = useRouter();

  const handleDelete = async () => {
    if (!targetLaptop) return;
    try {
      const res = await fetch(`/api/admin/laptops?id=${targetLaptop.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else {
        const data = await res.json();
        alert(data.message || "Gagal menghapus.");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
  };

  const statusColors = {
    AVAILABLE: "bg-[#A388EE] text-black",
    BORROWED: "bg-[#FFD033] text-black",
    MAINTENANCE: "bg-[#FF5252] text-white",
  };

  const statusLabels = {
    AVAILABLE: "Tersedia",
    BORROWED: "Dipinjam",
    MAINTENANCE: "Maintenance",
  };

  return (
    <div className="overflow-x-auto">
      {editingLaptop && (
        <LaptopForm 
          laptop={editingLaptop} 
          open={!!editingLaptop} 
          onOpenChange={(open) => !open && setEditingLaptop(null)} 
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Hapus Unit"
        description={`Apakah Anda yakin ingin menghapus unit ${targetLaptop?.merk} dari inventaris secara permanen?`}
        onConfirm={handleDelete}
        variant="danger"
        confirmText="Hapus Sekarang"
      />

      <Table>
        <TableHeader className="bg-[#F3F4F6]">
          <TableRow className="border-b-4 border-black hover:bg-transparent">
            <TableHead className="text-black font-black uppercase text-[10px] tracking-widest py-6">Unit Laptop</TableHead>
            <TableHead className="text-black font-black uppercase text-[10px] tracking-widest py-6">SN / No. Seri</TableHead>
            <TableHead className="text-black font-black uppercase text-[10px] tracking-widest py-6">Sumber Dana</TableHead>
            <TableHead className="text-black font-black uppercase text-[10px] tracking-widest py-6">Status</TableHead>
            <TableHead className="text-right text-black font-black uppercase text-[10px] tracking-widest py-6">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {laptops.map((laptop) => (
            <TableRow key={laptop.id} className="border-b-2 border-black hover:bg-zinc-50 transition-colors">
              <TableCell className="py-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#F3F4F6] border-2 border-black overflow-hidden flex items-center justify-center neo-shadow-sm">
                    {laptop.imageUrl ? (
                      <img src={laptop.imageUrl} alt={laptop.merk} className="w-full h-full object-contain" />
                    ) : (
                      <Monitor size={20} strokeWidth={2.5} />
                    )}
                  </div>
                  <div>
                    <p className="font-black uppercase text-sm leading-tight">{laptop.merk}</p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{laptop.color}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-xs font-bold font-mono py-5">{laptop.serialNumber}</TableCell>
              <TableCell className="text-[10px] font-black uppercase tracking-tight py-5">{laptop.fundingSource}</TableCell>
              <TableCell className="py-5">
                <div className={`${statusColors[laptop.status as keyof typeof statusColors]} border-2 border-black px-2 py-0.5 font-black uppercase text-[9px] tracking-widest inline-block neo-shadow-sm`}>
                  {statusLabels[laptop.status as keyof typeof statusLabels]}
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
                      <DropdownMenuLabel className="font-black uppercase text-[10px] tracking-widest p-3">Opsi Unit</DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-black" />
                    <DropdownMenuItem 
                      onClick={() => setEditingLaptop(laptop)}
                      className="p-3 font-bold text-xs uppercase focus:bg-[#A388EE] cursor-pointer"
                    >
                      <Edit className="mr-2 w-4 h-4" strokeWidth={3} /> Edit Detail
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-black/10" />
                    <DropdownMenuItem 
                      onClick={() => {
                        setTargetLaptop(laptop);
                        setDeleteConfirmOpen(true);
                      }}
                      className="p-3 font-bold text-xs uppercase focus:bg-[#FF5252] focus:text-white cursor-pointer"
                    >
                      <Trash2 className="mr-2 w-4 h-4" strokeWidth={3} /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {laptops.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center text-zinc-400 font-black uppercase tracking-widest">
                Tidak ada data laptop.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
