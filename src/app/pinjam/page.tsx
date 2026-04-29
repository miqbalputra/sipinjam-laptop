import { prisma } from "@/lib/prisma";
import PinjamForm from "./PinjamForm";
import Link from "next/link";
import { ArrowLeft, Laptop as LaptopIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PinjamPage() {
  const teachers = await prisma.teacher.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const laptops = await prisma.laptop.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { merk: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-black font-sans selection:bg-[#A388EE] selection:text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <Link 
            href="/" 
            className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
          >
            <div className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center neo-shadow-sm group-hover:bg-[#A388EE] transition-colors">
              <ArrowLeft size={16} strokeWidth={3} />
            </div>
            Kembali
          </Link>

          <div className="flex items-center gap-3 md:text-right">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Form Peminjaman</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">Lengkapi data untuk meminjam unit</p>
            </div>
            <div className="w-12 h-12 bg-[#FFD033] border-2 border-black flex items-center justify-center neo-shadow">
              <LaptopIcon size={24} strokeWidth={2.5} />
            </div>
          </div>
        </header>

        <div className="bg-white border-2 border-black p-8 md:p-12 neo-shadow-lg rounded-[5px]">
          <PinjamForm teachers={teachers} laptops={laptops} />
        </div>

        <footer className="text-center">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Sistem Peminjaman Laptop Sekolah v2.0 • 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
