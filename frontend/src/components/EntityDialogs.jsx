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

export function AddProductDialog({
  open, onOpenChange,
}) {
  const [f, setF] = useState({ name: "", sku: "", cat: "Grocery", price: "", stock: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
          <DialogDescription>Track stock, pricing and category.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!f.name.trim()) return toast.error("Enter product name");
            if (!f.price) return toast.error("Enter price");
            toast.success(`${f.name} added to inventory`);
            onOpenChange(false);
            setF({ name: "", sku: "", cat: "Grocery", price: "", stock: "" });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="pname">Product name</Label>
            <Input id="pname" value={f.name} onChange={(e) => set("name", e.target.value)} className="h-10 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="psku">SKU</Label>
              <Input id="psku" value={f.sku} onChange={(e) => set("sku", e.target.value)} className="h-10 rounded-xl" placeholder="AUTO" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={f.cat} onValueChange={(v) => set("cat", v)}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Grocery", "Bakery", "Dairy", "Packaged", "Other"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pprice">Price (₹)</Label>
              <Input id="pprice" type="number" value={f.price} onChange={(e) => set("price", e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pstock">Opening stock</Label>
              <Input id="pstock" type="number" value={f.stock} onChange={(e) => set("stock", e.target.value)} className="h-10 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="rounded-xl">Save Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddPartyDialog({
  open, onOpenChange,
}) {
  const [f, setF] = useState({ name: "", phone: "", type: "Customer", opening: "" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Party</DialogTitle>
          <DialogDescription>Customer or supplier with khata balance.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!f.name.trim()) return toast.error("Enter party name");
            if (f.phone.length !== 10) return toast.error("Enter 10-digit phone");
            toast.success(`${f.name} added`);
            onOpenChange(false);
            setF({ name: "", phone: "", type: "Customer", opening: "" });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="paname">Party name</Label>
            <Input id="paname" value={f.name} onChange={(e) => set("name", e.target.value)} className="h-10 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="paphone">Mobile</Label>
              <Input
                id="paphone" inputMode="numeric" maxLength={10}
                value={f.phone}
                onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={f.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Customer">Customer</SelectItem>
                  <SelectItem value="Supplier">Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="paopen">Opening balance (₹)</Label>
            <Input id="paopen" type="number" value={f.opening} onChange={(e) => set("opening", e.target.value)} className="h-10 rounded-xl" placeholder="0" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="rounded-xl">Save Party</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
