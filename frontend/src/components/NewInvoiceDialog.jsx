import { useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, FileDown, Share2 } from "lucide-react";
import { toast } from "sonner";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";

const fmt = (n) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export function NewInvoiceDialog({
  open, onOpenChange,
}) {
  const [party, setParty] = useState("Anil Sweets");
  const [phone, setPhone] = useState("9876504521");
  const [lines, setLines] = useState([
    { name: "Basmati Rice 5kg", qty: 2, rate: 480, gst: 5 },
  ]);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.qty * l.rate, 0);
    const tax = lines.reduce((s, l) => s + (l.qty * l.rate * l.gst) / 100, 0);
    return { subtotal, tax, grand: subtotal + tax };
  }, [lines]);

  const update = (i, patch) =>
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const addLine = () =>
    setLines((ls) => [...ls, { name: "", qty: 1, rate: 0, gst: 18 }]);

  const removeLine = (i) =>
    setLines((ls) => ls.filter((_, idx) => idx !== i));

  const buildData = () => ({
    number: "INV-" + Math.floor(2000 + Math.random() * 999),
    date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    }),
    business: {
      name: "Sharma Traders",
      address: "Shop 12, MG Road, Indore, MP 452001",
      gstin: "23ABCDE1234F1Z5",
      phone: "+91 98765 43210",
    },
    party: { name: party, phone: "+91 " + phone },
    lines: lines.filter((l) => l.name.trim() && l.qty > 0),
  });

  const onSave = () => {
    if (!party.trim()) return toast.error("Please enter party name");
    if (!lines.some((l) => l.name.trim())) return toast.error("Add at least one item");
    toast.success("Invoice saved as draft");
    onOpenChange(false);
  };

  const onDownload = () => {
    if (!party.trim()) return toast.error("Please enter party name");
    const data = buildData();
    if (!data.lines.length) return toast.error("Add at least one item");
    downloadInvoicePdf(data);
    toast.success("Invoice PDF downloaded");
  };

  const onWhatsApp = () => {
    if (!phone || phone.length < 10) return toast.error("Enter party phone");
    const msg = encodeURIComponent(
      `Hi ${party}, your invoice from Sharma Traders for ${fmt(totals.grand)} is ready.`,
    );
    window.open(`https://wa.me/91${phone}?text=${msg}`, "_blank");
    toast.success("Opening WhatsApp…");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
          <DialogDescription>
            GST invoice with auto-calculated CGST/SGST. Download as PDF or share via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="party">Party name</Label>
            <Input
              id="party"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phn">Party mobile</Label>
            <Input
              id="phn"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="mt-2">
          <div className="mb-2 flex items-center justify-between">
            <Label>Items</Label>
            <Button type="button" size="sm" variant="outline" onClick={addLine} className="rounded-lg">
              <Plus className="mr-1 h-4 w-4" /> Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {lines.map((l, i) => (
              <div
                key={i}
                className="grid grid-cols-12 items-end gap-2 rounded-xl border bg-card p-3"
              >
                <div className="col-span-12 sm:col-span-5">
                  <Label className="text-[11px] text-muted-foreground">Item</Label>
                  <Input
                    value={l.name}
                    onChange={(e) => update(i, { name: e.target.value })}
                    placeholder="Product name"
                    className="h-9 rounded-lg"
                  />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <Label className="text-[11px] text-muted-foreground">Qty</Label>
                  <Input
                    type="number"
                    min={1}
                    value={l.qty}
                    onChange={(e) => update(i, { qty: Number(e.target.value) || 0 })}
                    className="h-9 rounded-lg"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Label className="text-[11px] text-muted-foreground">Rate</Label>
                  <Input
                    type="number"
                    min={0}
                    value={l.rate}
                    onChange={(e) => update(i, { rate: Number(e.target.value) || 0 })}
                    className="h-9 rounded-lg"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <Label className="text-[11px] text-muted-foreground">GST %</Label>
                  <Select
                    value={String(l.gst)}
                    onValueChange={(v) => update(i, { gst: Number(v) })}
                  >
                    <SelectTrigger className="h-9 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 5, 12, 18, 28].map((g) => (
                        <SelectItem key={g} value={String(g)}>{g}%</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-10 sm:col-span-1 text-right text-sm font-semibold">
                  {fmt(l.qty * l.rate * (1 + l.gst / 100))}
                </div>
                <div className="col-span-2 flex justify-end sm:col-span-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 text-destructive"
                    onClick={() => removeLine(i)}
                    disabled={lines.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-secondary p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">{fmt(totals.subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted-foreground">GST</span>
            <span className="font-semibold">{fmt(totals.tax)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t pt-2 text-base">
            <span className="font-bold">Grand Total</span>
            <span className="font-bold text-primary">{fmt(totals.grand)}</span>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onWhatsApp} className="rounded-xl">
            <Share2 className="mr-1 h-4 w-4" /> WhatsApp
          </Button>
          <Button variant="outline" onClick={onDownload} className="rounded-xl">
            <FileDown className="mr-1 h-4 w-4" /> Download PDF
          </Button>
          <Button onClick={onSave} className="rounded-xl">Save Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
