"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Check, 
  X, 
  RotateCcw, 
  User, 
  Laptop as LaptopIcon, 
  Clock, 
  Inbox, 
  History, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { motion } from "framer-motion";

interface TransactionManagerProps {
  initialTransactions: any[];
}

export default function TransactionManager({ initialTransactions }: TransactionManagerProps) {
  const [transactions] = useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const pending = transactions.filter(t => t.status === "PENDING");
  const approved = transactions.filter(t => t.status === "APPROVED");
  const all = transactions;

  const handleAction = async (id: string, action: "approve" | "reject" | "return") => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || "Gagal memproses transaksi.");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      PENDING: "bg-[#FFD033] text-black",
      APPROVED: "bg-[#A388EE] text-black",
      REJECTED: "bg-[#FF5252] text-white",
      RETURNED: "bg-black text-white",
    };
    return (
      <div className={`${colors[status as keyof typeof colors]} border-2 border-black px-2 py-0.5 font-black uppercase text-[8px] tracking-widest inline-block neo-shadow-sm`}>
        {status}
      </div>
    );
  };

  const TransactionTable = ({ data }: { data: any[] }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-x-auto"
    >
      <Table>
        <TableHeader className="bg-[#F3F4F6]">
          <TableRow className="border-b-4 border-black hover:bg-transparent">
            <TableHead className="text-black font-black uppercase text-[9px] tracking-widest py-4 px-4 min-w-[150px]">Peminjam</TableHead>
            <TableHead className="text-black font-black uppercase text-[9px] tracking-widest py-4 px-4 min-w-[150px]">Unit Laptop</TableHead>
            <TableHead className="text-black font-black uppercase text-[9px] tracking-widest py-4 px-4 min-w-[120px]">Waktu</TableHead>
            <TableHead className="text-black font-black uppercase text-[9px] tracking-widest py-4 px-4">Status</TableHead>
            <TableHead className="text-right text-black font-black uppercase text-[9px] tracking-widest py-4 px-4">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((t) => (
            <TableRow key={t.id} className="border-b-2 border-black hover:bg-[#A388EE]/5 transition-colors">
              <TableCell className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-2 border-black bg-[#A388EE] flex items-center justify-center neo-shadow-sm shrink-0">
                    <User size={14} strokeWidth={3} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black uppercase text-[11px] truncate">{t.teacher.name}</p>
                    <p className="text-[8px] font-bold text-zinc-400 uppercase truncate">{t.teacher.division}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-2 border-black bg-[#FFD033] flex items-center justify-center neo-shadow-sm shrink-0">
                    <LaptopIcon size={14} strokeWidth={3} className="text-black" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[11px] uppercase truncate">{t.laptop.merk}</p>
                    <p className="text-[8px] font-bold text-zinc-400 truncate">SN: {t.laptop.serialNumber}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4 px-4">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-600 uppercase">
                  <Clock size={10} strokeWidth={3} className="text-[#A388EE]" />
                  {new Date(t.borrowDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' })}
                </div>
              </TableCell>
              <TableCell className="py-4 px-4">
                <StatusBadge status={t.status} />
              </TableCell>
              <TableCell className="text-right py-4 px-4">
                <div className="flex justify-end gap-2">
                  {t.status === "PENDING" && (
                    <>
                      <Button 
                        size="xs" 
                        disabled={isLoading}
                        onClick={() => handleAction(t.id, "approve")}
                        className="bg-[#A388EE] h-7 px-3 text-[8px] font-black uppercase"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="xs" 
                        variant="destructive"
                        disabled={isLoading}
                        onClick={() => handleAction(t.id, "reject")}
                        className="h-7 px-3 text-[8px] font-black uppercase"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {t.status === "APPROVED" && (
                    <Button 
                      size="xs" 
                      variant="secondary"
                      disabled={isLoading}
                      onClick={() => handleAction(t.id, "return")}
                      className="h-7 px-3 text-[8px] font-black uppercase border-2 border-black"
                    >
                      Kembali <RotateCcw size={10} className="ml-1.5" strokeWidth={3} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center">
                 <div className="flex flex-col items-center justify-center space-y-3 opacity-20">
                    <Inbox size={40} strokeWidth={1} />
                    <p className="text-[9px] font-black uppercase tracking-widest">Data Kosong</p>
                 </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </motion.div>
  );

  return (
    <Tabs defaultValue="pending" className="w-full">
      <div className="bg-[#F3F4F6] border-b-4 border-black p-1 md:p-2">
        <TabsList className="grid grid-cols-3 gap-1 md:gap-3 bg-transparent h-auto p-0">
          <TabsTrigger 
            value="pending" 
            className="h-10 md:h-12 px-2 md:px-6 rounded-none border-2 border-black bg-white data-[state=active]:bg-[#FFD033] data-[state=active]:neo-shadow data-[state=active]:-translate-y-0.5 md:data-[state=active]:-translate-y-1 transition-all flex items-center justify-center gap-1.5 md:gap-3"
          >
            <AlertCircle size={12} strokeWidth={3} className="text-black shrink-0" />
            <span className="font-black uppercase text-[8px] md:text-[10px] tracking-tighter md:tracking-widest truncate">Menunggu</span>
            <span className="bg-black text-white text-[7px] md:text-[8px] font-black px-1 md:px-1.5 py-0.5 rounded-full shrink-0">{pending.length}</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="active" 
            className="h-10 md:h-12 px-2 md:px-6 rounded-none border-2 border-black bg-white data-[state=active]:bg-[#A388EE] data-[state=active]:neo-shadow data-[state=active]:-translate-y-0.5 md:data-[state=active]:-translate-y-1 transition-all flex items-center justify-center gap-1.5 md:gap-3"
          >
            <CheckCircle2 size={12} strokeWidth={3} className="text-black shrink-0" />
            <span className="font-black uppercase text-[8px] md:text-[10px] tracking-tighter md:tracking-widest truncate">Dipinjam</span>
            <span className="bg-black text-white text-[7px] md:text-[8px] font-black px-1 md:px-1.5 py-0.5 rounded-full shrink-0">{approved.length}</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="all" 
            className="h-10 md:h-12 px-2 md:px-6 rounded-none border-2 border-black bg-white data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:neo-shadow data-[state=active]:-translate-y-0.5 md:data-[state=active]:-translate-y-1 transition-all flex items-center justify-center gap-1.5 md:gap-3"
          >
            <History size={12} strokeWidth={3} className="shrink-0" />
            <span className="font-black uppercase text-[8px] md:text-[10px] tracking-tighter md:tracking-widest truncate">Riwayat</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="bg-white">
        <TabsContent value="pending" className="mt-0 outline-none">
          <TransactionTable data={pending} />
        </TabsContent>
        <TabsContent value="active" className="mt-0 outline-none">
          <TransactionTable data={approved} />
        </TabsContent>
        <TabsContent value="all" className="mt-0 outline-none">
          <TransactionTable data={all} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
