import React, { useState, useMemo } from "react";
import { ArrowLeft, ReceiptText, Bell, Plus, Send, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useInvoices } from "@/contexts/InvoiceContext";
import { toast } from "sonner";
import api from "@/lib/api";
import { validateUtr, validateUpi } from "@/lib/validation";
import { useMockAuth } from "@/lib/auth-store";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function NewPurchase() {
  const navigate = useNavigate();
  const { addInvoice } = useInvoices();
  const { user } = useMockAuth();

  const getInitialState = (key, fallback) => {
    try {
      const saved = localStorage.getItem("Udaan.purchase_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[key] !== undefined) return parsed[key];
      }
    } catch (e) {
      console.error("Failed to parse purchase draft", e);
    }
    return fallback;
  };

  const [supplier, setSupplier] = useState(() => getInitialState("supplier", ""));
  const [receivedAmount, setReceivedAmount] = useState(() => getInitialState("receivedAmount", 0));
  const [status, setStatus] = useState(() => getInitialState("status", "Unpaid"));
  const [paymentMethod, setPaymentMethod] = useState(() => getInitialState("paymentMethod", "Cash"));
  const [paymentDetails, setPaymentDetails] = useState(() => getInitialState("paymentDetails", {
    transactionId: "", utr: "", bankName: "", accountNumber: "", ifsc: ""
  }));
  const [errors, setErrors] = useState({ utr: "", upi: "" });
  const [lines, setLines] = useState(() => getInitialState("lines", [
    { name: "", hsnSac: "", qty: 1, rate: 0, discount: 0, gst: 18 }
  ]));

  React.useEffect(() => {
    const draft = { supplier, receivedAmount, status, paymentMethod, paymentDetails, lines };
    localStorage.setItem("Udaan.purchase_draft", JSON.stringify(draft));
  }, [supplier, receivedAmount, status, paymentMethod, paymentDetails, lines]);

  const handleUtrChange = (val) => {
    setPaymentDetails({ ...paymentDetails, utr: val });
    if (val.trim() === "" || !validateUtr(val)) {
      setErrors((prev) => ({ ...prev, utr: "Please enter a valid UTR Number." }));
    } else {
      setErrors((prev) => ({ ...prev, utr: "" }));
    }
  };

  const handleUpiChange = (val) => {
    setPaymentDetails({ ...paymentDetails, transactionId: val });
    if (val.trim() === "" || !validateUpi(val)) {
      setErrors((prev) => ({ ...prev, upi: "Please enter a valid UPI ID." }));
    } else {
      setErrors((prev) => ({ ...prev, upi: "" }));
    }
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let discountAmount = 0;
    let gstAmount = 0;
    let grand = 0;

    lines.forEach((l) => {
      const q = Number(l.qty) || 0;
      const r = Number(l.rate) || 0;
      const d = Number(l.discount) || 0;
      const g = Number(l.gst) || 0;

      const rateAfterDisc = r * (1 - d / 100);
      const lineTotal = q * rateAfterDisc;
      const taxableVal = lineTotal / (1 + g / 100);
      const taxVal = lineTotal - taxableVal;

      subtotal += (q * r);
      discountAmount += (q * r) - (q * rateAfterDisc);
      gstAmount += taxVal;
      grand += lineTotal;
    });

    const roundedGrand = Math.round(grand);
    const roundOff = roundedGrand - grand;
    const taxableAmount = grand - gstAmount;

    return { subtotal, discountAmount, taxableAmount, gstAmount, roundOff, grand: roundedGrand };
  }, [lines]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    if (newStatus === "Paid") {
      setReceivedAmount(totals.grand);
    } else if (newStatus === "Unpaid") {
      setReceivedAmount(0);
    }
  };

  React.useEffect(() => {
    if (status === "Paid") {
      setReceivedAmount(totals.grand);
    }
  }, [totals.grand, status]);

  const updateLine = (index, field, value) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const addLine = () => {
    setLines([...lines, { name: "", hsnSac: "", qty: 1, rate: 0, discount: 0, gst: 18 }]);
  };

  const removeLine = (index) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const handleSave = async (isSend = false) => {
    if (!lines.some(l => l.name.trim() !== "")) {
      toast.error("Please add at least one item.");
      return;
    }

    if (status !== "Unpaid" && paymentMethod === "Online") {
      const isUtrValid = validateUtr(paymentDetails.utr);
      const isUpiValid = validateUpi(paymentDetails.transactionId);

      let newErrors = { utr: "", upi: "" };
      if (!isUtrValid) {
        newErrors.utr = "Please enter a valid UTR Number.";
        toast.error("Please enter a valid UTR Number.");
      }
      if (!isUpiValid) {
        newErrors.upi = "Please enter a valid UPI ID.";
        toast.error("Please enter a valid UPI ID.");
      }

      if (!isUtrValid || !isUpiValid) {
        setErrors(newErrors);
        return;
      }
    }

    const payload = {
      invoiceNumber: "PUR-" + Math.floor(1000 + Math.random() * 9000),
      party: null,
      partyName: supplier || "Walk-in Supplier",
      type: "Purchase",
      date: new Date().toISOString(),
      items: lines.filter(l => l.name.trim() !== "").map(l => ({
        name: l.name || "Item",
        hsnSac: l.hsnSac,
        qty: Number(l.qty) || 1,
        rate: Number(l.rate) || 0,
        discount: Number(l.discount) || 0,
        gst: Number(l.gst) || 0
      })),
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxableAmount: totals.taxableAmount,
      gstAmount: totals.gstAmount,
      roundOff: totals.roundOff,
      grandTotal: totals.grand,
      status: status,
      receivedAmount: receivedAmount,
      paymentMethod: status === "Unpaid" ? "Cash" : paymentMethod,
      paymentDetails: status === "Unpaid" ? {} : paymentDetails
    };

    try {
      const endpoint = isSend ? "/invoices/send" : "/invoices";
      await api.post(endpoint, payload);
      addInvoice();
      localStorage.removeItem("Udaan.purchase_draft");
      toast.success(isSend ? "Purchase record saved & sent successfully!" : "Purchase record created successfully!");
      const userRole = user?.role?.toLowerCase() || "user";
      const rolePrefix = (userRole === "staff" || userRole === "viewer") ? "/staff" : "/vendor";
      navigate(`${rolePrefix}/billing`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save purchase record");
    }
  };

  return (
    <div className="min-h-[100vh] -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 bg-slate-50 pb-24 font-sans text-slate-900 relative">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-emerald-800 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">New Purchase</h1>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ReceiptText className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Supplier Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider">SUPPLIER</span>
            <button className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700">
              Change Supplier
            </button>
          </div>
          <Input 
            value={supplier} 
            onChange={(e) => setSupplier(e.target.value)} 
            placeholder="Enter supplier name..."
            className="h-10 rounded-xl border border-slate-200 px-3 bg-white focus:border-slate-400 text-slate-800 text-[14px] font-medium focus-visible:ring-0" 
          />
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-slate-800">Items List</span>
            <Button type="button" size="sm" variant="outline" onClick={addLine} className="rounded-full text-xs h-8">
              <Plus className="mr-1 h-3 w-3" /> Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {lines.map((l, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 relative">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-12 md:col-span-4">
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">Product Name</label>
                    <Input value={l.name} onChange={(e) => updateLine(i, 'name', e.target.value)} placeholder="Item description" className="h-9 bg-white" />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">HSN/SAC</label>
                    <Input value={l.hsnSac} onChange={(e) => updateLine(i, 'hsnSac', e.target.value)} placeholder="000000" className="h-9 bg-white" />
                  </div>
                  <div className="col-span-3 md:col-span-1">
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">Qty</label>
                    <Input type="number" min={1} value={l.qty} onChange={(e) => updateLine(i, 'qty', e.target.value)} className="h-9 bg-white" />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">Rate (Inc)</label>
                    <Input type="number" min={0} value={l.rate} onChange={(e) => updateLine(i, 'rate', e.target.value)} className="h-9 bg-white" />
                  </div>
                  <div className="col-span-4 md:col-span-1">
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">Disc %</label>
                    <Input type="number" min={0} max={100} value={l.discount} onChange={(e) => updateLine(i, 'discount', e.target.value)} className="h-9 bg-white" />
                  </div>
                  <div className="col-span-4 md:col-span-1">
                    <label className="text-[11px] font-medium text-slate-500 mb-1 block">GST %</label>
                    <select 
                      value={[0, 5, 12, 18, 28].includes(Number(l.gst)) ? String(l.gst) : "custom"} 
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "custom") {
                          updateLine(i, 'gst', 3);
                        } else {
                          updateLine(i, 'gst', Number(val));
                        }
                      }} 
                      className="h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                      <option value="custom">Custom</option>
                    </select>
                    {![0, 5, 12, 18, 28].includes(Number(l.gst)) && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={l.gst}
                          onChange={(e) => updateLine(i, 'gst', Number(e.target.value) || 0)}
                          placeholder="Rate %"
                          className="h-8 text-xs px-2 w-full rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-1 flex items-end justify-end pb-1">
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeLine(i)} disabled={lines.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-800">{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-500">Discount</span>
              <span className="font-semibold text-red-600">-{totals.discountAmount.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-500">Taxable Amount</span>
              <span className="font-semibold text-slate-800">{totals.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-500">GST</span>
              <span className="font-semibold text-slate-800">{totals.gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-500">Round Off</span>
              <span className="font-semibold text-slate-500">{totals.roundOff.toFixed(2)}</span>
            </div>

            {/* Payment Status */}
            <div className="flex justify-between items-center text-[13px] pt-2">
              <span className="text-slate-500 font-medium">Payment Status</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-40 h-9 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs sm:text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partially Paid</option>
              </select>
            </div>

            {/* Received Amount */}
            {status !== "Unpaid" && (
              <div className="flex justify-between items-center text-[13px] pt-2">
                <span className="text-slate-500 font-medium">Received Amount (₹)</span>
                <Input
                  type="number"
                  min={0}
                  max={totals.grand}
                  disabled={status === "Paid"}
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(Number(e.target.value) || 0)}
                  className="w-40 h-9 text-right font-semibold rounded-xl bg-slate-50 border-slate-200 focus-visible:bg-white"
                />
              </div>
            )}

            {/* Payment Method */}
            {status !== "Unpaid" && (
              <div className="flex justify-between items-center text-[13px] pt-2">
                <span className="text-slate-500 font-medium">Payment Method</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-40 h-9 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs sm:text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            )}

            {/* Online Payment Details */}
            {status !== "Unpaid" && paymentMethod === "Online" && (
              <div className="space-y-3 pt-3 border-t border-dashed mt-2">
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">UPI ID / Transaction ID</label>
                    <Input 
                      value={paymentDetails.transactionId} 
                      onChange={(e) => handleUpiChange(e.target.value)} 
                      placeholder="e.g. name@okhdfcbank" 
                      maxLength={45}
                      className={`h-9 rounded-xl text-xs sm:text-sm ${errors.upi ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500' : 'border-slate-200'}`}
                    />
                    {errors.upi && <span className="text-[10px] text-red-500 mt-1 block">{errors.upi}</span>}
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">UTR Number</label>
                    <Input 
                      value={paymentDetails.utr} 
                      onChange={(e) => handleUtrChange(e.target.value)} 
                      placeholder="e.g. 123456789012" 
                      maxLength={22}
                      className={`h-9 rounded-xl text-xs sm:text-sm ${errors.utr ? 'border-red-500 focus:border-red-500 focus-visible:ring-red-500' : 'border-slate-200'}`}
                    />
                    {errors.utr && <span className="text-[10px] text-red-500 mt-1 block">{errors.utr}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Details */}
            {status !== "Unpaid" && paymentMethod === "Bank Transfer" && (
              <div className="space-y-3 pt-3 border-t border-dashed mt-2">
                <div className="grid grid-cols-3 gap-2.5 text-left">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Bank Name</label>
                    <Input 
                      value={paymentDetails.bankName} 
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })} 
                      placeholder="HDFC / SBI" 
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Account Number</label>
                    <Input 
                      value={paymentDetails.accountNumber} 
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })} 
                      placeholder="987654321012" 
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">IFSC Code</label>
                    <Input 
                      value={paymentDetails.ifsc} 
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, ifsc: e.target.value })} 
                      placeholder="HDFC0001234" 
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Separator className="mb-4" />
          
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold text-slate-900">Grand Total</span>
            <span className="text-2xl font-bold text-emerald-600">{fmt(totals.grand)}</span>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:justify-center">
        <Button variant="outline" className="flex-1 rounded-full h-12 text-[14px] font-semibold border-slate-300 md:max-w-xs" onClick={() => handleSave(false)}>
          SAVE
        </Button>
        <Button className="flex-[2] rounded-full h-12 text-[14px] font-semibold bg-emerald-500 hover:bg-emerald-600 md:max-w-xs" onClick={() => handleSave(true)}>
          <Send className="mr-2 h-4 w-4" />
          SAVE & SEND
        </Button>
      </div>
    </div>
  );
}
