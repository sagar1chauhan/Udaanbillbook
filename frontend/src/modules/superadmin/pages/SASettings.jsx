import React, { useState, useEffect } from "react";
// Trigger HMR cache reload
import { Settings, Globe, Mail, CreditCard, Shield, Bell, Palette, ToggleLeft, ToggleRight, Save, Key, LayoutGrid, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { platformSettings, usePlatformSettings } from "@/lib/platform-settings";

const staticSections = [
  {
    title: "Platform Settings",
    icon: Globe,
    settings: [
      { label: "Platform Name", type: "text", value: "Udaan My BillBook", key: "platformName" },
      { label: "Platform URL", type: "text", value: "https://udaan.mybillbook.com", key: "platformUrl" },
      { label: "Support Email", type: "text", value: "support@udaan.com", key: "supportEmail" },
      { label: "Maintenance Mode", type: "toggle", value: false, key: "maintenance" },
    ],
  },
  {
    title: "SMTP Configuration",
    icon: Mail,
    settings: [
      { label: "SMTP Host", type: "text", value: "smtp.gmail.com", key: "smtpHost" },
      { label: "SMTP Port", type: "text", value: "587", key: "smtpPort" },
      { label: "Sender Email", type: "text", value: "noreply@udaan.com", key: "senderEmail" },
      { label: "Email Notifications", type: "toggle", value: true, key: "emailEnabled" },
    ],
  },
  {
    title: "Payment Gateway",
    icon: CreditCard,
    settings: [
      { label: "Gateway Provider", type: "text", value: "Razorpay", key: "gateway" },
      { label: "API Key", type: "password", value: "rzp_live_xxxxxxxxxxxx", key: "gatewayKey" },
      { label: "Webhook URL", type: "text", value: "https://api.udaan.com/webhooks/razorpay", key: "webhook" },
      { label: "Test Mode", type: "toggle", value: false, key: "testMode" },
    ],
  },
];

export function SASettings() {
  const { settings, hydrated } = usePlatformSettings();
  const [values, setValues] = useState({});
  const [bizTypes, setBizTypes] = useState([]);
  const [newType, setNewType] = useState("");

  useEffect(() => {
    if (hydrated) {
      const init = {};
      staticSections.forEach(s => s.settings.forEach(set => { init[set.key] = set.value; }));
      setValues(init);
      setBizTypes(settings.businessTypes || []);
    }
  }, [hydrated, settings]);

  const update = (key, val) => setValues(prev => ({ ...prev, [key]: val }));

  const addBizType = () => {
    if (!newType.trim()) return;
    if (bizTypes.includes(newType.trim())) return toast.error("Category already exists");
    setBizTypes([...bizTypes, newType.trim()]);
    setNewType("");
  };

  const removeBizType = (type) => {
    setBizTypes(bizTypes.filter(t => t !== type));
  };

  const onSave = () => {
    platformSettings.update({ businessTypes: bizTypes });
    toast.success("Settings and categories saved successfully!");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-400" /> Platform Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure platform-wide settings, business categories, and integrations.</p>
        </div>
        <button onClick={onSave}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold transition-colors">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {staticSections.map(section => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "oklch(0.19 0.035 257)" }}>
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
                    <Icon className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {section.settings.map(setting => (
                    <div key={setting.key} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors">
                      <label className="text-sm text-slate-300 font-medium">{setting.label}</label>
                      {setting.type === "toggle" ? (
                        <button onClick={() => update(setting.key, !values[setting.key])}
                          className={`flex h-7 w-12 items-center rounded-full px-1 transition-colors ${values[setting.key] ? "bg-emerald-500" : "bg-white/10"}`}>
                          <div className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform ${values[setting.key] ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      ) : (
                        <input
                          type={setting.type === "password" ? "password" : "text"}
                          value={values[setting.key] || ""}
                          onChange={e => update(setting.key, e.target.value)}
                          className="w-48 h-9 rounded-xl px-3 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-right"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {/* Business Categories Management */}
          <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "oklch(0.19 0.035 257)" }}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15">
                <LayoutGrid className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Business Categories</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addBizType()}
                  className="flex-1 h-10 rounded-xl px-3 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <button onClick={addBizType} className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {bizTypes.map(type => (
                  <div key={type} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
                    {type}
                    <button onClick={() => removeBizType(type)} className="hover:text-red-400 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">These categories appear on the registration page.</p>
            </div>
          </div>

          {/* API Keys */}
          <div className="rounded-2xl border border-white/8 p-5" style={{ background: "oklch(0.19 0.035 257)" }}>
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Security Keys</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "Production Key", key: "pk_live_xxxxxxxxxxxxxxxx", created: "14 May 2026" },
                { name: "Development Key", key: "pk_test_xxxxxxxxxxxxxxxx", created: "14 May 2026" },
              ].map(api => (
                <div key={api.name} className="flex items-center justify-between rounded-xl bg-white/3 border border-white/5 p-3.5">
                  <div>
                    <p className="text-xs font-semibold text-white">{api.name}</p>
                    <code className="text-[11px] text-slate-500 font-mono">{api.key}</code>
                  </div>
                  <span className="text-[10px] text-slate-600">Created {api.created}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

