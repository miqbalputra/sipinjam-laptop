import { CheckCircle2, Home, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full" />
          <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto relative z-10 shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 size={48} className="text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">
            PENGAJUAN <span className="text-emerald-500">BERHASIL!</span>
          </h1>
          <p className="text-zinc-500 text-lg leading-relaxed">
            Pengajuan peminjaman Anda telah terkirim. Admin akan memproses dan memberikan kabar via WhatsApp segera.
          </p>
        </div>

        <div className="pt-8 space-y-4">
          <Link href="/" className="block">
            <Button className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl border border-zinc-800 font-bold group">
              <Home className="mr-2 w-5 h-5" /> Kembali ke Beranda
            </Button>
          </Link>
          
          <div className="text-zinc-600 text-xs">
            Developer: Muhammad Iqbal Putra | Founder: SistemFlow.com
          </div>
        </div>
      </div>
    </div>
  );
}
