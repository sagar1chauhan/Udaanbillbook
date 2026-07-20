import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight, FileText, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const COMPONENT_KEYS = [
  { key: "GSTBoxed", label: "GST Boxed (Tally Grid)" },
  { key: "Classic", label: "Classic White (Clean Minimal)" },
  { key: "Modern", label: "Modern (Emerald/Blue/Dark)" },
  { key: "Minimal", label: "Minimalist (Compact Mono)" },
  { key: "Business", label: "Business (Bold Header)" },
  { key: "Corporate", label: "Corporate (Professional)" },
  { key: "Professional", label: "Professional (Elegant)" },
  { key: "Retail", label: "Retail (Simple Receipt)" },
];

const PLAN_TIERS = ["Free", "Silver", "Gold", "Enterprise"];

const PREVIEW_COLORS = [
  "bg-slate-800", "bg-slate-400", "bg-slate-900", "bg-slate-700",
  "bg-rose-600", "bg-emerald-600", "bg-amber-500", "bg-purple-600",
  "bg-blue-600", "bg-indigo-600", "bg-pink-600", "bg-teal-600"
];

const PREVIEW_STYLES = [
  { key: "boxed", label: "Boxed (Grid)" },
  { key: "header-bar", label: "Header Bar" },
  { key: "minimal", label: "Minimal" },
  { key: "double-border", label: "Double Border" },
  { key: "center-header", label: "Center Header" }
];

const planColors = {
  Free: "bg-emerald-500/15 text-emerald-400",
  Silver: "bg-blue-500/15 text-blue-400",
  Gold: "bg-amber-500/15 text-amber-400",
  Enterprise: "bg-purple-500/15 text-purple-400",
};

function TemplatePreviewMini({ previewColor, previewStyle }) {
  const base = "h-10 w-16 rounded border border-white/10 bg-[#1a1f2e] flex flex-col p-0.5 space-y-0.5 overflow-hidden";

  if (previewStyle === "boxed") {
    return (
      <div className={base}>
        <div className={`h-1.5 ${previewColor} w-full rounded-sm`} />
        <div className="h-1 bg-white/10 w-2/3" />
        <div className="flex-1 border border-white/10 rounded-sm" />
      </div>
    );
  }
  if (previewStyle === "minimal") {
    return (
      <div className={`${base} justify-center`}>
        <div className={`h-0.5 ${previewColor} w-3/4`} />
        <div className="h-3 w-full space-y-0.5 mt-1">
          <div className="h-0.5 bg-white/10 w-full" />
          <div className="h-0.5 bg-white/10 w-full" />
        </div>
      </div>
    );
  }
  if (previewStyle === "double-border") {
    return (
      <div className={`${base} border-double border-4 border-white/20`}>
        <div className="h-1 bg-white/10 w-full" />
        <div className="flex-1 border-t border-white/10" />
      </div>
    );
  }
  if (previewStyle === "center-header") {
    return (
      <div className={`${base} justify-between`}>
        <div className={`h-1 ${previewColor} w-1/3 mx-auto`} />
        <div className="h-2 border-t border-b border-white/10 w-full" />
        <div className="h-1 bg-white/10 w-1/4 self-end" />
      </div>
    );
  }
  // default: header-bar
  return (
    <div className={base}>
      <div className={`h-2.5 ${previewColor} w-full rounded-sm`} />
      <div className="h-1 bg-white/10 w-1/2" />
      <div className="flex-1 border-t border-white/10" />
    </div>
  );
}

export function InvoiceTemplateManager() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    componentKey: "GSTBoxed",
    planTier: "Free",
    previewColor: "bg-slate-800",
    previewStyle: "header-bar",
    isActive: true,
    sortOrder: 0
  });

  const fetchTemplates = async () => {
    try {
      const response = await api.get("/admin/invoice-templates");
      setTemplates(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      componentKey: "GSTBoxed",
      planTier: "Free",
      previewColor: "bg-slate-800",
      previewStyle: "header-bar",
      isActive: true,
      sortOrder: templates.length + 1,
      isCustom: false,
      customHtml: ""
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (tpl) => {
    setEditingTemplate(tpl);
    setFormData({
      name: tpl.name,
      description: tpl.description || "",
      componentKey: tpl.componentKey,
      planTier: tpl.planTier,
      previewColor: tpl.previewColor || "bg-slate-800",
      previewStyle: tpl.previewStyle || "header-bar",
      isActive: tpl.isActive,
      sortOrder: tpl.sortOrder || 0,
      isCustom: tpl.isCustom || false,
      customHtml: tpl.customHtml || ""
    });
    setIsOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.componentKey) {
      toast.error("Name and Component Key are required");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      componentKey: formData.componentKey,
      planTier: formData.planTier,
      previewColor: formData.previewColor,
      previewStyle: formData.previewStyle,
      isActive: formData.isActive,
      sortOrder: Number(formData.sortOrder) || 0,
      isCustom: formData.isCustom,
      customHtml: formData.customHtml
    };

    try {
      if (editingTemplate) {
        await api.put(`/admin/invoice-templates/${editingTemplate._id}`, payload);
        toast.success("Template updated successfully");
      } else {
        await api.post("/admin/invoice-templates", payload);
        toast.success("Template created successfully");
      }
      setIsOpen(false);
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save template");
    }
  };

  const handleDownloadHtml = (tpl) => {
    if (!tpl.customHtml) {
      toast.error("No HTML content to download");
      return;
    }
    const blob = new Blob([tpl.customHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tpl.name.replace(/\s+/g, '_').toLowerCase()}_template.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete template "${name}"? This cannot be undone.`)) {
      try {
        await api.delete(`/admin/invoice-templates/${id}`);
        toast.success("Template deleted");
        fetchTemplates();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to delete template");
      }
    }
  };

  const handleToggleActive = async (tpl) => {
    try {
      await api.put(`/admin/invoice-templates/${tpl._id}`, { isActive: !tpl.isActive });
      toast.success(`Template "${tpl.name}" ${!tpl.isActive ? "enabled" : "disabled"}`);
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to toggle template status");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-emerald-400" />
            Invoice Templates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage invoice template layouts available to vendors. Add, edit, or disable templates.
          </p>
        </div>
        <button
          className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold transition-colors flex items-center gap-1.5"
          onClick={handleOpenCreate}
        >
          <Plus className="h-4 w-4" /> Add Template
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Templates", value: templates.length, color: "emerald" },
          { label: "Active Templates", value: templates.filter(t => t.isActive).length, color: "blue" },
          { label: "Free Templates", value: templates.filter(t => t.planTier === "Free").length, color: "purple" },
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((tpl) => (
          <div
            key={tpl._id}
            className={`rounded-2xl border p-5 flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/5 ${
              tpl.isActive ? "border-white/8" : "border-white/5 opacity-60"
            }`}
            style={{ background: "oklch(0.19 0.035 257)" }}
          >
            {/* Top Row: Preview + Info */}
            <div className="flex items-start gap-4 mb-4">
              <TemplatePreviewMini previewColor={tpl.previewColor} previewStyle={tpl.previewStyle} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-white truncate">{tpl.name}</h3>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${planColors[tpl.planTier] || planColors.Free}`}>
                    {tpl.planTier}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{tpl.description}</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-xl bg-white/3 border border-white/5 text-[11px]">
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Component</p>
                <p className="text-slate-300 font-medium mt-0.5">{tpl.componentKey}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Sort Order</p>
                <p className="text-slate-300 font-medium mt-0.5">{tpl.sortOrder}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Style</p>
                <p className="text-slate-300 font-medium mt-0.5">{tpl.previewStyle}</p>
              </div>
              <div>
                <p className="text-slate-500 uppercase tracking-wider font-semibold">Status</p>
                <p className={`font-medium mt-0.5 ${tpl.isActive ? "text-emerald-400" : "text-rose-400"}`}>
                  {tpl.isActive ? "Active" : "Disabled"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-auto">
              <button
                onClick={() => handleToggleActive(tpl)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  tpl.isActive
                    ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                    : "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20"
                }`}
              >
                {tpl.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                {tpl.isActive ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => handleOpenEdit(tpl)}
                className="rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              {tpl.isCustom && (
                <button
                  onClick={() => handleDownloadHtml(tpl)}
                  className="rounded-lg p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                  title="Download HTML"
                >
                  <FileText className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => handleDelete(tpl._id, tpl.name)}
                className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl relative overflow-hidden"
            style={{ background: "oklch(0.19 0.035 257)" }}
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">
              {editingTemplate ? `Edit: ${editingTemplate.name}` : "Add New Template"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Dark"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief description"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Custom HTML Upload Toggle */}
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="isCustomToggle"
                  className="rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                  checked={formData.isCustom}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({
                      ...formData,
                      isCustom: checked,
                      componentKey: checked ? "CustomHTML" : "GSTBoxed"
                    });
                  }}
                />
                <label htmlFor="isCustomToggle" className="text-xs font-semibold text-slate-400 cursor-pointer select-none">
                  Upload Custom HTML Template
                </label>
              </div>

              {formData.isCustom && (
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Upload HTML or Excel File</label>
                  <input
                    type="file"
                    accept=".html,.xlsx,.xls"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 transition-all cursor-pointer"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.name.match(/\.xlsx?$/i)) {
                          try {
                            const ExcelJS = await import('exceljs');
                            const reader = new FileReader();
                            reader.onload = async (evt) => {
                              try {
                                const data = evt.target.result;
                                const workbook = new ExcelJS.Workbook();
                                await workbook.xlsx.load(data);
                                const worksheet = workbook.worksheets[0];
                                
                                function colToInt(colLetter) {
                                  let num = 0;
                                  for (let i = 0; i < colLetter.length; i++) {
                                    num = num * 26 + (colLetter.charCodeAt(i) - 64);
                                  }
                                  return num;
                                }
                                
                                const mergeMap = {};
                                const skipCells = new Set();
                                if (worksheet.model.merges) {
                                  worksheet.model.merges.forEach(mergeRange => {
                                    const parts = mergeRange.split(':');
                                    if (parts.length === 2) {
                                      const match1 = parts[0].match(/([A-Z]+)([0-9]+)/);
                                      const match2 = parts[1].match(/([A-Z]+)([0-9]+)/);
                                      if (match1 && match2) {
                                        const c1 = colToInt(match1[1]);
                                        const r1 = parseInt(match1[2]);
                                        const c2 = colToInt(match2[1]);
                                        const r2 = parseInt(match2[2]);
                                        
                                        mergeMap[`${r1}-${c1}`] = {
                                           rowspan: r2 - r1 + 1,
                                           colspan: c2 - c1 + 1
                                        };
                                        
                                        for (let r = r1; r <= r2; r++) {
                                          for (let c = c1; c <= c2; c++) {
                                            if (r === r1 && c === c1) continue;
                                            skipCells.add(`${r}-${c}`);
                                          }
                                        }
                                      }
                                    }
                                  });
                                }

                                let htmlStr = '<table style="width:100%; border-collapse: collapse; font-family: sans-serif; font-size: 13px;">';
                                worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                                  htmlStr += '<tr>';
                                  let maxCol = worksheet.columnCount || 10;
                                  for (let c = 1; c <= maxCol; c++) {
                                    if (skipCells.has(`${rowNumber}-${c}`)) {
                                      continue;
                                    }
                                    
                                    const cell = row.getCell(c);
                                    let style = 'border: 1px solid #e2e8f0; padding: 6px;';
                                    
                                    // Add column width if available
                                    const colDef = worksheet.getColumn(c);
                                    if (colDef && colDef.width) {
                                      style += ` width: ${Math.round(colDef.width * 7.5)}px; max-width: ${Math.round(colDef.width * 7.5)}px;`;
                                    }

                                    // Background color
                                    if (cell.fill && cell.fill.type === 'pattern' && cell.fill.fgColor && cell.fill.fgColor.argb) {
                                      let argb = cell.fill.fgColor.argb;
                                      if (argb === 'FFFF0000' || argb === 'FF0000') {
                                        // Magic color: Pure Red in Excel becomes the dynamic Theme Color!
                                        style += ` background-color: var(--theme-color);`;
                                      } else if (argb.length === 8) {
                                        style += ` background-color: #${argb.substring(2)};`;
                                      }
                                    }
                                    
                                    // Font
                                    if (cell.font) {
                                      if (cell.font.bold) style += ' font-weight: bold;';
                                      if (cell.font.italic) style += ' font-style: italic;';
                                      if (cell.font.color && cell.font.color.argb && cell.font.color.argb.length === 8) {
                                         style += ` color: #${cell.font.color.argb.substring(2)};`;
                                      }
                                      if (cell.font.size) style += ` font-size: ${cell.font.size}px;`;
                                    }
                                    
                                    // Alignment
                                    if (cell.alignment) {
                                      if (cell.alignment.horizontal) style += ` text-align: ${cell.alignment.horizontal};`;
                                      if (cell.alignment.vertical) style += ` vertical-align: ${cell.alignment.vertical === 'middle' ? 'middle' : cell.alignment.vertical};`;
                                    }

                                    let val = cell.value;
                                    if (val === null || val === undefined) val = '';
                                    else if (typeof val === 'object') {
                                       if (val.richText) val = val.richText.map(rt => rt.text).join('');
                                       else if (val.formula) val = val.result !== undefined ? val.result : '';
                                       else if (val.sharedFormula) val = val.result !== undefined ? val.result : '';
                                       else val = val.toString();
                                    }
                                    
                                    // Convert newlines in text to <br/>
                                    if (typeof val === 'string') {
                                      val = val.replace(/\n/g, '<br/>');
                                    }
                                    
                                    let mergeAttrs = '';
                                    const mergeInfo = mergeMap[`${rowNumber}-${c}`];
                                    if (mergeInfo) {
                                      if (mergeInfo.colspan > 1) mergeAttrs += ` colspan="${mergeInfo.colspan}"`;
                                      if (mergeInfo.rowspan > 1) mergeAttrs += ` rowspan="${mergeInfo.rowspan}"`;
                                    }

                                    htmlStr += `<td style="${style}"${mergeAttrs}>${val}</td>`;
                                  }
                                  htmlStr += '</tr>';
                                });
                                htmlStr += '</table>';
                                
                                setFormData({ ...formData, customHtml: htmlStr });
                                toast.success("Excel converted to HTML template with styles successfully");
                              } catch (err) {
                                toast.error("Error reading Excel file content");
                                console.error(err);
                              }
                            };
                            reader.readAsArrayBuffer(file);
                          } catch (err) {
                            toast.error("Failed to load Excel parsing library");
                            console.error(err);
                          }
                        } else {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            setFormData({ ...formData, customHtml: evt.target.result });
                          };
                          reader.readAsText(file);
                        }
                      }
                    }}
                  />
                  {formData.customHtml && (
                    <div className="mt-2 text-[10px] text-emerald-400 font-mono bg-emerald-500/10 p-2 rounded truncate">
                      {formData.customHtml.length} characters of HTML loaded
                    </div>
                  )}
                </div>
              )}

              {/* Component Key + Plan Tier */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Renderer Component *</label>
                  <select
                    className="w-full bg-[#181d2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                    value={formData.componentKey}
                    onChange={(e) => setFormData({ ...formData, componentKey: e.target.value })}
                    disabled={formData.isCustom}
                  >
                    {formData.isCustom ? (
                      <option value="CustomHTML">Custom HTML (Uploaded)</option>
                    ) : (
                      COMPONENT_KEYS.map((ck) => (
                        <option key={ck.key} value={ck.key}>{ck.label}</option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Plan Tier</label>
                  <select
                    className="w-full bg-[#181d2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={formData.planTier}
                    onChange={(e) => setFormData({ ...formData, planTier: e.target.value })}
                  >
                    {PLAN_TIERS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Preview Color</label>
                <div className="flex flex-wrap gap-2">
                  {PREVIEW_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`h-7 w-7 rounded-full ${c} transition-transform hover:scale-110 ${
                        formData.previewColor === c ? "ring-2 ring-offset-2 ring-offset-[#181d2a] ring-emerald-400 scale-110" : ""
                      }`}
                      onClick={() => setFormData({ ...formData, previewColor: c })}
                    />
                  ))}
                </div>
              </div>

              {/* Preview Style + Sort Order */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Thumbnail Icon Style (For Vendor Selection)</label>
                  <select
                    className="w-full bg-[#181d2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={formData.previewStyle}
                    onChange={(e) => setFormData({ ...formData, previewStyle: e.target.value })}
                  >
                    {PREVIEW_STYLES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="rounded bg-white/5 border-white/10 text-emerald-500 focus:ring-emerald-500"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-300 select-none cursor-pointer">
                  Template is Active (visible to vendors)
                </label>
              </div>

              {/* Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">Preview</label>
                <div className="flex items-center gap-3 bg-white/3 border border-white/5 rounded-xl p-3">
                  <TemplatePreviewMini previewColor={formData.previewColor} previewStyle={formData.previewStyle} />
                  <div>
                    <p className="text-sm font-bold text-white">{formData.name || "Template Name"}</p>
                    <p className="text-[10px] text-slate-500">{formData.description || "Description"}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
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
                  {editingTemplate ? "Update Template" : "Create Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
