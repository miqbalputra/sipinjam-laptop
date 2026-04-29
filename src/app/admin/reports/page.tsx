"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileDown, 
  FileText, 
  Calendar as CalendarIcon, 
  Download, 
  Loader2, 
  CheckCircle2, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap,
  Filter,
  ArrowRight
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [period, setPeriod] = useState("7d");
  const [customDates, setCustomDates] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (period !== "custom") {
       fetchStats();
    }
  }, [period]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      let url = `/api/admin/reports/stats?period=${period}`;
      if (period === "custom") {
        url += `&startDate=${customDates.start}&endDate=${customDates.end}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Gagal mengambil stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const res = await fetch("/api/admin/reports/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Laporan_SiPinjam_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      alert("Gagal mengunduh laporan Excel.");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const res = await fetch("/api/admin/reports/data");
      if (!res.ok) throw new Error("Gagal mengambil data.");
      
      const transactions = await res.json();
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("LAPORAN PEMINJAMAN LAPTOP SEKOLAH", 14, 22);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, 14, 30);
      
      autoTable(doc, {
        startY: 35,
        head: [['No', 'Peminjam', 'Divisi', 'Unit Laptop', 'Status', 'Tgl Pinjam']],
        body: transactions.map((t: any, index: number) => [
          index + 1,
          t.teacher.name,
          t.teacher.division,
          t.laptop.merk,
          t.status,
          new Date(t.borrowDate).toLocaleDateString("id-ID")
        ]),
        headStyles: { fillColor: [163, 136, 238], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 35 },
      });

      doc.save(`Laporan_SiPinjam_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      alert("Gagal membuat dokumen PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <header className="border-b-4 border-black pb-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">PELAPORAN & EKSPOR</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest ml-1">Arsip riwayat transaksi dan analisis data.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-2 neo-shadow-sm shrink-0">
                <Filter size={14} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
             </div>
             <Select value={period} onValueChange={setPeriod}>
               <SelectTrigger className="w-[140px] h-10 border-2 border-black bg-white font-bold text-xs uppercase">
                  <SelectValue placeholder="Pilih Periode" />
               </SelectTrigger>
               <SelectContent className="bg-white border-2 border-black rounded-[5px] neo-shadow">
                  <SelectItem value="7d">7 HARI</SelectItem>
                  <SelectItem value="30d">30 HARI</SelectItem>
                  <SelectItem value="90d">90 HARI</SelectItem>
                  <SelectItem value="custom">CUSTOM TGL</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </div>

        {period === "custom" && (
          <div className="bg-[#A388EE] border-4 border-black p-6 neo-shadow rounded-[5px] flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top-4 duration-300">
             <div className="flex items-center gap-4 flex-1 w-full">
                <div className="flex-1 space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-black/60 ml-1">Tgl Mulai</p>
                   <Input 
                      type="date" 
                      value={customDates.start} 
                      onChange={(e) => setCustomDates({...customDates, start: e.target.value})}
                      className="bg-white border-2 border-black h-11 font-bold text-xs"
                   />
                </div>
                <ArrowRight size={20} strokeWidth={3} className="mt-5 hidden md:block" />
                <div className="flex-1 space-y-1">
                   <p className="text-[9px] font-black uppercase tracking-widest text-black/60 ml-1">Tgl Selesai</p>
                   <Input 
                      type="date" 
                      value={customDates.end} 
                      onChange={(e) => setCustomDates({...customDates, end: e.target.value})}
                      className="bg-white border-2 border-black h-11 font-bold text-xs"
                   />
                </div>
             </div>
             <Button 
                onClick={fetchStats}
                disabled={loadingStats}
                className="h-11 px-8 uppercase tracking-widest text-xs bg-black text-white hover:bg-zinc-800 shrink-0 md:mt-5 w-full md:w-auto"
             >
                {loadingStats ? <Loader2 className="animate-spin" /> : "Terapkan Filter"}
             </Button>
          </div>
        )}
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: `Pinjam (${period === 'custom' ? 'Custom' : period})`, value: stats?.summary?.totalBorrowed || 0, icon: <BarChart3 size={18} />, color: "bg-[#A388EE]" },
          { label: "Aktif Saat Ini", value: stats?.summary?.activeBorrowed || 0, icon: <Clock size={18} />, color: "bg-[#FFD033]" },
          { label: "Unit Ready", value: stats?.summary?.availableLaptops || 0, icon: <CheckCircle2 size={18} />, color: "bg-[#FFFFFF]" },
          { label: "Maintenance", value: stats?.summary?.maintenanceCount || 0, icon: <Zap size={18} />, color: "bg-[#FF5252]" },
        ].map((item, i) => (
          <div key={i} className="bg-white border-4 border-black p-5 neo-shadow rounded-[5px] flex flex-col gap-3">
             <div className={`w-10 h-10 ${item.color} border-2 border-black flex items-center justify-center neo-shadow-sm`}>
                {item.icon}
             </div>
             <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{item.label}</p>
                <h3 className="text-2xl font-black">{item.value}</h3>
             </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="bg-white border-4 border-black p-8 md:p-10 neo-shadow-lg rounded-[5px] space-y-8">
        <div className="flex items-center gap-3 border-b-2 border-black pb-6">
           <div className="w-8 h-8 bg-black text-white border-2 border-black flex items-center justify-center">
              <TrendingUp size={16} strokeWidth={3} />
           </div>
           <h2 className="text-xl font-black uppercase tracking-tighter">Visualisasi Tren Periode</h2>
        </div>

        <div className="h-[300px] w-full">
           {loadingStats ? (
             <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[#A388EE]" size={32} strokeWidth={3} />
                <p className="text-[10px] font-black uppercase tracking-widest">Mengkalkulasi Data...</p>
             </div>
           ) : (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats?.chartData || []}>
                 <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                 <XAxis 
                   dataKey="name" 
                   axisLine={{ stroke: '#000', strokeWidth: 2 }}
                   tickLine={false}
                   tick={{ fontSize: 10, fontWeight: 900, fontFamily: 'Public Sans' }}
                 />
                 <YAxis 
                   axisLine={{ stroke: '#000', strokeWidth: 2 }}
                   tickLine={false}
                   tick={{ fontSize: 10, fontWeight: 900, fontFamily: 'Public Sans' }}
                 />
                 <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #000', 
                      borderRadius: '0px',
                      boxShadow: '4px 4px 0px 0px #000',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      fontSize: '10px'
                    }}
                 />
                 <Bar dataKey="count" radius={[0, 0, 0, 0]}>
                   {(stats?.chartData || []).map((entry: any, index: number) => (
                     <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#A388EE' : '#FFD033'} stroke="#000" strokeWidth={2} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white border-4 border-black p-10 neo-shadow-lg rounded-[5px] flex flex-col items-center text-center space-y-8 group hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
          <div className="w-20 h-20 bg-[#A388EE] border-4 border-black flex items-center justify-center neo-shadow-sm rotate-3 group-hover:rotate-0 transition-transform">
            <FileDown className="text-black" size={40} strokeWidth={2.5} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black uppercase tracking-tight">Laporan Excel</h2>
            <p className="text-zinc-500 font-bold text-xs leading-relaxed max-w-xs mx-auto">
              Format spreadsheet mentah untuk audit inventaris sekolah.
            </p>
          </div>
          <Button onClick={handleExportExcel} disabled={isExportingExcel} className="w-full h-16 text-lg uppercase tracking-widest">
            {isExportingExcel ? <Loader2 className="animate-spin" /> : <>Unduh Excel <Download className="ml-3 w-5 h-5" strokeWidth={3} /></>}
          </Button>
        </div>

        <div className="bg-white border-4 border-black p-10 neo-shadow-lg rounded-[5px] flex flex-col items-center text-center space-y-8 group hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
          <div className="w-20 h-20 bg-[#FFD033] border-4 border-black flex items-center justify-center neo-shadow-sm -rotate-3 group-hover:rotate-0 transition-transform">
            <FileText className="text-black" size={40} strokeWidth={2.5} />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black uppercase tracking-tight">Dokumen PDF</h2>
            <p className="text-zinc-500 font-bold text-xs leading-relaxed max-w-xs mx-auto">
              Dokumen resmi sekolah yang rapi untuk arsip fisik.
            </p>
          </div>
          <Button onClick={handleExportPDF} disabled={isExportingPDF} className="w-full h-16 text-lg uppercase tracking-widest bg-black text-white hover:bg-zinc-800">
            {isExportingPDF ? <Loader2 className="animate-spin" /> : <>Unduh PDF <FileText className="ml-3 w-5 h-5" strokeWidth={3} /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}
