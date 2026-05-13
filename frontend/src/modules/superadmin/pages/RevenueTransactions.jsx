import React, { useState } from "react";
import { Search, Download, Filter, TrendingUp, ArrowUpRight, CreditCard } from "lucide-react";
import { transactions, fmt } from "../data/mockData";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const revenueBreakdown = [
  { month: "Jan", silver: 189000, gold: 156000, enterprise: 78000 },
  { month: "Feb", silver: 198000, gold: 165000, enterprise: 82000 },
  { month: "Mar", silver: 205000, gold: 172000, enterprise: 84000 },
  { month: "Apr", silver: 210000, gold: 180000, enterprise: 85000 },
  { month: "May", silver: 215000, gold: 189000, enterprise: 86000 },
  { month: "Jun", silver: 219298, gold: 193752, enterprise: 86327 },
];

const statusStyles = {
  Success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Failed: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  Refunded: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Pending: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-xl border border-white/10 px-4 py-3 text-xs shadow-2xl"
      style={{ background: "oklch(0.22 0.04 257)" }}
    >
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: <span className="font-bold">{fmt(entry.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function RevenueTransactions() {
  const [tab, setTab] = useState("overview");

  const totalRevenue = 1842500;
  const successRate = 94.2;
  const totalTransactions = transactions.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Revenue & Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">Track platform revenue, payments, and financial health.</p>
        </div>
        <button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-1.5"
          onClick={() => toast.info("Exporting CSV...")}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Revenue (This Month)", value: fmt(totalRevenue), delta: "+18.4%", up: true, icon: TrendingUp },
          { label: "Payment Success Rate", value: `${successRate}%`, delta: "+2.1%", up: true, icon: CreditCard },
          { label: "Total Transactions", value: totalTransactions.toString(), delta: "+12 this week", up: true, icon: ArrowUpRight },
        ].map((kpi) => (
          <div key={kpi.label} className="relative overflow-hidden rounded-2xl border border-white/8 p-5"
            style={{ background: "oklch(0.19 0.035 257)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold text-white tracking-tight">{kpi.value}</p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-semibold text-emerald-400">{kpi.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Breakdown Chart */}
      <div className="rounded-2xl border border-white/8 p-5" style={{ background: "oklch(0.19 0.035 257)" }}>
        <h3 className="text-sm font-semibold text-white mb-4">Revenue by Plan</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueBreakdown}>
            <defs>
              <linearGradient id="gSilver" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(1 0 0 / 6%)" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="silver" stroke="#3b82f6" strokeWidth={2} fill="url(#gSilver)" name="Silver" />
            <Area type="monotone" dataKey="gold" stroke="#f59e0b" strokeWidth={2} fill="url(#gGold)" name="Gold" />
            <Area type="monotone" dataKey="enterprise" stroke="#8b5cf6" strokeWidth={2} fill="url(#gEnt)" name="Enterprise" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "oklch(0.19 0.035 257)" }}>
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Transaction ID", "Business", "Plan", "Amount", "Method", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3.5">
                    <code className="text-xs text-slate-300 font-mono">{txn.id}</code>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-medium text-white">{txn.business}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-400">{txn.plan}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold text-white">{fmt(txn.amount)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-400">{txn.method}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusStyles[txn.status] || ""}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-slate-500">{txn.date}</span>
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
