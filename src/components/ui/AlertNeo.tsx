import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertNeoProps {
  type: AlertType;
  title?: string;
  message: string;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

export default function AlertNeo({
  type,
  title,
  message,
  isOpen,
  onClose,
  className,
}: AlertNeoProps) {
  const config = {
    success: {
      bg: "bg-[#A3E635]",
      icon: <CheckCircle2 size={24} strokeWidth={3} />,
      defaultTitle: "BERHASIL!",
    },
    error: {
      bg: "#FF5252",
      icon: <XCircle size={24} strokeWidth={3} />,
      defaultTitle: "KESALAHAN!",
    },
    warning: {
      bg: "bg-[#FFD033]",
      icon: <AlertCircle size={24} strokeWidth={3} />,
      defaultTitle: "PERINGATAN!",
    },
    info: {
      bg: "bg-[#A388EE]",
      icon: <Info size={24} strokeWidth={3} />,
      defaultTitle: "INFO!",
    },
  };

  const current = config[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className={cn(
            "relative w-full border-4 border-black p-6 neo-shadow-lg flex items-start gap-4 rounded-[5px] overflow-hidden",
            type === "error" ? "bg-[#FF5252]" : current.bg,
            className
          )}
        >
          <div className="bg-white border-2 border-black p-2 neo-shadow-sm shrink-0">
            {current.icon}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h4 className="font-black uppercase tracking-tighter text-lg leading-none mb-1">
              {title || current.defaultTitle}
            </h4>
            <p className="text-xs font-bold leading-relaxed">
              {message}
            </p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X size={18} strokeWidth={3} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
