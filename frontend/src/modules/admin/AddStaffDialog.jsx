"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function AddStaffDialog({ open, onOpenChange, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Staff",
    permissions: ["dashboard", "billing", "inventory", "parties", "expenses", "accounting"],
  });

  const SECTIONS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "billing", label: "Billing" },
    { id: "inventory", label: "Inventory" },
    { id: "parties", label: "Parties" },
    { id: "expenses", label: "Expenses" },
    { id: "accounting", label: "Accounting" },
    { id: "gst", label: "GST & Tax" },
    { id: "reports", label: "Reports" },
  ];

  const handleCheckboxChange = (sectionId, checked) => {
    setFormData((prev) => {
      const updated = checked
        ? [...prev.permissions, sectionId]
        : prev.permissions.filter((id) => id !== sectionId);
      return { ...prev, permissions: updated };
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      return toast.error("Please fill all fields");
    }

    const initials = formData.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newStaff = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role.toLowerCase(),
      status: "Active",
      joined: new Date().toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      }),
      avatar: initials,
      permissions: formData.role === "Admin" ? SECTIONS.map(s => s.id) : formData.permissions,
    };

    if (onAdd) {
      onAdd(newStaff);
    }
    toast.success(`${formData.name} added to staff members`);
    onOpenChange(false);
    setFormData({ name: "", email: "", phone: "", role: "Staff", permissions: ["dashboard", "billing", "inventory", "parties", "expenses", "accounting"] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Enter the details of the new staff member.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="add-name">Full Name</Label>
            <Input
              id="add-name"
              placeholder="e.g. Sanjay Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-email">Email Address</Label>
            <Input
              id="add-email"
              type="email"
              placeholder="sanjay@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-phone">Phone Number</Label>
            <Input
              id="add-phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(v) => setFormData({ ...formData, role: v })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin (Full Access)</SelectItem>
                <SelectItem value="Staff">Staff (Standard Access)</SelectItem>
                <SelectItem value="Viewer">Viewer (Read Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role !== "Admin" && (
            <div className="space-y-2 border-t pt-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Section Access Permissions</Label>
              <div className="grid grid-cols-2 gap-2.5 mt-2">
                {SECTIONS.map((sec) => (
                  <label key={sec.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer p-2 border rounded-xl hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(sec.id)}
                      onChange={(e) => handleCheckboxChange(sec.id, e.target.checked)}
                      className="rounded text-primary focus:ring-primary h-4 w-4"
                    />
                    {sec.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl">Add Staff Member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
