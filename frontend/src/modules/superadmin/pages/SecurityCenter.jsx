import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, Eye, Globe, Monitor, Clock } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const severityStyles = {
  critical: { bg: "bg-rose-500/15", text: "text-rose-400", border: "border-rose-500/30", dot: "bg-rose-400" },
  warning: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-400" },
  info: { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30", dot: "bg-blue-400" },
};

export function SecurityCenter() {
  const [data, setData] = useState({
    criticalCount: 0,
    warningCount: 0,
    activeSessions: 0,
    securityLogs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        const res = await api.get("/admin/security");
        setData(res.data);
      } catch (error) {
        toast.error("Failed to load security center data");
      } finally {
        setLoading(false);
      }
    };
    fetchSecurityData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const { criticalCount, warningCount, activeSessions, securityLogs } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-emerald-400" />
          Security Center
        </h1>
        <p className="text-sm text-slate-500 mt-1">Monitor threats, audit logs, and platform security health.</p>
      </div>

      {/* Security KPIs */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {[
          { label: "Threat Level", value: criticalCount > 0 ? "Elevated" : "Normal", icon: AlertTriangle, color: criticalCount > 0 ? "amber" : "emerald", valueBg: criticalCount > 0 ? "text-amber-400" : "text-emerald-400" },
          { label: "Critical Alerts", value: criticalCount.toString(), icon: ShieldAlert, color: "rose", valueBg: "text-rose-400" },
          { label: "Warnings", value: warningCount.toString(), icon: Eye, color: "amber", valueBg: "text-amber-400" },
          { label: "Active Sessions", value: activeSessions.toString(), icon: Monitor, color: "blue", valueBg: "text-blue-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="relative overflow-hidden rounded-2xl border border-white/8 p-4 md:p-5"
            style={{ background: "oklch(0.19 0.035 257)" }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{kpi.label}</p>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${kpi.valueBg}`}>{kpi.value}</p>
            <div className={`absolute -bottom-4 -right-4 h-20 w-20 rounded-full opacity-15 blur-2xl bg-${kpi.color}-500`} />
          </div>
        ))}
      </div>

      {/* Security Logs Table */}
      <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "oklch(0.19 0.035 257)" }}>
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Security Event Log</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Auto-refresh</span>
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Severity", "Event", "User / Source", "IP Address", "Device", "Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {securityLogs.map((log) => {
                const style = severityStyles[log.severity] || severityStyles.info;
                return (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${style.bg} ${style.text} ${style.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${style.dot} ${log.severity === "critical" ? "animate-pulse" : ""}`} />
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-white">{log.event}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-300">{log.user}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <code className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-md font-mono">{log.ip}</code>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-slate-500">{log.device}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {log.time}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
