"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Laptop as LaptopIcon, 
  History, 
  Settings,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Home", href: "/admin", color: "bg-[#FFD033]" },
  { icon: Users, label: "Guru", href: "/admin/teachers", color: "bg-[#A388EE]" },
  { icon: LaptopIcon, label: "Unit", href: "/admin/laptops", color: "bg-[#FFD033]" },
  { icon: History, label: "Laporan", href: "/admin/reports", color: "bg-[#A388EE]" },
  { icon: Settings, label: "Opsi", href: "/admin/settings", color: "bg-white" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-black px-2 pb-safe">
      <div className="flex justify-between items-center h-16 max-w-md mx-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 group relative"
            >
              <div className={cn(
                "w-10 h-10 border-2 border-black flex items-center justify-center transition-all",
                isActive 
                  ? cn(item.color, "neo-shadow -translate-y-1 scale-110") 
                  : "bg-white group-active:scale-95"
              )}>
                <item.icon size={18} strokeWidth={3} className="text-black" />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-tighter transition-all",
                isActive ? "text-black opacity-100" : "text-zinc-400"
              )}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
