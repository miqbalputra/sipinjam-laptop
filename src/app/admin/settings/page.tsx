import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";
import { Settings as SettingsIcon } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  // Fetch all settings
  const settings = await prisma.setting.findMany();
  const settingsObj = settings.reduce((acc: any, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  // Fetch current admin profile
  const admin = await prisma.admin.findUnique({
    where: { username: session?.user?.name || "admin" }
  });

  return (
    <div className="space-y-10">
      <header className="border-b-4 border-black pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#FFD033] border-2 border-black flex items-center justify-center neo-shadow-sm">
            <SettingsIcon size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">PENGATURAN</h1>
        </div>
        <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest ml-1">Konfigurasi sistem, keamanan, dan integrasi WhatsApp.</p>
      </header>

      <div className="max-w-4xl">
        <SettingsForm 
          initialSettings={settingsObj} 
          currentAdmin={{ username: admin?.username || "" }}
        />
      </div>
    </div>
  );
}
