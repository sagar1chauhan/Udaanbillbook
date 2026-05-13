import React from "react";
import { Bell, Search, Moon, Sun, Command } from "lucide-react";
import { useMockAuth } from "@/lib/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function SuperAdminTopbar() {
  const { user } = useMockAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 md:px-6 backdrop-blur-xl"
      style={{
        background: "oklch(0.16 0.03 257 / 85%)",
        borderColor: "oklch(1 0 0 / 8%)"
      }}
    >
      {/* Left: Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search businesses, users, transactions..."
            className="w-full h-9 rounded-xl pl-9 pr-4 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-md bg-white/5 px-1.5 py-0.5 border border-white/10">
            <Command className="h-3 w-3 text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium">K</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-1">
            3
          </span>
        </button>

        <div className="hidden sm:flex h-8 w-px bg-white/10 mx-1" />

        <div className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-xs font-bold">
              SA
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-white leading-tight">
              {user?.name || "SuperAdmin"}
            </span>
            <span className="text-[10px] text-emerald-400 leading-tight">Platform Owner</span>
          </div>
        </div>
      </div>
    </header>
  );
}
