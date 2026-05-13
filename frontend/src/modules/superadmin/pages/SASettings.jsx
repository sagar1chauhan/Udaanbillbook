import React, { useState } from "react";
import { Settings, Globe, Mail, CreditCard, Shield, Bell, Palette, ToggleLeft, ToggleRight, Save, Key } from "lucide-react";
import { toast } from "sonner";

const sections = [
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
  {
    title: "Security Policies",
    icon: Shield,
    settings: [
      { label: "Max Login Attempts", type: "text", value: "5", key: "maxLogin" },
      { label: "Session Timeout (min)", type: "text", value: "30", key: "sessionTimeout" },
      { label: "2FA Required for Admins", type: "toggle", value: true, key: "2fa" },
      { label: "IP Whitelisting", type: "toggle", value: false, key: "ipWhitelist" },
    ],
  },
  {
    title: "Notification Settings",
    icon: Bell,
    settings: [
      { label: "New Business Alerts", type: "toggle", value: true, key: "newBizAlert" },
      { label: "Failed Payment Alerts", type: "toggle", value: true, key: "failedPayAlert" },
      { label: "Security Alerts", type: "toggle", value: true, key: "secAlert" },
      { label: "Weekly Reports", type: "toggle", value: true, key: "weeklyReports" },
    ],
  },
];

export function SASettings() {
  const [values, setValues] = useState(() => {
    const init = {};
    sections.forEach(s => s.settings.forEach(set => { init[set.key] = set.value; }));
    return init;
  });

  const update = (key, val) => setValues(prev => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-emerald-400" /> Platform Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Configure platform-wide settings, integrations, and policies.</p>
        </div>
        <button onClick={() => toast.success("Settings saved successfully!")}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold transition-colors">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      <div className="space-y-4">
        {sections.map(section => {
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
                        value={values[setting.key]}
                        onChange={e => update(setting.key, e.target.value)}
                        className="w-64 h-9 rounded-xl px-3 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-right"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* API Keys */}
      <div className="rounded-2xl border border-white/8 p-5" style={{ background: "oklch(0.19 0.035 257)" }}>
        <div className="flex items-center gap-3 mb-4">
          <Key className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">API Keys</h3>
        </div>
        <div className="space-y-3">
          {[
            { name: "Production API Key", key: "pk_live_xxxxxxxxxxxxxxxx", created: "12 Jan 2024" },
            { name: "Development API Key", key: "pk_test_xxxxxxxxxxxxxxxx", created: "12 Jan 2024" },
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
  );
}
