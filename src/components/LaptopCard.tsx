import { Laptop } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Monitor, Calendar, User, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";

interface LaptopCardProps {
  laptop: Laptop & {
    transactions?: any[];
  };
  isMuted?: boolean;
}

export default function LaptopCard({ laptop, isMuted = false }: LaptopCardProps) {
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

  const activeTransaction = laptop.transactions?.find(t => t.status === "APPROVED");

  return (
    <div className={`
      border-2 border-black neo-shadow rounded-[5px] overflow-hidden transition-all flex flex-col h-full
      ${isMuted 
        ? "bg-zinc-100 grayscale border-zinc-400 neo-shadow-none opacity-80" 
        : "bg-white group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
      }
    `}>
      {/* Logo Section */}
      <div className={`
        aspect-[16/10] w-full border-b-2 relative overflow-hidden flex items-center justify-center p-10 shrink-0
        ${isMuted ? "bg-zinc-200 border-zinc-400" : "bg-white border-black"}
      `}>
        {laptop.imageUrl ? (
          <img
            src={laptop.imageUrl}
            alt={laptop.merk}
            className={`
              w-full h-full object-contain transition-all duration-500 scale-90
              ${isMuted ? "opacity-30" : "grayscale-[0.8] group-hover:grayscale-0 group-hover:scale-100"}
            `}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300">
            <Monitor size={40} strokeWidth={2} />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <div className={`
            border-2 px-2 py-0.5 font-extrabold uppercase text-[9px] tracking-widest
            ${isMuted ? "bg-zinc-400 text-white border-zinc-500" : `${statusColors[laptop.status as keyof typeof statusColors]} border-black neo-shadow-sm`}
          `}>
            {statusLabels[laptop.status as keyof typeof statusLabels]}
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 space-y-4">
        {/* Title Area */}
        <div className="min-h-[50px]">
          <h3 className={`
            text-sm font-black uppercase tracking-tight leading-tight line-clamp-2
            ${isMuted ? "text-zinc-500" : "text-black"}
          `}>
            {laptop.merk}
          </h3>
          <p className={`
            text-[9px] font-bold uppercase tracking-widest mt-1.5 truncate
            ${isMuted ? "text-zinc-400" : "text-zinc-400"}
          `}>
            {laptop.color} • SN: {laptop.serialNumber}
          </p>
        </div>

        {/* Transaction Info */}
        <div className="flex-1">
          {laptop.status === "BORROWED" && activeTransaction && (
            <div className={`
              border-2 p-3 space-y-1.5 neo-shadow-sm h-full
              ${isMuted ? "bg-zinc-200/50 border-zinc-400" : "bg-zinc-50 border-black"}
            `}>
              <div className={`flex items-center text-[9px] font-bold uppercase tracking-tight ${isMuted ? "text-zinc-500" : "text-black"}`}>
                <User size={12} className={`mr-2 ${isMuted ? "text-zinc-400" : "text-[#A388EE]"}`} strokeWidth={3} />
                <span className="truncate">{activeTransaction.teacher?.name}</span>
              </div>
              <div className={`flex items-center text-[9px] font-bold uppercase tracking-tight ${isMuted ? "text-zinc-500" : "text-black"}`}>
                <Calendar size={12} className={`mr-2 ${isMuted ? "text-zinc-400" : "text-[#A388EE]"}`} strokeWidth={3} />
                <span className="truncate">Sejak: {new Date(activeTransaction.borrowDate).toLocaleDateString("id-ID")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 mt-auto">
          {laptop.status === "AVAILABLE" ? (
            <Link href="/pinjam">
              <button className="w-full py-3.5 bg-[#A388EE] text-black border-2 border-black font-black uppercase text-[10px] tracking-[0.1em] neo-shadow hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2">
                Pinjam <ArrowRight size={14} strokeWidth={3} />
              </button>
            </Link>
          ) : (
            <div className={`
              w-full py-3.5 border-2 font-black uppercase text-[10px] tracking-[0.1em] text-center flex items-center justify-center gap-2
              ${isMuted ? "bg-zinc-200 text-zinc-400 border-zinc-300" : "bg-zinc-100 text-zinc-400 border-black opacity-40"}
            `}>
              <ShieldAlert size={14} strokeWidth={3} /> {laptop.status === "MAINTENANCE" ? "Maintenance" : "Sedang Dipakai"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
