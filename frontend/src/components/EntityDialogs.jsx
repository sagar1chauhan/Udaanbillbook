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
  open, onOpenChange, onAdd,
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
            
            if (onAdd) {
              onAdd({
                name: f.name.trim(),
                sku: f.sku.trim() || `SKU-${Math.floor(100 + Math.random() * 900)}`,
                cat: f.cat,
                price: Number(f.price),
                stock: Number(f.stock) || 0,
                min: 10,
              });
            }
            
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
  open, onOpenChange, onAdd,
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
            
            if (onAdd) {
              onAdd({
                name: f.name.trim(),
                type: f.type,
                phone: `+91 ${f.phone.slice(0,4)} ${f.phone.slice(4)}`,
                balance: Number(f.opening) || 0,
              });
            }
            
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

export function CashInOutDialog({
  open, onOpenChange, onAdd,
}) {
  const [f, setF] = useState({ desc: "", amount: "", type: "IN", party: "", mode: "Cash" });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Cash In/Out</DialogTitle>
          <DialogDescription>Record a manual cash or bank transaction.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!f.desc.trim()) return toast.error("Enter description");
            if (!f.amount) return toast.error("Enter amount");
            
            if (onAdd) {
              onAdd({
                desc: f.desc.trim(),
                date: "Just now",
                amount: Number(f.amount),
                type: f.type,
                party: f.party.trim() || "General",
                mode: f.mode,
              });
            }
            
            toast.success("Transaction recorded");
            onOpenChange(false);
            setF({ desc: "", amount: "", type: "IN", party: "", mode: "Cash" });
          }}
        >
          <div className="grid grid-cols-2 gap-3 p-1 bg-muted rounded-xl">
             <Button 
                type="button" 
                variant={f.type === 'IN' ? 'default' : 'ghost'} 
                className="rounded-lg h-9"
                onClick={() => set('type', 'IN')}
             >Cash In</Button>
             <Button 
                type="button" 
                variant={f.type === 'OUT' ? 'destructive' : 'ghost'} 
                className="rounded-lg h-9 text-destructive hover:text-destructive"
                onClick={() => set('type', 'OUT')}
             >Cash Out</Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Input id="desc" value={f.desc} onChange={(e) => set("desc", e.target.value)} className="h-10 rounded-xl" placeholder="e.g. Received from customer" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amt">Amount (₹)</Label>
              <Input id="amt" type="number" value={f.amount} onChange={(e) => set("amount", e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label>Payment Mode</Label>
              <Select value={f.mode} onValueChange={(v) => set("mode", v)}>
                <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank">Bank</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="party">Party (Optional)</Label>
            <Input id="party" value={f.party} onChange={(e) => set("party", e.target.value)} className="h-10 rounded-xl" placeholder="e.g. John Doe" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="rounded-xl">Record Transaction</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
