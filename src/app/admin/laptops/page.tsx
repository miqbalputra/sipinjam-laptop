import { prisma } from "@/lib/prisma";
import LaptopList from "./LaptopList";
import LaptopForm from "./LaptopForm";
import { Laptop as LaptopIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LaptopsPage() {
  const laptops = await prisma.laptop.findMany({
    orderBy: { merk: "asc" },
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-black pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#FFD033] border-2 border-black flex items-center justify-center neo-shadow-sm">
              <LaptopIcon size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">INVENTARIS LAPTOP</h1>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest ml-1">Manajemen unit, status ketersediaan, dan aset sekolah.</p>
        </div>
        
        <LaptopForm />
      </header>

      <div className="bg-white border-4 border-black neo-shadow-lg overflow-hidden rounded-[5px]">
        <LaptopList initialLaptops={laptops} />
      </div>
    </div>
  );
}
