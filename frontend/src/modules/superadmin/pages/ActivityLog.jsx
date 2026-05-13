import React from "react";
import { Activity, Building2, CreditCard, AlertTriangle, Ticket, Users, ShieldAlert, Settings, ArrowUpRight } from "lucide-react";

const activities = [
  { action: "New Business Registered", detail: "Fresh Farm Dairy — Anita Desai (Ahmedabad)", time: "2 min ago", type: "business", icon: Building2 },
  { action: "Subscription Upgraded", detail: "Sharma Traders: Silver → Gold plan", time: "15 min ago", type: "subscription", icon: CreditCard },
  { action: "Payment Failed", detail: "Quick Bites Cafe — ₹2,388 (UPI timeout)", time: "1 hr ago", type: "payment", icon: AlertTriangle },
  { action: "Business Suspended", detail: "Gupta & Sons — Policy violation detected", time: "3 hrs ago", type: "security", icon: ShieldAlert },
  { action: "Support Ticket Opened", detail: "#TKT-892 — Invoice generation issue", time: "5 hrs ago", type: "support", icon: Ticket },
  { action: "New User Added", detail: "Staff: Priya Singh → Green Mart", time: "6 hrs ago", type: "user", icon: Users },
  { action: "New Business Registered", detail: "Krishna Stores — Vikram Reddy (Hyderabad)", time: "8 hrs ago", type: "business", icon: Building2 },
  { action: "Plan Downgraded", detail: "Patel Electronics: Gold → Silver", time: "12 hrs ago", type: "subscription", icon: CreditCard },
  { action: "Suspicious Login Detected", detail: "Unknown IP 103.24.56.78 → vikram@krishna.com", time: "14 hrs ago", type: "security", icon: ShieldAlert },
  { action: "Settings Updated", detail: "SuperAdmin changed SMTP configuration", time: "1 day ago", type: "settings", icon: Settings },
  { action: "Support Ticket Resolved", detail: "#TKT-887 — Data export issue fixed", time: "1 day ago", type: "support", icon: Ticket },
  { action: "Subscription Renewed", detail: "Royal Fabrics — Gold plan (₹2,988)", time: "2 days ago", type: "subscription", icon: CreditCard },
  { action: "Business Reactivated", detail: "Gupta & Sons — Suspension lifted", time: "2 days ago", type: "business", icon: Building2 },
  { action: "New Business Registered", detail: "Metro Fresh — Sanjay Mehta (Chennai)", time: "3 days ago", type: "business", icon: Building2 },
  { action: "Payment Refunded", detail: "Gupta & Sons — ₹2,988 (Card refund)", time: "3 days ago", type: "payment", icon: AlertTriangle },
];

const typeStyles = {
  business: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400" },
  subscription: { bg: "bg-emerald-500/15", text: "text-emerald-400", dot: "bg-emerald-400" },
  payment: { bg: "bg-rose-500/15", text: "text-rose-400", dot: "bg-rose-400" },
  security: { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-400" },
  support: { bg: "bg-purple-500/15", text: "text-purple-400", dot: "bg-purple-400" },
  user: { bg: "bg-cyan-500/15", text: "text-cyan-400", dot: "bg-cyan-400" },
  settings: { bg: "bg-slate-500/15", text: "text-slate-400", dot: "bg-slate-400" },
};

export function ActivityLog() {
  const today = activities.filter(a => a.time.includes("min") || a.time.includes("hr"));
  const earlier = activities.filter(a => a.time.includes("day"));

  const renderSection = (title, items) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
        <div className="flex-1 h-px bg-white/8" />
      </div>
      <div className="space-y-1">
        {items.map((item, i) => {
          const style = typeStyles[item.type] || typeStyles.business;
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-start gap-3 rounded-xl p-3 hover:bg-white/3 transition-colors group">
              <div className="relative mt-0.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.bg}`}>
                  <Icon className={`h-4 w-4 ${style.text}`} />
                </div>
                {i < items.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-white/8" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{item.action}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.detail}</p>
              </div>
              <span className="text-[10px] text-slate-600 shrink-0 whitespace-nowrap pt-1">{item.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="h-6 w-6 text-emerald-400" /> Activity Log
        </h1>
        <p className="text-sm text-slate-500 mt-1">Complete timeline of all platform events and actions.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { l: "Total Events", v: activities.length, c: "text-white" },
          { l: "Business Events", v: activities.filter(a => a.type === "business").length, c: "text-blue-400" },
          { l: "Security Events", v: activities.filter(a => a.type === "security").length, c: "text-amber-400" },
          { l: "Subscription Events", v: activities.filter(a => a.type === "subscription").length, c: "text-emerald-400" },
        ].map(k => (
          <div key={k.l} className="rounded-2xl border border-white/8 p-4" style={{ background: "oklch(0.19 0.035 257)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{k.l}</p>
            <p className={`mt-2 text-2xl font-bold ${k.c}`}>{k.v}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-white/8 p-5 space-y-6" style={{ background: "oklch(0.19 0.035 257)" }}>
        {renderSection("Today", today)}
        {renderSection("Earlier", earlier)}
      </div>
    </div>
  );
}
