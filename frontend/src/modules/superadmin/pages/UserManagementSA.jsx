import React, { useState } from "react";
import { Search, Users, Ban, CheckCircle2, Eye, Mail, Phone, Monitor, Clock, Shield } from "lucide-react";
import { toast } from "sonner";

const allUsers = [
  { id: 1, name: "Rahul Sharma", email: "rahul@sharmatraders.com", phone: "+91 98765 43210", business: "Sharma Traders", role: "Admin", status: "Active", lastLogin: "2 min ago", device: "Chrome / Windows", sessions: 3 },
  { id: 2, name: "Priya Singh", email: "priya@greenmart.com", phone: "+91 98765 12345", business: "Green Mart", role: "Admin", status: "Active", lastLogin: "15 min ago", device: "Safari / iOS", sessions: 1 },
  { id: 3, name: "Amit Patel", email: "amit@patelelectronics.com", phone: "+91 98765 67890", business: "Patel Electronics", role: "Admin", status: "Active", lastLogin: "1 hr ago", device: "Chrome / Android", sessions: 2 },
  { id: 4, name: "Vikram Reddy", email: "vikram@krishna.com", phone: "+91 98765 99999", business: "Krishna Stores", role: "Admin", status: "Banned", lastLogin: "5 days ago", device: "Firefox / Windows", sessions: 0 },
  { id: 5, name: "Meera Nair", email: "meera@quickbites.com", phone: "+91 98765 22222", business: "Quick Bites Cafe", role: "Staff", status: "Active", lastLogin: "30 min ago", device: "Chrome / macOS", sessions: 1 },
  { id: 6, name: "Suresh Gupta", email: "suresh@guptasons.com", phone: "+91 98765 11111", business: "Gupta & Sons", role: "Admin", status: "Active", lastLogin: "3 hrs ago", device: "Edge / Windows", sessions: 1 },
  { id: 7, name: "Deepak Joshi", email: "deepak@royalfabrics.com", phone: "+91 98765 33333", business: "Royal Fabrics", role: "Staff", status: "Active", lastLogin: "45 min ago", device: "Chrome / Android", sessions: 2 },
  { id: 8, name: "Anita Desai", email: "anita@freshfarm.com", phone: "+91 98765 44444", business: "Fresh Farm Dairy", role: "Admin", status: "Active", lastLogin: "1 day ago", device: "Safari / iOS", sessions: 1 },
];

const statusStyles = {
  Active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Banned: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

export function UserManagementSA() {
  const [search, setSearch] = useState("");
  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.business.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2"><Users className="h-6 w-6 text-emerald-400" /> User Management</h1>
          <p className="text-sm text-slate-500 mt-1">{allUsers.length} users across all businesses</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Total Users", v: allUsers.length, icon: Users, c: "blue" },
          { l: "Active Now", v: allUsers.filter(u => u.status === "Active").length, icon: CheckCircle2, c: "emerald" },
          { l: "Banned", v: allUsers.filter(u => u.status === "Banned").length, icon: Ban, c: "rose" },
          { l: "Admins", v: allUsers.filter(u => u.role === "Admin").length, icon: Shield, c: "purple" },
        ].map(k => (
          <div key={k.l} className="rounded-2xl border border-white/8 p-4" style={{ background: "oklch(0.19 0.035 257)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{k.l}</p>
            <p className="mt-2 text-2xl font-bold text-white">{k.v}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input type="text" placeholder="Search users by name, email, business..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-10 rounded-xl pl-9 pr-4 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "oklch(0.19 0.035 257)" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["User", "Business", "Role", "Status", "Last Login", "Device", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-xs font-bold text-blue-400">
                        {u.name.split(" ").map(w => w[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{u.name}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{u.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-300">{u.business}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-semibold ${u.role === "Admin" ? "text-purple-400" : "text-slate-400"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusStyles[u.status] || ""}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === "Active" ? "bg-emerald-400" : "bg-rose-400"}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500"><Clock className="h-3 w-3" />{u.lastLogin}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500"><Monitor className="h-3 w-3" />{u.device}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      <button className="rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors" title="View"><Eye className="h-3.5 w-3.5" /></button>
                      {u.status === "Active" ? (
                        <button className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Ban" onClick={() => toast.warning(`${u.name} banned`)}><Ban className="h-3.5 w-3.5" /></button>
                      ) : (
                        <button className="rounded-lg p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Unban" onClick={() => toast.success(`${u.name} unbanned`)}><CheckCircle2 className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
