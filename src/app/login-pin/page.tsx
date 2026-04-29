"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowRight, Loader2, ShieldAlert } from "lucide-react";

export default function LoginPinPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(data.message || "PIN SALAH!");
      }
    } catch (err) {
      setError("KESALAHAN SISTEM!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#A388EE] p-6 selection:bg-[#FFD033]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white border-4 border-black p-8 md:p-10 neo-shadow-lg space-y-8 rounded-[5px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#FFD033] border-4 border-black flex items-center justify-center neo-shadow-sm rotate-3">
              <Lock className="text-black w-8 h-8" strokeWidth={3} />
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-black uppercase tracking-tighter">KEAMANAN</h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest underline decoration-black decoration-2 underline-offset-4">Masukkan PIN Akses Sekolah</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="bg-[#F0F0F0] border-2 border-black h-16 text-center text-3xl font-black tracking-[0.4em] focus:ring-0 focus:border-black transition-all rounded-[5px] placeholder:text-zinc-300"
                maxLength={6}
                required
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#FF5252] border-2 border-black p-2.5 flex items-center justify-center gap-2 text-white font-black uppercase text-[10px] neo-shadow-sm"
                >
                  <ShieldAlert size={14} strokeWidth={3} /> {error}
                </motion.div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-base uppercase tracking-widest bg-black text-white hover:bg-zinc-800"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <div className="flex items-center">
                  Buka Sistem <ArrowRight className="ml-3 w-5 h-5" strokeWidth={3} />
                </div>
              )}
            </Button>
          </form>

          <div className="pt-6 border-t-2 border-black text-center">
            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
              SistemFlow • SiPinjam v2.0
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">
             Authorized Personnel Only
           </p>
        </div>
      </motion.div>
    </div>
  );
}
