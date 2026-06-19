import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Save, Shield, Building2 } from "lucide-react";
import { toast } from "sonner";
import { mockAuth } from "@/lib/auth-store";
import api from "@/lib/api";

export function SASettings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
  });
  
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/admin/profile");
      setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        businessName: res.data.businessName || "",
      });
    } catch (error) {
      toast.error("Failed to load profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (key, val) => {
    setProfile((prev) => ({ ...prev, [key]: val }));
  };

  const handlePasswordChange = (key, val) => {
    setPasswords((prev) => ({ ...prev, [key]: val }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!profile.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (passwords.newPassword) {
      if (!passwords.currentPassword) {
        toast.error("Current password is required to change password");
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      if (passwords.newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        businessName: profile.businessName,
      };

      if (passwords.newPassword) {
        payload.currentPassword = passwords.currentPassword;
        payload.newPassword = passwords.newPassword;
      }

      const res = await api.put("/admin/profile", payload);
      toast.success("Profile updated successfully!");
      
      // Update local storage session cache to sync UI elements (like topbar, profile cards)
      mockAuth.updateUser({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        businessName: res.data.businessName
      });
      
      // Clear password fields
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      // Update local state in case response had normalization
      setProfile({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        businessName: res.data.businessName || "",
      });
    } catch (error) {
      const errMsg = error.response?.data?.message || "Failed to update profile";
      toast.error(errMsg);
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-emerald-400" /> Admin Profile Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account details and security settings.</p>
        </div>
      </div>

      <form onSubmit={onSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Card */}
        <div className="rounded-2xl border border-white/8 p-6 flex flex-col justify-between" style={{ background: "oklch(0.19 0.035 257)" }}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/8 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
                <Shield className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Personal Information</h3>
                <p className="text-xs text-slate-500">Update your public details and contact info</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleProfileChange("name", e.target.value)}
                    placeholder="Enter full name"
                    className="w-full h-10 pl-10 pr-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className="w-full h-10 pl-10 pr-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full h-10 pl-10 pr-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Business Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building2 className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    value={profile.businessName}
                    onChange={(e) => handleProfileChange("businessName", e.target.value)}
                    placeholder="Enter business name"
                    className="w-full h-10 pl-10 pr-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="rounded-2xl border border-white/8 p-6 flex flex-col justify-between" style={{ background: "oklch(0.19 0.035 257)" }}>
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/8 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15">
                <Lock className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Change Password</h3>
                <p className="text-xs text-slate-500">Secure your admin account credentials</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                    placeholder="Enter current password"
                    className="w-full h-10 pl-10 pr-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-10 pl-10 pr-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </span>
                  <input
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full h-10 pl-10 pr-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 text-sm font-semibold transition-colors w-full sm:w-auto justify-center"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving Changes..." : "Save Profile Details"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
