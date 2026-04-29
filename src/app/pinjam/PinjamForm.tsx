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
import { Loader2, Send, CheckCircle2, Clock, MessageCircle, Home } from "lucide-react";
import AlertNeo from "@/components/ui/AlertNeo";

const formSchema = z.object({
  teacherId: z.string().min(1, { message: "Silakan pilih nama Anda." }),
  laptopId: z.string().min(1, { message: "Silakan pilih unit laptop." }),
  purpose: z.string().min(5, { message: "Tujuan minimal 5 karakter." }).max(200),
});

export default function PinjamForm({ teachers, laptops }: { teachers: any[], laptops: any[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ teacherName: string; laptopName: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

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
    setErrorMessage("");

    try {
      const res = await fetch("/api/pinjam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        const teacher = teachers.find((t) => t.id === values.teacherId);
        const laptop = laptops.find((l) => l.id === values.laptopId);
        setSuccessData({
          teacherName: teacher?.name || "Anda",
          laptopName: laptop?.merk || "Laptop",
        });
        setIsSuccess(true);
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "Gagal memproses peminjaman.");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  // ─── Layar Sukses ─────────────────────────────────────────────────────────
  if (isSuccess && successData) {
    return (
      <div className="flex flex-col items-center text-center space-y-6 py-4">
        <div
          className="w-24 h-24 rounded-full bg-green-100 border-4 border-black flex items-center justify-center"
          style={{ boxShadow: "5px 5px 0 black", animation: "pop 0.4s ease" }}
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={2.5} />
        </div>

        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Pengajuan Terkirim!</h2>
          <p className="text-sm font-bold text-gray-500 mt-1">
            Permintaan Anda sedang menunggu persetujuan Admin
          </p>
        </div>

        <div
          className="w-full border-2 border-black rounded-[5px] bg-[#F3F4F6] p-5 text-left space-y-3"
          style={{ boxShadow: "4px 4px 0 black" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">👤</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Peminjam</p>
              <p className="text-sm font-black">{successData.teacherName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">💻</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Unit Laptop</p>
              <p className="text-sm font-black">{successData.laptopName}</p>
            </div>
          </div>
        </div>

        <div
          className="w-full border-2 border-black rounded-[5px] bg-yellow-50 p-4 text-left space-y-2"
          style={{ boxShadow: "4px 4px 0 black" }}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-700 mb-3">Selanjutnya</p>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-bold text-gray-700">Admin sedang memproses pengajuan Anda</p>
          </div>
          <div className="flex items-start gap-3">
            <MessageCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-bold text-gray-700">
              Notifikasi WhatsApp akan dikirim ke nomor Anda setelah diputuskan
            </p>
          </div>
        </div>

        <Button
          onClick={() => router.push("/")}
          className="w-full h-14 text-sm uppercase tracking-widest"
        >
          <Home className="mr-2 w-4 h-4" strokeWidth={3} />
          Kembali ke Beranda
        </Button>

        <style>{`
          @keyframes pop {
            0% { transform: scale(0.5); opacity: 0; }
            70% { transform: scale(1.1); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <AlertNeo
        isOpen={true}
        type="info"
        title="INFORMASI PENTING"
        message="Peminjaman akan berstatus PENDING hingga disetujui Admin. Anda akan menerima notifikasi WA otomatis."
      />

      {errorMessage && (
        <AlertNeo
          isOpen={true}
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

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
              <><Loader2 className="animate-spin mr-2" /> Memproses...</>
            ) : (
              <>Kirim Pengajuan <Send className="ml-3 w-5 h-5" strokeWidth={3} /></>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
