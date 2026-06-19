import React, { useState, useEffect } from "react";
import { LayoutGrid, Plus, Trash2, Save, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export function BusinessCategories() {
  const [bizTypes, setBizTypes] = useState([]);
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/settings");
      setOriginalSettings(res.data || {});
      setBizTypes(res.data.businessTypes || []);
    } catch (error) {
      toast.error("Failed to load business categories from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addBizType = async () => {
    const trimmed = newType.trim();
    if (!trimmed) return;
    if (bizTypes.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      return toast.error("Category already exists");
    }
    const updated = [...bizTypes, trimmed];
    await onSave(updated);
    setNewType("");
  };

  const onSave = async (updatedTypes) => {
    try {
      setSaving(true);
      const payload = {
        ...originalSettings,
        businessTypes: updatedTypes || bizTypes
      };
      await api.put("/admin/settings", payload);
      toast.success("Business categories saved successfully!");
      if (updatedTypes) {
        setBizTypes(updatedTypes);
      }
    } catch (error) {
      toast.error("Failed to save categories to server");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    const updated = bizTypes.filter(t => t !== categoryToDelete);
    await onSave(updated);
    setCategoryToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-amber-400" /> Business Categories
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage industry classifications and categories available for new vendor registrations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "oklch(0.19 0.035 257)" }}>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15">
              <LayoutGrid className="h-4 w-4 text-amber-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Active Registration Categories</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter new business category name (e.g. Pharmacy, Hardware)..."
                value={newType}
                onChange={e => setNewType(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addBizType()}
                className="flex-1 h-11 rounded-xl px-4 text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
              />
              <button
                onClick={addBizType}
                className="h-11 px-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-semibold text-sm transition-colors"
              >
                <Plus className="h-5 w-5" /> Add Category
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Current Categories ({bizTypes.length})
              </label>
              {bizTypes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-white/2 rounded-xl border border-dashed border-white/5">
                  <AlertCircle className="h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">No business categories defined</p>
                  <p className="text-xs text-slate-600 mt-1">Add categories above to let users choose them during register.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {bizTypes.map(type => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-all group"
                    >
                      <span className="text-sm font-medium text-slate-200">{type}</span>
                      <button
                        onClick={() => setCategoryToDelete(type)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
              <p className="text-xs text-amber-300 leading-relaxed">
                <strong>Important Note:</strong> These categories will appear in the "Business type" dropdown menu on the public vendor registration page in real time. Deleting a category does not affect users who have already registered with that business type.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div 
            className="w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
            style={{ background: "oklch(0.19 0.035 257)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" /> Confirm Deletion
              </h3>
              <button 
                onClick={() => setCategoryToDelete(null)}
                className="text-slate-400 hover:text-white rounded-lg p-1 hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Are you sure you want to delete the category <span className="font-semibold text-white">"{categoryToDelete}"</span>? This will remove it from the database and registration dropdown.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-1.5"
                >
                  {saving ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
