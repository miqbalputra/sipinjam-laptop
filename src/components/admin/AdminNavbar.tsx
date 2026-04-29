"use client";

import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminNavbar({ session }: { session: any }) {
  return (
    <header className="h-20 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-40 px-6 lg:px-10 flex items-center justify-between">
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
          <Input 
            placeholder="Cari data..." 
            className="bg-zinc-900/50 border-zinc-800 pl-10 rounded-full h-10 w-full focus:ring-blue-500/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors border border-zinc-800">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-zinc-950" />
        </button>

        <div className="w-px h-6 bg-zinc-900" />

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{session?.user?.name}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Administrator</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center border border-blue-500/30">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
