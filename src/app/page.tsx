import { prisma } from "@/lib/prisma";
import LaptopCard from "@/components/LaptopCard";
import InteractiveGuide from "@/components/InteractiveGuide";
import Link from "next/link";
import { Laptop as LaptopIcon, Shield, Info, ArrowRight, CheckCircle2, Zap, ArrowUpRight, Monitor } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const laptops = await prisma.laptop.findMany({
    include: {
      transactions: {
        where: { status: "APPROVED" },
        include: { teacher: true },
      },
    },
    orderBy: { merk: "asc" },
  });

  const readyLaptops = laptops.filter((l) => l.status === "AVAILABLE");
  const unavailableLaptops = laptops.filter((l) => l.status !== "AVAILABLE");

  const availableCount = readyLaptops.length;
  const borrowedCount = laptops.filter((l) => l.status === "BORROWED").length;

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-black font-sans selection:bg-[#A388EE] selection:text-white p-4 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-4 px-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#A388EE] border-2 border-black flex items-center justify-center neo-shadow">
                 <LaptopIcon size={20} strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-black uppercase tracking-tighter">SiPinjam Laptop</h1>
           </div>
           <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end">
              <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest hover:underline decoration-2">Admin Portal</Link>
              <InteractiveGuide />
           </div>
        </header>

        {/* Bento Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 md:row-span-2 bg-[#A388EE] border-4 border-black neo-shadow-lg p-8 md:p-12 flex flex-col justify-center rounded-[5px] relative overflow-hidden group min-h-[320px]">
            <div className="relative z-10 space-y-6">
               <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center neo-shadow-sm">
                  <Zap size={24} strokeWidth={3} />
               </div>
               <h2 className="text-4xl md:text-6xl font-black uppercase leading-[0.9] tracking-tighter text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  Sistem <br className="hidden md:block" /> Peminjaman <br className="hidden md:block" /> Aset Sekolah.
               </h2>
               <p className="text-base md:text-lg font-bold max-w-md text-white leading-tight">
                  Akses inventaris laptop sekolah jadi lebih teratur, transparan, dan serba digital.
               </p>
            </div>
            <Zap className="absolute -bottom-10 -right-10 w-48 h-48 md:w-64 md:h-64 text-black/10 group-hover:rotate-12 transition-transform duration-500" />
          </div>

          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-6">
            <div className="bg-[#FFD033] border-4 border-black neo-shadow-lg p-6 md:p-8 flex flex-col justify-between rounded-[5px] group aspect-square md:aspect-auto md:min-h-[160px]">
              <div className="flex justify-between items-start">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-black text-white px-2 py-0.5">Stock</span>
                 <ArrowUpRight className="text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={18} />
              </div>
              <div>
                 <h3 className="text-4xl md:text-6xl font-black leading-none">{availableCount}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest mt-1">Tersedia</p>
              </div>
            </div>

            <div className="bg-black text-white border-4 border-black neo-shadow-lg p-6 md:p-8 flex flex-col justify-between rounded-[5px] group aspect-square md:aspect-auto md:min-h-[160px]">
              <div className="flex justify-between items-start">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-[#FF5252] text-white px-2 py-0.5">Loaned</span>
                 <Shield size={18} strokeWidth={2.5} className="text-[#FF5252]" />
              </div>
              <div>
                 <h3 className="text-4xl md:text-6xl font-black leading-none">{borrowedCount}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest mt-1">Dipinjam</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="/pinjam" 
              className="md:col-span-2 bg-white border-4 border-black neo-shadow-lg p-8 flex items-center justify-between rounded-[5px] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all group min-h-[120px]"
            >
              <div className="space-y-1">
                 <h3 className="text-2xl md:text-4xl font-black uppercase leading-tight tracking-tighter">Ajukan Peminjaman</h3>
                 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Klik Untuk Mulai —&gt;</p>
              </div>
              <div className="w-12 h-12 bg-[#A388EE] border-2 border-black flex items-center justify-center neo-shadow-sm shrink-0">
                 <ArrowRight size={24} strokeWidth={3} />
              </div>
            </Link>

            <div className="bg-white border-4 border-black neo-shadow-lg p-8 flex items-center gap-4 rounded-[5px] min-h-[120px]">
               <div className="w-12 h-12 bg-[#F3F4F6] border-2 border-black flex items-center justify-center shrink-0">
                  <Info size={24} strokeWidth={3} />
               </div>
               <p className="text-[10px] font-bold uppercase leading-tight">
                  Hubungi Admin untuk konfirmasi pengambilan unit fisik di ruang IT.
               </p>
            </div>
          </div>
        </div>

        {/* Laptop Catalog Section - Sorted */}
        <section className="pt-16 space-y-16">
          {/* Ready Laptops */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-2">
               <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#A388EE] border-2 border-black flex items-center justify-center neo-shadow-sm">
                     <CheckCircle2 size={18} strokeWidth={3} />
                  </div>
                  Unit Tersedia
               </h2>
               <div className="h-0.5 flex-1 bg-black opacity-10" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {readyLaptops.map((laptop) => (
                <LaptopCard key={laptop.id} laptop={laptop} />
              ))}
              {readyLaptops.length === 0 && (
                <div className="col-span-full py-20 border-4 border-dashed border-black/10 rounded-[5px] flex flex-col items-center justify-center text-zinc-400">
                   <Monitor size={48} className="mb-4 opacity-20" />
                   <p className="font-black uppercase tracking-widest text-sm text-center">Maaf, Semua unit sedang dipinjam.</p>
                </div>
              )}
            </div>
          </div>

          {/* Unavailable Laptops (Borrowed/Maintenance) */}
          <div className="space-y-8 opacity-80">
            <div className="flex items-center gap-4 px-2">
               <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-3 text-zinc-500">
                  <div className="w-8 h-8 bg-zinc-200 border-2 border-zinc-400 flex items-center justify-center">
                     <Shield size={18} strokeWidth={3} />
                  </div>
                  Sedang Dipakai / Maintenance
               </h2>
               <div className="h-0.5 flex-1 bg-zinc-300" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {unavailableLaptops.map((laptop) => (
                <LaptopCard key={laptop.id} laptop={laptop} isMuted />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-24 bg-white border-4 border-black p-8 md:p-12 neo-shadow-lg flex flex-col md:flex-row justify-between items-center gap-10 rounded-[5px]">
           <div className="space-y-1 text-center md:text-left">
              <h2 className="text-xl font-black uppercase tracking-tighter">SiPinjam Laptop</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sistem Inventaris Sekolah v2.0</p>
           </div>
           <div className="flex flex-col items-center md:items-end gap-1">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Developed By</p>
              <p className="text-lg font-black uppercase underline decoration-[#A388EE] decoration-4 underline-offset-4">Muhammad Iqbal Putra</p>
           </div>
        </footer>
      </div>
    </div>
  );
}
