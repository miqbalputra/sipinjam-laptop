"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Search, FileText, MessageSquare, ChevronRight, ChevronLeft, CheckCircle2, HelpCircle } from "lucide-react";

const steps = [
  {
    title: "Login Keamanan",
    description: "Masukkan PIN statis yang diberikan sekolah untuk mengakses sistem peminjaman.",
    icon: <Key className="w-8 h-8 text-black" strokeWidth={3} />,
    color: "bg-[#A388EE]",
  },
  {
    title: "Cek Ketersediaan",
    description: "Lihat daftar laptop yang tersedia secara real-time di dashboard utama.",
    icon: <Search className="w-8 h-8 text-black" strokeWidth={3} />,
    color: "bg-[#FFD033]",
  },
  {
    title: "Isi Formulir",
    description: "Pilih nama Anda, laptop yang tersedia, dan tentukan tujuan peminjaman.",
    icon: <FileText className="w-8 h-8 text-black" strokeWidth={3} />,
    color: "bg-[#FFFFFF]",
  },
  {
    title: "Konfirmasi WA",
    description: "Admin akan menerima notifikasi. Anda akan mendapatkan pesan WA jika disetujui.",
    icon: <MessageSquare className="w-8 h-8 text-black" strokeWidth={3} />,
    color: "bg-[#FF5252]",
  },
];

export default function InteractiveGuide() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <Dialog>
      <DialogTrigger className="h-9 gap-2 px-4 border-2 border-black bg-white text-black font-black uppercase text-[10px] tracking-widest neo-shadow hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center">
        <HelpCircle size={14} strokeWidth={3} /> Panduan
      </DialogTrigger>
      <DialogContent className="bg-white border-4 border-black text-black max-w-sm rounded-[5px] neo-shadow-lg p-0 overflow-hidden">
        <DialogHeader className="bg-[#A388EE] p-5 border-b-4 border-black">
          <DialogTitle className="text-lg font-black uppercase tracking-tighter text-center">
            Alur Peminjaman
          </DialogTitle>
        </DialogHeader>

        <div className="relative p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center text-center space-y-5"
            >
              <div className={`w-16 h-16 border-2 border-black ${steps[currentStep].color} flex items-center justify-center neo-shadow-sm`}>
                {steps[currentStep].icon}
              </div>
              
              <div className="space-y-2">
                <div className="text-zinc-400 text-[9px] font-black uppercase tracking-[0.2em]">
                  Langkah {currentStep + 1} / {steps.length}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">{steps[currentStep].title}</h3>
                <p className="text-zinc-500 font-bold text-xs leading-relaxed px-2">
                  {steps[currentStep].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stepper dots */}
          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 border-2 border-black transition-all duration-300 ${
                  i === currentStep ? "w-8 bg-[#FFD033]" : "w-2 bg-white"
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t-2 border-black/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className="px-4 h-10 border-2 border-black text-[10px] font-black uppercase"
            >
              <ChevronLeft className="mr-1 w-4 h-4" strokeWidth={3} /> Prev
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
                className="bg-[#A388EE] px-6 h-10 text-[10px] font-black uppercase text-black"
              >
                Selesai <CheckCircle2 className="ml-2 w-4 h-4" strokeWidth={3} />
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="bg-[#A388EE] px-6 h-10 text-[10px] font-black uppercase text-black"
              >
                Next <ChevronRight className="ml-2 w-4 h-4" strokeWidth={3} />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
