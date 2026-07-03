import React, { useState, useEffect } from "react";
import { CreditCard, TrendingUp, Users, Check, Star, Edit2, Archive, X, Plus } from "lucide-react";
import { fmt } from "../data/mockData";
import { toast } from "sonner";
import api from "@/lib/api";

const planAccents = {
  Free: { bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30", glow: "bg-slate-500" },
  Silver: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", glow: "bg-blue-500" },
  Gold: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", glow: "bg-amber-500" },
  Enterprise: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", glow: "bg-purple-500" },
};

export function SubscriptionManager() {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    features: "",
    popular: false,
    platforms: "Mobile + Desktop",
    description: "",
    allowedTemplates: []
  });

  const fetchPlans = async () => {
    try {
      const response = await api.get("/admin/subscriptions");
      setSubscriptionPlans(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      price: "",
      features: "",
      popular: false,
      platforms: "Mobile + Desktop",
      description: "",
      allowedTemplates: ["GST Boxed", "Classic White"]
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      features: plan.features.join("\n"),
      popular: plan.popular,
      platforms: plan.platforms,
      description: plan.description || "",
      allowedTemplates: plan.allowedTemplates || []
    });
    setIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === "") {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      features: formData.features.split("\n").map(f => f.trim()).filter(Boolean),
      popular: formData.popular,
      platforms: formData.platforms,
      description: formData.description.trim(),
      allowedTemplates: formData.allowedTemplates
    };

    try {
      if (editingPlan) {
        await api.put(`/admin/subscriptions/${editingPlan.id}`, payload);
        toast.success("Plan updated successfully");
      } else {
        await api.post("/admin/subscriptions", payload);
        toast.success("Plan created successfully");
      }
      setIsOpen(false);
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save plan");
    }
  };

  const handleDelete = async (planId) => {
    if (window.confirm("Are you sure you want to delete/archive this plan?")) {
      try {
        await api.delete(`/admin/subscriptions/${planId}`);
        toast.success("Plan deleted/archived successfully");
        fetchPlans();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete plan");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const totalMRR = subscriptionPlans.reduce((sum, p) => sum + (p.monthlyRevenue || 0), 0);
  const totalSubscribers = subscriptionPlans.reduce((sum, p) => sum + (p.activeSubscribers || 0), 0);
  const arr = totalMRR * 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscription Manager</h1>
          <p className="text-sm text-slate-500 mt-1">Manage pricing plans, track MRR, and monitor subscriber health.</p>
        </div>
        <button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-1.5"
          onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" /> Create Plan
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
                      onClick={() => handleOpenEdit(plan)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Delete"
                      onClick={() => handleDelete(plan.id)}>
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
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs">
                      <Check className={`h-3.5 w-3.5 shrink-0 ${accent.text}`} />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.allowedTemplates && plan.allowedTemplates.length > 0 && (
                  <div className="border-t border-white/5 pt-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">Templates allowed</p>
                    <div className="flex flex-wrap gap-1">
                      {plan.allowedTemplates.map(t => (
                        <span key={t} className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-slate-400">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Glow */}
              <div className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-10 blur-2xl ${accent.glow}`} />
            </div>
          );
        })}
      </div>

      {/* Create / Edit Plan Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden"
            style={{ background: "oklch(0.19 0.035 257)" }}
          >
            <button className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">
              {editingPlan ? `Edit Plan: ${editingPlan.name}` : "Create New Plan"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Price (₹ / month) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 299"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Platforms</label>
                  <select
                    className="w-full bg-[#181d2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={formData.platforms}
                    onChange={(e) => setFormData({ ...formData, platforms: e.target.value })}
                  >
                    <option value="Mobile Only">Mobile Only</option>
                    <option value="Mobile + Desktop">Mobile + Desktop</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief description of the plan"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Templates Access Selection Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Allowed Bill Templates</label>
                <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl border border-white/10 max-h-36 overflow-y-auto">
                  {[
                    "GST Boxed", "Classic White", "Modern Green", "Stylish Blue", "Minimalist",
                    "Crimson Rose", "Warm Amber", "Royal Purple", "Charcoal Dark", "Tally Classic"
                  ].map((tpl) => {
                    const isChecked = formData.allowedTemplates.includes(tpl);
                    const handleToggleTemplate = () => {
                      if (isChecked) {
                        setFormData({
                          ...formData,
                          allowedTemplates: formData.allowedTemplates.filter(t => t !== tpl)
                        });
                      } else {
                        setFormData({
                          ...formData,
                          allowedTemplates: [...formData.allowedTemplates, tpl]
                        });
                      }
                    };
                    return (
                      <label key={tpl} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                          checked={isChecked}
                          onChange={handleToggleTemplate}
                        />
                        {tpl}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Features (One per line) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Unlimited Invoices&#10;Advanced GST Reports&#10;Desktop Access"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="popular"
                  className="rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                  checked={formData.popular}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                />
                <label htmlFor="popular" className="text-xs font-semibold text-slate-300 select-none cursor-pointer">
                  Mark as Most Popular plan
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold transition-colors"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
