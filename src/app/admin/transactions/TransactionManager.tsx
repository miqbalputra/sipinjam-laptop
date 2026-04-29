"use client";

import { useState, useEffect } from "react";
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
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { 
  RotateCcw, 
  User, 
  Laptop as LaptopIcon, 
  Clock, 
  Inbox, 
  History, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  CalendarRange,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

interface TransactionManagerProps {
  initialTransactions: any[];
}

export default function TransactionManager({ initialTransactions }: TransactionManagerProps) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteFrom, setDeleteFrom] = useState("");
  const [deleteTo, setDeleteTo] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteResult, setDeleteResult] = useState<string | null>(null);

  const router = useRouter();

  // Sync state saat server refetch data setelah router.refresh()
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

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
    } catch {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteByPeriod = async () => {
    if (!deleteFrom || !deleteTo) return;
    setDeleteLoading(true);
    setDeleteResult(null);
    try {
      const res = await fetch(
        `/api/admin/transactions?from=${deleteFrom}&to=${deleteTo}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (res.ok) {
        setDeleteResult(`✅ ${data.deleted} data peminjaman berhasil dihapus.`);
        router.refresh();
      } else {
        setDeleteResult(`❌ ${data.message || "Gagal menghapus data."}`);
      }
    } catch {
      setDeleteResult("❌ Terjadi kesalahan sistem.");
    } finally {
      setDeleteLoading(false);
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
                  {new Date(t.borrowDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: '2-digit' })}
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
    <div className="space-y-4">
      {/* ─── Panel Hapus Per Periode ──────────────────────────────────── */}
      <div className="border-2 border-black rounded-[5px] bg-red-50 p-4" style={{ boxShadow: "3px 3px 0 black" }}>
        <div className="flex items-center gap-2 mb-3">
          <CalendarRange size={16} strokeWidth={3} className="text-red-600" />
          <p className="text-[10px] font-black uppercase tracking-widest text-red-700">Hapus Data Peminjaman per Periode</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={deleteFrom}
              onChange={e => setDeleteFrom(e.target.value)}
              className="border-2 border-black rounded-[4px] px-3 py-2 text-xs font-bold bg-white focus:outline-none"
              style={{ boxShadow: "2px 2px 0 black" }}
            />
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={deleteTo}
              onChange={e => setDeleteTo(e.target.value)}
              className="border-2 border-black rounded-[4px] px-3 py-2 text-xs font-bold bg-white focus:outline-none"
              style={{ boxShadow: "2px 2px 0 black" }}
            />
          </div>
          <Button
            variant="destructive"
            disabled={!deleteFrom || !deleteTo || deleteLoading}
            onClick={() => setDeleteDialogOpen(true)}
            className="h-10 px-4 text-[10px] font-black uppercase border-2 border-black"
            style={{ boxShadow: "3px 3px 0 black" }}
          >
            {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} className="mr-1.5" strokeWidth={3} /> Hapus Data</>}
          </Button>
        </div>
        {deleteResult && (
          <p className="mt-3 text-xs font-bold text-gray-700 bg-white border-2 border-black px-3 py-2 rounded-[4px]">{deleteResult}</p>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Hapus Data Peminjaman"
        description={`Yakin ingin menghapus SEMUA data peminjaman dari ${deleteFrom} sampai ${deleteTo}? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDeleteByPeriod}
        variant="danger"
        confirmText="Ya, Hapus Semua"
      />

      {/* ─── Tabs ─────────────────────────────────────────────────────── */}
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
    </div>
  );
}
