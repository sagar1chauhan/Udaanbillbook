import React from "react";
import { BarChart3, TrendingUp, Users, ArrowUpRight, Target, Activity } from "lucide-react";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt } from "../data/mockData";

const userEngagement = [
  { day: "Mon", dau: 3200, mau: 6800 }, { day: "Tue", dau: 3500, mau: 6900 },
  { day: "Wed", dau: 4100, mau: 7100 }, { day: "Thu", dau: 3800, mau: 7000 },
  { day: "Fri", dau: 4500, mau: 7200 }, { day: "Sat", dau: 2800, mau: 6500 },
  { day: "Sun", dau: 2200, mau: 6200 },
];

const conversionFunnel = [
  { stage: "Visitors", value: 42500, fill: "#3b82f6" },
  { stage: "Signups", value: 8412, fill: "#8b5cf6" },
  { stage: "Trial", value: 3240, fill: "#f59e0b" },
  { stage: "Paid", value: 1923, fill: "#10b981" },
];

const featureUsage = [
  { feature: "Billing", usage: 92 }, { feature: "Parties", usage: 85 },
  { feature: "Inventory", usage: 78 }, { feature: "Reports", usage: 68 },
  { feature: "Expenses", usage: 64 }, { feature: "GST", usage: 52 },
  { feature: "Accounting", usage: 45 },
];

const geoData = [
  { city: "Mumbai", biz: 482, rev: 892400 }, { city: "Delhi", biz: 396, rev: 724300 },
  { city: "Bangalore", biz: 354, rev: 658200 }, { city: "Pune", biz: 298, rev: 542100 },
  { city: "Hyderabad", biz: 264, rev: 468900 }, { city: "Ahmedabad", biz: 218, rev: 382400 },
];

const forecastData = [
  { m: "Jan", actual: 1245000 }, { m: "Feb", actual: 1380000 }, { m: "Mar", actual: 1520000 },
  { m: "Apr", actual: 1410000 }, { m: "May", actual: 1680000 }, { m: "Jun", actual: 1842500 },
  { m: "Jul", forecast: 1950000 }, { m: "Aug", forecast: 2080000 }, { m: "Sep", forecast: 2240000 },
];

function Tip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-white/10 px-4 py-3 text-xs shadow-2xl" style={{ background: "oklch(0.22 0.04 257)" }}>
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((e, i) => <p key={i} style={{ color: e.color }}>{e.name}: <span className="font-bold">{e.value > 100 ? fmt(e.value) : e.value}</span></p>)}
    </div>
  );
}

export function PlatformAnalytics() {
  const totalBiz = geoData.reduce((s, g) => s + g.biz, 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2"><BarChart3 className="h-6 w-6 text-emerald-400" /> Platform Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Deep insights into performance, user behavior, and growth.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {[
          { l: "Daily Active Users", v: "4,512", d: "+8.3%", icon: Users },
          { l: "Session Duration", v: "12m 34s", d: "+14.2%", icon: Activity },
          { l: "Conversion Rate", v: "4.53%", d: "+0.8%", icon: Target },
          { l: "Churn Rate", v: "2.1%", d: "-0.4%", icon: TrendingUp },
        ].map((k) => (
          <div key={k.l} className="rounded-2xl border border-white/8 p-4 md:p-5 transition-all hover:-translate-y-1" style={{ background: "oklch(0.19 0.035 257)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{k.l}</p>
            <p className="mt-2 text-2xl font-bold text-white">{k.v}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold text-emerald-400">{k.d}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <div className="rounded-2xl border border-white/8 p-5" style={{ background: "oklch(0.19 0.035 257)" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Conversion Funnel</h3>
          <div className="space-y-3">
            {conversionFunnel.map((s, i) => {
              const pct = (s.value / conversionFunnel[0].value) * 100;
              return (
                <div key={s.stage}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold text-white">{s.stage}</span>
                    <span className="text-xs text-slate-400">{s.value.toLocaleString()}{i > 0 && <span className="ml-2 text-emerald-400 font-semibold">{((s.value / conversionFunnel[i-1].value)*100).toFixed(1)}%</span>}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.fill }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Engagement */}
        <div className="rounded-2xl border border-white/8 p-5" style={{ background: "oklch(0.19 0.035 257)" }}>
          <h3 className="text-sm font-semibold text-white mb-4">User Engagement (DAU vs MAU)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userEngagement}>
              <defs>
                <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                <linearGradient id="gM" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(1 0 0 / 6%)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="mau" stroke="#8b5cf6" strokeWidth={2} fill="url(#gM)" name="MAU" />
              <Area type="monotone" dataKey="dau" stroke="#3b82f6" strokeWidth={2} fill="url(#gD)" name="DAU" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Feature Usage */}
        <div className="rounded-2xl border border-white/8 p-5" style={{ background: "oklch(0.19 0.035 257)" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Feature Usage Heatmap</h3>
          <div className="space-y-2.5">
            {featureUsage.map((f) => (
              <div key={f.feature}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-300">{f.feature}</span>
                  <span className="text-xs font-bold text-white">{f.usage}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${f.usage}%`, background: f.usage > 80 ? "#10b981" : f.usage > 60 ? "#3b82f6" : f.usage > 40 ? "#f59e0b" : "#ef4444" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Forecast */}
        <div className="rounded-2xl border border-white/8 p-5" style={{ background: "oklch(0.19 0.035 257)" }}>
          <h3 className="text-sm font-semibold text-white mb-4">Revenue Forecast (AI-Powered)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(1 0 0 / 6%)" />
              <XAxis dataKey="m" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/100000}L`} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} name="Actual" />
              <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "#f59e0b" }} name="Forecast" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geo Table */}
      <div className="rounded-2xl border border-white/8 p-5" style={{ background: "oklch(0.19 0.035 257)" }}>
        <h3 className="text-sm font-semibold text-white mb-4">Geographic Distribution</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-white/8">{["#", "City", "Businesses", "Revenue", "Share"].map(h => <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>)}</tr></thead>
            <tbody>
              {geoData.map((g, i) => (
                <tr key={g.city} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/15 text-[10px] font-bold text-blue-400">{i+1}</span></td>
                  <td className="px-4 py-3 text-sm font-semibold text-white">{g.city}</td>
                  <td className="px-4 py-3 text-sm text-slate-300">{g.biz}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-400">{fmt(g.rev)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(g.biz/totalBiz)*100}%` }} /></div>
                      <span className="text-xs text-slate-400">{((g.biz/totalBiz)*100).toFixed(1)}%</span>
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
