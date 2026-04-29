import { prisma } from "@/lib/prisma";
import TransactionManager from "./transactions/TransactionManager";
import { 
  Users, 
  Laptop as LaptopIcon, 
  Clock, 
  AlertCircle,
  ArrowUpRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [teachers, laptops, transactions] = await Promise.all([
    prisma.teacher.count({ where: { isActive: true } }),
    prisma.laptop.count(),
    prisma.transaction.findMany({
      include: {
        teacher: true,
        laptop: true,
      },
      orderBy: { borrowDate: "desc" },
    }),
  ]);

  const stats = [
    { label: "Total Guru", value: teachers, icon: Users, color: "bg-[#A388EE]" },
    { label: "Total Laptop", value: laptops, icon: LaptopIcon, color: "bg-[#FFD033]" },
    { label: "Peminjaman Aktif", value: transactions.filter(t => t.status === "APPROVED").length, icon: Clock, color: "bg-[#FF5252]" },
    { label: "Menunggu Approval", value: transactions.filter(t => t.status === "PENDING").length, icon: AlertCircle, color: "bg-white" },
  ];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end border-b-4 border-black pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Dashboard Overview</h1>
          <p className="text-zinc-600 font-bold uppercase text-xs tracking-widest">Statistik & Manajemen Real-time</p>
        </div>
        <div className="hidden md:block">
           <div className="px-4 py-2 border-2 border-black bg-white font-black text-xs uppercase neo-shadow-sm">
             {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border-2 border-black p-8 neo-shadow relative group">
            <div className={`w-12 h-12 ${stat.color} border-2 border-black flex items-center justify-center mb-6 neo-shadow-sm group-hover:rotate-6 transition-transform`}>
              <stat.icon size={24} strokeWidth={3} />
            </div>
            <p className="text-zinc-500 font-black uppercase text-[10px] tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black">{stat.value}</h3>
            <ArrowUpRight className="absolute top-6 right-6 text-zinc-300" size={20} />
          </div>
        ))}
      </div>

      <div className="bg-white border-4 border-black neo-shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 border-b-4 border-black bg-black text-white flex justify-between items-center gap-4">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">Antrean Transaksi</h2>
          <span className="bg-[#FFD033] text-black px-4 py-1.5 border-2 border-white font-black text-[10px] md:text-xs uppercase shrink-0 neo-shadow-sm">
            {transactions.length} Total
          </span>
        </div>
        <TransactionManager initialTransactions={transactions} />
      </div>
    </div>
  );
}
