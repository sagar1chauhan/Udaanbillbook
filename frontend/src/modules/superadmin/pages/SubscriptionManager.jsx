import React from "react";
import { CreditCard, TrendingUp, Users, Check, Star, Edit2, Archive } from "lucide-react";
import { subscriptionPlans, fmt } from "../data/mockData";
import { toast } from "sonner";

const planAccents = {
  Free: { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30", glow: "bg-slate-500" },
  Silver: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", glow: "bg-blue-500" },
  Gold: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", glow: "bg-amber-500" },
  Enterprise: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", glow: "bg-purple-500" },
};

export function SubscriptionManager() {
  const totalMRR = subscriptionPlans.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  const totalSubscribers = subscriptionPlans.reduce((sum, p) => sum + p.activeSubscribers, 0);
  const arr = totalMRR * 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscription Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Manage pricing plans, track MRR, and monitor subscriber health.</p>
        </div>
        <button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold transition-colors"
          onClick={() => toast.info("Create plan modal coming soon")}>
          + Create Plan
        </button>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Monthly Recurring Revenue (MRR)", value: fmt(totalMRR), icon: TrendingUp, color: "emerald" },
          { label: "Annual Recurring Revenue (ARR)", value: fmt(arr), icon: CreditCard, color: "blue" },
          { label: "Total Paid Subscribers", value: totalSubscribers.toLocaleString(), icon: Users, color: "purple" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-white/8 p-5 relative overflow-hidden"
            style={{ background: "oklch(0.19 0.035 257)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold text-white tracking-tight">{kpi.value}</p>
            <div className={`absolute -bottom-4 -right-4 h-20 w-20 rounded-full opacity-15 blur-2xl bg-${kpi.color}-500`} />
          </div>
        ))}
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {subscriptionPlans.map((plan) => {
          const accent = planAccents[plan.name] || planAccents.Free;
          return (
            <div key={plan.id} className={`relative rounded-2xl border ${plan.popular ? "border-emerald-500/40" : "border-white/8"} p-5 flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5`}
              style={{ background: "oklch(0.19 0.035 257)" }}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg shadow-emerald-500/25">
                    <Star className="h-3 w-3" /> MOST POPULAR
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-4 mt-1">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${accent.bg} ${accent.text}`}>
                    {plan.name}
                  </span>
                  <div className="flex gap-1">
                    <button className="rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors" title="Edit"
                      onClick={() => toast.info(`Editing ${plan.name} plan`)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded-lg p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors" title="Archive"
                      onClick={() => toast.warning(`${plan.name} plan archived`)}>
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-white">
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="ml-1 text-sm text-slate-500">/month</span>}
                </div>
                {plan.price > 0 && (
                  <p className="text-[11px] text-slate-500 mt-1">₹{plan.price * 12}/year when billed annually</p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-white/3 border border-white/5">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Subscribers</p>
                  <p className="text-sm font-bold text-white mt-0.5">{plan.activeSubscribers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">MRR</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">{fmt(plan.monthlyRevenue)}</p>
                </div>
              </div>

              {/* Features */}
              <div className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs">
                      <Check className={`h-3.5 w-3.5 shrink-0 ${accent.text}`} />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Glow */}
              <div className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-10 blur-2xl ${accent.glow}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
