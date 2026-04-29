"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import AlertNeo from "@/components/ui/AlertNeo";

const formSchema = z.object({
  teacherId: z.string().min(1, { message: "Silakan pilih nama Anda." }),
  laptopId: z.string().min(1, { message: "Silakan pilih unit laptop." }),
  purpose: z.string().min(5, { message: "Tujuan minimal 5 karakter." }).max(200),
});

export default function PinjamForm({ teachers, laptops }: { teachers: any[], laptops: any[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info" | "warning";
    message: string;
  }>({
    isOpen: false,
    type: "info",
    message: "",
  });
  
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherId: undefined,
      laptopId: undefined,
      purpose: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAlertConfig({ ...alertConfig, isOpen: false });
    
    try {
      const res = await fetch("/api/pinjam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        setAlertConfig({
          isOpen: true,
          type: "success",
          message: "Pengajuan berhasil dikirim! Anda akan dialihkan dalam 3 detik.",
        });
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        const data = await res.json();
        setAlertConfig({
          isOpen: true,
          type: "error",
          message: data.message || "Gagal memproses peminjaman.",
        });
      }
    } catch (err) {
      setAlertConfig({
        isOpen: true,
        type: "error",
        message: "Terjadi kesalahan sistem. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <AlertNeo 
        isOpen={true}
        type="info"
        title="INFORMASI PENTING"
        message="Peminjaman akan berstatus PENDING hingga disetujui Admin. Anda akan menerima notifikasi WA otomatis."
      />

      <AlertNeo 
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Peminjam</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="bg-[#F3F4F6] border-2 border-black h-14 rounded-[5px] text-sm font-bold focus:ring-0">
                        <SelectValue placeholder="Pilih Nama Anda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-2 border-black rounded-[5px] neo-shadow max-h-[300px]">
                      {teachers.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {`${t.name} — ${t.division}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Pilih nama sesuai yang terdaftar di database guru.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="laptopId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Laptop</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="bg-[#F3F4F6] border-2 border-black h-14 rounded-[5px] text-sm font-bold focus:ring-0">
                        <SelectValue placeholder="Pilih Unit Tersedia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-2 border-black rounded-[5px] neo-shadow max-h-[300px]">
                      {laptops.length > 0 ? (
                        laptops.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {`${l.merk} (SN: ${l.serialNumber})`}
                          </SelectItem>
                        ))
                      ) : (
                        <p className="p-4 text-xs font-black uppercase text-red-500">Stok unit sedang kosong</p>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>Hanya unit dengan status "Tersedia" yang dapat dipinjam.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tujuan Penggunaan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Mengajar di kelas XI-A (Lab Komputer)"
                      className="bg-[#F3F4F6] border-2 border-black min-h-[120px] rounded-[5px] text-sm font-bold focus:ring-0 p-4"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Jelaskan secara singkat tujuan peminjaman unit ini.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-16 text-lg uppercase tracking-widest"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Kirim Pengajuan <Send className="ml-3 w-5 h-5" strokeWidth={3} />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
