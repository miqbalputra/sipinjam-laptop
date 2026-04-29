"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Globe, Lock, Save, Loader2, CheckCircle2, Phone, User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsForm({ 
  initialSettings, 
  currentAdmin 
}: { 
  initialSettings: any;
  currentAdmin: { username: string };
}) {
  const [formData, setFormData] = useState({
    global_pin: initialSettings.global_pin || "",
    n8n_webhook_url: initialSettings.n8n_webhook_url || "",
    admin_phone_1: initialSettings.admin_phone_1 || "",
    admin_phone_2: initialSettings.admin_phone_2 || "",
    admin_phone_3: initialSettings.admin_phone_3 || "",
    // Security fields
    username: currentAdmin.username,
    currentPassword: "",
    newPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          global_pin: formData.global_pin,
          n8n_webhook_url: formData.n8n_webhook_url,
          admin_phone_1: formData.admin_phone_1,
          admin_phone_2: formData.admin_phone_2,
          admin_phone_3: formData.admin_phone_3,
        }),
      });

      if (res.ok) {
        setSuccess("Konfigurasi sistem berhasil disimpan!");
        router.refresh();
      }
    } catch (err) {
      alert("Gagal memperbarui pengaturan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currentPassword) {
      alert("Masukkan password saat ini untuk melakukan perubahan.");
      return;
    }
    
    setIsLoading(true);
    setSuccess("");

    try {
      const res = await fetch("/api/admin/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess("Profil admin berhasil diperbarui!");
        setFormData({ ...formData, currentPassword: "", newPassword: "" });
        router.refresh();
      } else {
        alert(data.message || "Gagal memperbarui profil.");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-[#A388EE]/10 border-2 border-[#A388EE] rounded-[5px] text-[#A388EE] font-black uppercase text-xs flex items-center gap-3 neo-shadow-sm"
        >
          <CheckCircle2 size={16} strokeWidth={3} />
          {success}
        </motion.div>
      )}

      {/* Konfigurasi Umum & WhatsApp */}
      <section className="bg-white border-4 border-black p-8 md:p-12 neo-shadow-lg rounded-[5px] space-y-10">
        <div className="flex items-center gap-4 border-b-2 border-black pb-6">
          <div className="w-10 h-10 bg-[#FFD033] border-2 border-black flex items-center justify-center neo-shadow-sm">
             <Globe className="text-black" size={20} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Integrasi & Sistem</h2>
        </div>

        <form onSubmit={handleUpdateSettings} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Webhook Notifikasi (n8n)</Label>
              <Input
                value={formData.n8n_webhook_url}
                onChange={(e) => setFormData({ ...formData, n8n_webhook_url: e.target.value })}
                className="bg-[#F3F4F6] border-2 border-black h-14 rounded-[5px] font-mono text-[10px] font-bold"
                placeholder="https://n8n.sekolah.com/webhook/..."
              />
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">URL ini digunakan untuk mengirim data peminjaman ke bot WhatsApp.</p>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">PIN Publik Statis</Label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-5 h-5" strokeWidth={3} />
                <Input
                  value={formData.global_pin}
                  onChange={(e) => setFormData({ ...formData, global_pin: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-14 pl-12 rounded-[5px] font-black text-xl tracking-widest"
                  placeholder="123456"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                 <Phone size={14} strokeWidth={3} className="text-[#A388EE]" />
                 <h3 className="text-sm font-black uppercase tracking-tighter">Nomor WhatsApp Admin (Approval)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Admin {num}</Label>
                    <Input
                      value={formData[`admin_phone_${num}` as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [`admin_phone_${num}`]: e.target.value })}
                      className="bg-[#F3F4F6] border-2 border-black h-12 rounded-[5px] font-bold text-xs"
                      placeholder="62812345..."
                    />
                  </div>
                ))}
              </div>
              <p className="text-[9px] font-bold text-zinc-400 uppercase leading-relaxed italic">
                * Nomor ini akan menerima tombol Approve/Reject dari n8n. Kosongkan jika tidak digunakan.
              </p>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={isLoading}
            className="h-16 px-10 uppercase tracking-widest text-base"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <><Save className="mr-3 w-6 h-6" strokeWidth={3} /> Simpan Konfigurasi</>}
          </Button>
        </form>
      </section>

      {/* Keamanan & Profil */}
      <section className="bg-white border-4 border-black p-8 md:p-12 neo-shadow-lg rounded-[5px] space-y-10">
        <div className="flex items-center gap-4 border-b-2 border-black pb-6">
          <div className="w-10 h-10 bg-[#FF5252] border-2 border-black flex items-center justify-center neo-shadow-sm">
             <ShieldCheck className="text-white" size={20} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Kredensial Admin</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Username Admin</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-5 h-5" strokeWidth={3} />
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-14 pl-12 rounded-[5px] font-black uppercase text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Password Baru (Opsional)</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black w-5 h-5" strokeWidth={3} />
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="bg-[#F3F4F6] border-2 border-black h-14 pl-12 rounded-[5px]"
                  placeholder="Isi hanya jika ingin ganti"
                />
              </div>
            </div>

            <div className="md:col-span-2 p-6 bg-[#FF5252]/5 border-2 border-dashed border-black rounded-[5px]">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-[#FF5252] ml-1">Konfirmasi Password Saat Ini</Label>
                  <Input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    className="bg-white border-2 border-black h-14 rounded-[5px]"
                    placeholder="Wajib diisi untuk simpan perubahan profil"
                    required={!!formData.newPassword || formData.username !== currentAdmin.username}
                  />
               </div>
            </div>
          </div>

          <Button 
            type="submit"
            disabled={isLoading}
            className="h-16 px-10 uppercase tracking-widest text-base bg-black text-white hover:bg-zinc-800"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Perbarui Akun Admin"}
          </Button>
        </form>
      </section>
    </div>
  );
}
