"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, Loader2, User, Lock, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setError("LOGIN GAGAL!");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("KESALAHAN SISTEM!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] p-6 selection:bg-[#A388EE] selection:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white border-4 border-black p-8 md:p-10 neo-shadow-lg rounded-[5px] space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-[#A388EE] border-4 border-black flex items-center justify-center neo-shadow-sm rotate-3">
              <ShieldCheck className="text-black w-6 h-6" strokeWidth={3} />
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black uppercase tracking-tighter">PORTAL ADMIN</h1>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest underline decoration-[#A388EE] decoration-2 underline-offset-4">Otoritas SiPinjam v2</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Username</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-4 h-4" strokeWidth={3} />
                  <Input
                    type="text"
                    placeholder="admin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="bg-[#F3F4F6] border-2 border-black h-12 pl-12 rounded-[5px] font-bold text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-4 h-4" strokeWidth={3} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-[#F3F4F6] border-2 border-black h-12 pl-12 rounded-[5px] font-bold text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#FF5252] border-2 border-black p-3 text-white font-black uppercase text-center text-[10px] neo-shadow-sm"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-base uppercase tracking-widest bg-black text-white hover:bg-zinc-800"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <div className="flex items-center">
                  Login Admin <ArrowRight className="ml-3 w-5 h-5" strokeWidth={3} />
                </div>
              )}
            </Button>
          </form>

          <div className="pt-6 border-t-2 border-black flex justify-center">
             <button 
                onClick={() => router.push("/")}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
             >
                <ArrowLeft size={12} strokeWidth={3} /> Kembali Ke Beranda
             </button>
          </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.2em]">
             Authorized Personnel Only
           </p>
        </div>
      </motion.div>
    </div>
  );
}
