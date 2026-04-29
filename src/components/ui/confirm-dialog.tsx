"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Trash2, ShieldAlert, CheckCircle2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "success";
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  variant = "danger",
}: ConfirmDialogProps) {
  const variantColors = {
    danger: "bg-[#FF5252]",
    warning: "bg-[#FFD033]",
    success: "bg-[#A388EE]",
  };

  const variantIcons = {
    danger: <Trash2 size={24} strokeWidth={3} />,
    warning: <ShieldAlert size={24} strokeWidth={3} />,
    success: <CheckCircle2 size={24} strokeWidth={3} />,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-4 border-black neo-shadow-lg rounded-[5px] max-w-sm p-0 overflow-hidden">
        <div className={`${variantColors[variant]} border-b-4 border-black p-8 flex flex-col items-center gap-4 text-white`}>
           <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center neo-shadow-sm text-black">
              {variantIcons[variant]}
           </div>
           <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-center text-black">
                {title}
              </DialogTitle>
           </DialogHeader>
        </div>

        <div className="p-8 space-y-8">
           <p className="text-sm font-bold text-center uppercase leading-tight text-zinc-500">
             {description}
           </p>

           <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                className={`h-14 uppercase tracking-widest text-lg ${variant === 'danger' ? 'bg-black text-white hover:bg-zinc-800' : ''}`}
              >
                {confirmText}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-14 border-2 border-black uppercase tracking-widest font-black"
              >
                {cancelText}
              </Button>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
