import React, { useState } from "react";
import { Ticket, Clock, MessageSquare, AlertCircle, CheckCircle2, User, Search } from "lucide-react";
import { toast } from "sonner";

const tickets = [
  { id: "TKT-892", subject: "Invoice generation failing for bulk orders", business: "Sharma Traders", priority: "High", status: "Open", created: "2 hrs ago", assignee: "Support Team", messages: 4 },
  { id: "TKT-891", subject: "GST report not matching with actual data", business: "Green Mart", priority: "Critical", status: "Open", created: "4 hrs ago", assignee: "Tax Team", messages: 7 },
  { id: "TKT-890", subject: "Cannot add new staff members", business: "Patel Electronics", priority: "Medium", status: "In Progress", created: "1 day ago", assignee: "Dev Team", messages: 3 },
  { id: "TKT-889", subject: "Payment gateway timeout errors", business: "Royal Fabrics", priority: "High", status: "In Progress", created: "1 day ago", assignee: "Payments Team", messages: 8 },
  { id: "TKT-888", subject: "Request for custom invoice template", business: "Quick Bites Cafe", priority: "Low", status: "Open", created: "2 days ago", assignee: "Unassigned", messages: 2 },
  { id: "TKT-887", subject: "Data export not including all fields", business: "Fresh Farm Dairy", priority: "Medium", status: "Resolved", created: "3 days ago", assignee: "Dev Team", messages: 5 },
  { id: "TKT-886", subject: "Subscription upgrade billing issue", business: "Gupta & Sons", priority: "High", status: "Resolved", created: "4 days ago", assignee: "Billing Team", messages: 6 },
];

const priorityStyles = {
  Critical: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  High: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Medium: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Low: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const statusStyles = {
  Open: "bg-amber-500/15 text-amber-400", "In Progress": "bg-blue-500/15 text-blue-400", Resolved: "bg-emerald-500/15 text-emerald-400",
};

export function SupportTickets() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filtered = tickets.filter(t => {
    const matchesFilter = filter === "All" || t.status === filter;
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.business.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const open = tickets.filter(t => t.status === "Open").length;
  const inProg = tickets.filter(t => t.status === "In Progress").length;
  const resolved = tickets.filter(t => t.status === "Resolved").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2"><Ticket className="h-6 w-6 text-emerald-400" /> Support Tickets</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and resolve customer support requests.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Total Tickets", v: tickets.length, icon: Ticket, color: "text-blue-400" },
          { l: "Open", v: open, icon: AlertCircle, color: "text-amber-400" },
          { l: "In Progress", v: inProg, icon: Clock, color: "text-blue-400" },
          { l: "Resolved", v: resolved, icon: CheckCircle2, color: "text-emerald-400" },
        ].map(k => (
          <div key={k.l} className="rounded-2xl border border-white/8 p-4" style={{ background: "oklch(0.19 0.035 257)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{k.l}</p>
            <p className={`mt-2 text-2xl font-bold ${k.color}`}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl pl-9 pr-4 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all" />
        </div>
        <div className="flex gap-2">
          {["All", "Open", "In Progress", "Resolved"].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${filter === s ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t.id} className="rounded-2xl border border-white/8 p-4 hover:border-emerald-500/20 transition-all cursor-pointer" style={{ background: "oklch(0.19 0.035 257)" }}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-[10px] text-slate-500 font-mono">{t.id}</code>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${priorityStyles[t.priority]}`}>{t.priority}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[t.status]}`}>{t.status}</span>
                </div>
                <p className="text-sm font-semibold text-white truncate">{t.subject}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.business} · {t.created}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-500"><User className="h-3 w-3" />{t.assignee}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500"><MessageSquare className="h-3 w-3" />{t.messages}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
