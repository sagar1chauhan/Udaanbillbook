import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft, ReceiptText, Printer, Plus, Send, Trash2, X, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useInvoices } from "@/contexts/InvoiceContext";
import { toast } from "sonner";
import api from "@/lib/api";

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function NewSale() {
  const navigate = useNavigate();
  const { addInvoice } = useInvoices();

  const [customer, setCustomer] = useState("Walk-in Customer");
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [lines, setLines] = useState([
    { name: "Item description", hsnSac: "", qty: 1, rate: 0, discount: 0, gst: 18 }
  ]);

  const [showAdModal, setShowAdModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);
  const [regForm, setRegForm] = useState({ businessName: "", address: "", type: "Retail" });

  useEffect(() => {
    const saved = sessionStorage.getItem('pendingNewSale');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.customer) setCustomer(data.customer);
        if (data.receivedAmount !== undefined) setReceivedAmount(data.receivedAmount);
        if (data.lines) setLines(data.lines);
        if (data.pendingSave) {
          setPendingSave(data.pendingSave);
          const isResume = sessionStorage.getItem('resumeInvoiceFlow') === 'true';
          if (isResume) {
            sessionStorage.removeItem('resumeInvoiceFlow');
            setTimeout(() => continueFlow(null, true), 300);
          }
        }
      } catch(e) {}
      sessionStorage.removeItem('pendingNewSale');
    }
  }, []);

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

      // Assuming Tax Inclusive Rates (Prices include GST) as per user screenshot
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

    const payload = {
      invoiceNumber: "INV-" + Math.floor(1000 + Math.random() * 9000),
      party: null,
      partyName: customer || "Walk-in Customer",
      type: "Sale",
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
      status: receivedAmount >= totals.grand ? "Paid" : (receivedAmount > 0 ? "Partial" : "Unpaid"),
      receivedAmount: receivedAmount
    };

    setPendingSave({ isSend, payload });

    try {
      const { data: user } = await api.get('/auth/me');
      
      if (user.showAds) {
        setShowAdModal(true);
        return; // wait for ad to finish
      }
      
      continueFlow(user);
    } catch (err) {
      toast.error("Failed to check user settings.");
    }
  };

  const continueFlow = async (user = null, forceResume = false) => {
    if (!user) {
      try {
        const res = await api.get('/auth/me');
        user = res.data;
      } catch (e) {
        toast.error("Failed to check user settings.");
        return;
      }
    }

    if (user.billsGenerated === 0 && !forceResume) {
      sessionStorage.setItem('pendingNewSale', JSON.stringify({
        customer, receivedAmount, lines, pendingSave
      }));
      navigate('/register', { state: { returnUrl: '/sale/new' } });
      return;
    }

    if (user.billLimit !== -1 && user.billsGenerated >= user.billLimit) {
      setShowSubModal(true);
      return;
    }

    executeSave();
  };

  const executeSave = async () => {
    if (!pendingSave) return;
    const { isSend, payload } = pendingSave;
    try {
      const endpoint = isSend ? "/invoices/send" : "/invoices";
      await api.post(endpoint, payload);
      addInvoice();
      toast.success(isSend ? "Sale invoice saved & sent successfully!" : "Sale invoice created successfully!");
      navigate("/billing");
    } catch (err) {
      if (err.response?.data?.message === 'LIMIT_REACHED') {
        setShowSubModal(true);
      } else {
        toast.error(err.response?.data?.message || "Failed to save sale invoice");
      }
    } finally {
      setPendingSave(null);
    }
  };

  return (
    <div className="min-h-[100vh] -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 bg-slate-50 pb-24 font-sans text-slate-900 relative">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex h-14 items-center justify-between bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-800 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">New Sale</h1>
        </div>
        <div className="flex items-center gap-2 text-slate-700">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ReceiptText className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Printer className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Customer Section */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider">CUSTOMER</span>
            <button className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700">
              Change Customer
            </button>
          </div>
          <Input 
            value={customer} 
            onChange={(e) => setCustomer(e.target.value)} 
            className="h-10 text-[15px] font-medium text-slate-800 border-none px-0 focus-visible:ring-0" 
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
                    <select value={l.gst} onChange={(e) => updateLine(i, 'gst', e.target.value)} className="h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
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
            <div className="flex justify-between items-center text-[13px] pt-2">
              <span className="text-slate-500 font-medium">Received Amount (₹)</span>
              <Input
                type="number"
                min={0}
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(Number(e.target.value) || 0)}
                className="w-32 h-8 text-right font-semibold rounded-lg bg-slate-50 border-slate-200 focus-visible:bg-white"
              />
            </div>
          </div>
          
          <Separator className="mb-4" />
          
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold text-slate-900">Grand Total</span>
            <span className="text-2xl font-bold text-emerald-600">{fmt(totals.grand)}</span>
          </div>
        </div>
      </div>

      {/* Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="bg-emerald-50 p-6 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Advertisement</span>
              <h3 className="text-xl font-bold text-slate-800 mb-4">Upgrade Your Business Today!</h3>
              <div className="h-32 w-full bg-emerald-100 rounded-xl mb-4 flex items-center justify-center text-emerald-800/50">
                [ Sponsored Content ]
              </div>
              <p className="text-sm text-slate-600">Get 50% off on premium subscriptions this month.</p>
            </div>
            <div className="p-4 flex justify-end">
              <Button onClick={() => { setShowAdModal(false); continueFlow(); }} className="bg-emerald-600 hover:bg-emerald-700">
                Skip Ad & Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Complete Profile</h3>
                  <p className="text-xs text-slate-500">Required before your first bill</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Business Name</label>
                  <Input value={regForm.businessName} onChange={e => setRegForm({...regForm, businessName: e.target.value})} placeholder="e.g. Udaan Store" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Business Type</label>
                  <Input value={regForm.type} onChange={e => setRegForm({...regForm, type: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Address</label>
                  <Input value={regForm.address} onChange={e => setRegForm({...regForm, address: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setShowRegisterModal(false); setPendingSave(null); }}>Cancel</Button>
              <Button onClick={() => {
                // Mock save profile
                setShowRegisterModal(false);
                setShowSubModal(true); // show sub modal next
              }} className="bg-blue-600 hover:bg-blue-700">Save Details</Button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Choose a Plan</h3>
              <p className="text-sm text-slate-500 mb-6">Select a subscription plan to continue generating bills.</p>
              
              <div className="space-y-3">
                <div className="border border-emerald-200 bg-emerald-50 p-4 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => { setShowSubModal(false); executeSave(); }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-emerald-800">Free Trial</span>
                    <span className="font-bold text-emerald-600">₹0/mo</span>
                  </div>
                  <p className="text-xs text-emerald-600 text-left">Generate up to 10 bills free</p>
                </div>
                <div className="border border-slate-200 p-4 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => { navigate('/pricing'); }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800">Pro Plan</span>
                    <span className="font-bold text-blue-600">₹499/mo</span>
                  </div>
                  <p className="text-xs text-slate-500 text-left">Unlimited bills + Priority support</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end">
              <Button variant="ghost" onClick={() => { setShowSubModal(false); setPendingSave(null); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

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
