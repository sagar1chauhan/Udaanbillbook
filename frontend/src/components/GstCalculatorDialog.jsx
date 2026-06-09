import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function GstCalculatorDialog({ open, onOpenChange }) {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("18");
  const [gstType, setGstType] = useState("exclusive");

  const calculateGst = () => {
    const amt = parseFloat(amount) || 0;
    const r = parseFloat(rate) || 0;

    if (gstType === "exclusive") {
      const gstAmount = (amt * r) / 100;
      const total = amt + gstAmount;
      return { net: amt, gst: gstAmount, total: total };
    } else {
      const gstAmount = amt - (amt * (100 / (100 + r)));
      const net = amt - gstAmount;
      return { net: net, gst: gstAmount, total: amt };
    }
  };

  const results = calculateGst();

  const formatCurrency = (val) => "₹" + val.toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>GST Calculator</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>GST Type</Label>
            <RadioGroup defaultValue="exclusive" value={gstType} onValueChange={setGstType} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exclusive" id="exclusive" />
                <Label htmlFor="exclusive" className="font-normal cursor-pointer">Exclusive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inclusive" id="inclusive" />
                <Label htmlFor="inclusive" className="font-normal cursor-pointer">Inclusive</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rate">GST Rate (%)</Label>
            <select
              id="rate"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="0">0%</option>
              <option value="0.25">0.25%</option>
              <option value="3">3%</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
          </div>

          <div className="mt-4 rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Net Amount:</span>
              <span className="font-semibold">{formatCurrency(results.net)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST Amount ({rate}%):</span>
              <span className="font-semibold text-destructive">{formatCurrency(results.gst)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between">
              <span className="font-bold">Total Amount:</span>
              <span className="font-bold text-success">{formatCurrency(results.total)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
