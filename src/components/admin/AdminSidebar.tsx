"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Laptop as LaptopIcon, 
  History, 
  Settings, 
  LogOut,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin", color: "bg-[#FFD033]" },
  { icon: Users, label: "Data Guru", href: "/admin/teachers", color: "bg-[#A388EE]" },
  { icon: LaptopIcon, label: "Inventaris", href: "/admin/laptops", color: "bg-[#FFD033]" },
  { icon: History, label: "Laporan", href: "/admin/reports", color: "bg-[#A388EE]" },
  { icon: Settings, label: "Pengaturan", href: "/admin/settings", color: "bg-[#FFFFFF]" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#F3F4F6] border-r-4 border-black flex flex-col hidden lg:flex h-screen sticky top-0 overflow-hidden">
      {/* Header Profile */}
      <div className="p-8 border-b-4 border-black bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#A388EE] border-2 border-black flex items-center justify-center neo-shadow-sm rotate-3">
            <ShieldCheck size={24} strokeWidth={3} className="text-black" />
          </div>
          <div>
             <h2 className="font-black uppercase tracking-tighter text-lg leading-tight">Admin Panel</h2>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SIPL Dashboard v2</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block group"
            >
              <div className={cn(
                "flex items-center justify-between px-5 py-4 border-2 border-black font-black uppercase text-[11px] tracking-widest transition-all rounded-[5px] relative overflow-hidden",
                isActive 
                  ? "bg-white translate-x-1 -translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                  : "bg-white hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              )}>
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className={cn("absolute left-0 top-0 bottom-0 w-2", item.color)} 
                  />
                )}
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={cn(
                    "w-8 h-8 border-2 border-black flex items-center justify-center neo-shadow-sm transition-transform group-hover:rotate-6",
                    isActive ? item.color : "bg-zinc-50"
                  )}>
                    <item.icon size={16} strokeWidth={3} className="text-black" />
                  </div>
                  <span className={isActive ? "text-black" : "text-zinc-600"}>{item.label}</span>
                </div>

                {isActive && <ChevronRight size={16} strokeWidth={3} className="text-black" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="p-8 border-t-4 border-black bg-white">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center justify-center gap-3 px-5 py-4 border-2 border-black bg-black text-white font-black uppercase text-[11px] tracking-widest neo-shadow hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all rounded-[5px] active:translate-x-0 active:translate-y-0 active:shadow-none"
        >
          <LogOut size={18} strokeWidth={3} />
          Logout Akun
        </button>
      </div>
    </aside>
  );
}
