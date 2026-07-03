import React, { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Printer, Plus, Send, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoices } from "@/contexts/InvoiceContext";
import { toast } from "sonner";
import api from "@/lib/api";
import { validateUtr, validateUpi } from "@/lib/validation";
import { useMockAuth } from "@/lib/auth-store";
import { InvoiceTemplateRenderer } from "@/components/invoice-templates/InvoiceTemplateRenderer";
import { usePlatformSettings } from "@/lib/platform-settings";

export default function NewSale() {
  const navigate = useNavigate();
  const { addInvoice } = useInvoices();
  const { user } = useMockAuth();
  const { settings } = usePlatformSettings();

  const printSet = settings?.printSettings || {};
  const gstSet = settings?.gstSettings || {};
  const txnSet = settings?.txnSettings || {};

  const cols = printSet.tableColumns && Object.keys(printSet.tableColumns).length > 0 ? printSet.tableColumns : {
    slNo: true,
    itemName: true,
    hsnSac: true,
    quantity: true,
    priceUnit: true,
    amount: true
  };

  const colNames = printSet.tableColumnNames && Object.keys(printSet.tableColumnNames).length > 0 ? printSet.tableColumnNames : {
    slNo: "Sr.",
    itemName: "Product Description",
    hsnSac: "HSN/SAC",
    quantity: "QTY",
    priceUnit: "Rate",
    amount: "Total"
  };

  const order = printSet.columnOrder || [
    "slNo",
    "itemName",
    "itemCode",
    "hsnSac",
    "batchNo",
    "expDate",
    "mfgDate",
    "mrp",
    "size",
    "modelNo",
    "description",
    "count",
    "colour",
    "material",
    "brand",
    "serialNo",
    "challanNo",
    "quantity",
    "unit",
    "priceUnit",
    "discount",
    "discountPercent",
    "taxablePriceUnit",
    "taxAmount",
    "taxPercent",
    "taxableAmount",
    "cess",
    "finalRate",
    "amount"
  ];

  const getInitialState = (key, fallback) => {
    try {
      const saved = localStorage.getItem("Udaan.sale_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[key] !== undefined) {
          return parsed[key];
        }
      }
    } catch (e) {
      console.error("Failed to parse sale draft", e);
    }
    return fallback;
  };

  // Form fields
  const [customer, setCustomer] = useState(() => getInitialState("customer", ""));
  const [receivedAmount, setReceivedAmount] = useState(() => getInitialState("receivedAmount", 0));
  const [status, setStatus] = useState(() => getInitialState("status", "Unpaid"));
  const [paymentMethod, setPaymentMethod] = useState(() => getInitialState("paymentMethod", "Cash"));
  const [paymentDetails, setPaymentDetails] = useState(() => getInitialState("paymentDetails", {
    transactionId: "",
    utr: "",
    bankName: "",
    accountNumber: "",
    ifsc: ""
  }));

  // Additional Meta Fields
  const [reverseCharge, setReverseCharge] = useState(() => getInitialState("reverseCharge", "No"));
  const [challanNo, setChallanNo] = useState(() => getInitialState("challanNo", ""));
  const [vehicleNo, setVehicleNo] = useState(() => getInitialState("vehicleNo", ""));
  const [dateOfSupply, setDateOfSupply] = useState(() => getInitialState("dateOfSupply", ""));
  const [placeOfSupply, setPlaceOfSupply] = useState(() => getInitialState("placeOfSupply", ""));
  const [billedToAddress, setBilledToAddress] = useState(() => getInitialState("billedToAddress", ""));
  const [billedToGstin, setBilledToGstin] = useState(() => getInitialState("billedToGstin", ""));
  const [billedToMobile, setBilledToMobile] = useState(() => getInitialState("billedToMobile", ""));
  const [billedToState, setBilledToState] = useState(() => getInitialState("billedToState", ""));
  const [poNumber, setPoNumber] = useState(() => getInitialState("poNumber", ""));
  const [poDate, setPoDate] = useState(() => getInitialState("poDate", ""));
  const [billingName, setBillingName] = useState(() => getInitialState("billingName", ""));
  const [paymentDate, setPaymentDate] = useState(() => getInitialState("paymentDate", new Date().toISOString().substring(0, 10)));
  const [paymentTime, setPaymentTime] = useState(() => getInitialState("paymentTime", new Date().toTimeString().substring(0, 5)));

  const [errors, setErrors] = useState({ utr: "", upi: "" });
  const [lines, setLines] = useState(() => getInitialState("lines", [
    { name: "", hsnSac: "", qty: 1, rate: 0, discount: 0, gst: 18 }
  ]));

  // Seller Details Fields (Dynamically shown based on PRINT checkboxes)
  const [sellerName, setSellerName] = useState(() => getInitialState("sellerName", ""));
  const [sellerAddress, setSellerAddress] = useState(() => getInitialState("sellerAddress", ""));
  const [sellerEmail, setSellerEmail] = useState(() => getInitialState("sellerEmail", ""));
  const [sellerPhone, setSellerPhone] = useState(() => getInitialState("sellerPhone", ""));
  const [sellerGstin, setSellerGstin] = useState(() => getInitialState("sellerGstin", ""));

  // Footer & T&C Override Fields (Dynamically shown based on PRINT checkboxes)
  const [terms, setTerms] = useState(() => getInitialState("terms", ""));
  const [description, setDescription] = useState(() => getInitialState("description", ""));
  const [receivedBy, setReceivedBy] = useState(() => getInitialState("receivedBy", ""));
  const [deliveredBy, setDeliveredBy] = useState(() => getInitialState("deliveredBy", ""));
  const [acknowledgement, setAcknowledgement] = useState(() => getInitialState("acknowledgement", ""));
  const [signatureText, setSignatureText] = useState(() => getInitialState("signatureText", ""));
  const [signatureUrl, setSignatureUrl] = useState(() => getInitialState("signatureUrl", ""));
  const [partyBalance, setPartyBalance] = useState(() => getInitialState("partyBalance", ""));

  const [activePane, setActivePane] = useState("form");
  const [invoiceTemplate, setInvoiceTemplate] = useState(() => getInitialState("invoiceTemplate", "GST Boxed"));
  const [themeColor, setThemeColor] = useState(() => getInitialState("themeColor", "slate"));

  // Initialize seller details & footer from settings once settings are loaded
  useEffect(() => {
    if (settings?.printSettings) {
      if (!sellerName && settings.printSettings.companyName) setSellerName(settings.printSettings.companyName);
      if (!sellerAddress && settings.printSettings.address) setSellerAddress(settings.printSettings.address);
      if (!sellerEmail && settings.printSettings.email) setSellerEmail(settings.printSettings.email);
      if (!sellerPhone && settings.printSettings.phone) setSellerPhone(settings.printSettings.phone);
      if (!sellerGstin && (settings.printSettings.gstinOnSale || settings.gstSettings?.gstin)) {
        setSellerGstin(settings.printSettings.gstinOnSale || settings.gstSettings?.gstin);
      }
      if (!terms) {
        setTerms("1. We are responsible for the loss of signed Duty slip, check details.\n2. Interest@24% will be charged if bill not paid within 15 days.");
      }
      if (!signatureText && settings.printSettings.signatureText) {
        setSignatureText(settings.printSettings.signatureText);
      }
      if (!signatureUrl && settings.printSettings.signatureUrl) {
        setSignatureUrl(settings.printSettings.signatureUrl);
      }
    }
  }, [settings]);

  // Sync draft to local storage
  useEffect(() => {
    const draft = {
      customer,
      receivedAmount,
      status,
      paymentMethod,
      paymentDetails,
      lines,
      reverseCharge,
      challanNo,
      vehicleNo,
      dateOfSupply,
      placeOfSupply,
      billedToAddress,
      billedToGstin,
      billedToMobile,
      billedToState,
      invoiceTemplate,
      themeColor,
      sellerName,
      sellerAddress,
      sellerEmail,
      sellerPhone,
      sellerGstin,
      terms,
      description,
      receivedBy,
      deliveredBy,
      acknowledgement,
      signatureText,
      signatureUrl,
      partyBalance
    };
    localStorage.setItem("Udaan.sale_draft", JSON.stringify(draft));
  }, [
    customer, receivedAmount, status, paymentMethod, paymentDetails, lines,
    reverseCharge, challanNo, vehicleNo, dateOfSupply, placeOfSupply,
    billedToAddress, billedToGstin, billedToMobile, billedToState, invoiceTemplate, themeColor,
    sellerName, sellerAddress, sellerEmail, sellerPhone, sellerGstin,
    terms, description, receivedBy, deliveredBy, acknowledgement, signatureText, signatureUrl, partyBalance
  ]);

  const handleUtrChange = (val) => {
    setPaymentDetails({ ...paymentDetails, utr: val });
    if (val.trim() === "") {
      setErrors((prev) => ({ ...prev, utr: "" }));
    } else if (!validateUtr(val)) {
      setErrors((prev) => ({ ...prev, utr: `UTR must be 12-22 alphanumeric characters (entered ${val.trim().length})` }));
    } else {
      setErrors((prev) => ({ ...prev, utr: "" }));
    }
  };

  const handleUpiChange = (val) => {
    setPaymentDetails({ ...paymentDetails, transactionId: val });
    if (val.trim() === "") {
      setErrors((prev) => ({ ...prev, upi: "" }));
    } else if (!validateUpi(val)) {
      setErrors((prev) => ({ ...prev, upi: "Enter valid UPI ID (e.g. name@paytm) or 12-30 digit Txn ID" }));
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
      const isExcl = l.taxType === "exclusive";

      const rateAfterDisc = r * (1 - d / 100);
      let taxableVal, taxVal, lineTotal;

      if (isExcl) {
        taxableVal = q * rateAfterDisc;
        taxVal = taxableVal * (g / 100);
        lineTotal = taxableVal + taxVal;
      } else {
        lineTotal = q * rateAfterDisc;
        taxableVal = lineTotal / (1 + g / 100);
        taxVal = lineTotal - taxableVal;
      }

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

  useEffect(() => {
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

    if (billedToMobile && billedToMobile.length !== 10) {
      toast.error("Please enter a valid 10-digit Customer Mobile Number.");
      return;
    }

    if (sellerPhone && sellerPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit Seller Phone Number.");
      return;
    }

    if (billedToGstin && billedToGstin.length !== 15) {
      toast.error("Please enter a valid 15-character Customer GSTIN.");
      return;
    }

    if (sellerGstin && sellerGstin.length !== 15) {
      toast.error("Please enter a valid 15-character Seller GSTIN.");
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
      invoiceNumber: "INV-" + Math.floor(1000 + Math.random() * 9000),
      party: null,
      partyName: customer || "Walk-in Customer",
      type: "Sale",
      date: paymentDate ? new Date(paymentDate + "T12:00:00").toISOString() : new Date().toISOString(),
      time: paymentTime,
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
      localStorage.removeItem("Udaan.sale_draft");
      toast.success(isSend ? "Sale invoice saved & sent successfully!" : "Sale invoice created successfully!");
      const userRole = user?.role?.toLowerCase() || "user";
      const rolePrefix = (userRole === "staff" || userRole === "viewer") ? "/staff" : "/vendor";
      navigate(`${rolePrefix}/billing`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save sale invoice");
    }
  };

  const showField = (key, fallback = true) => {
    if (printSet[key] !== undefined) return printSet[key];
    return fallback;
  };

  const numberToWords = (num) => {
    if (!num) return "Zero Rupees Only";
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const formatTens = (n) => {
      if (n < 20) return a[n];
      return b[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + a[n % 10] : "");
    };

    let words = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = Math.floor(num / 100);
    num %= 100;
    const remaining = num;

    if (crore) words += formatTens(crore) + ' Crore ';
    if (lakh) words += formatTens(lakh) + ' Lakh ';
    if (thousand) words += formatTens(thousand) + ' Thousand ';
    if (hundred) words += formatTens(hundred) + ' Hundred ';
    if (remaining) words += formatTens(remaining);

    return (words.trim() + " Rupees Only").replace(/\s+/g, ' ');
  };



  return (
    <div className="min-h-[100vh] -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 bg-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Top App Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between bg-white px-4 border-b">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-800 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-sm font-bold tracking-tight text-slate-800 uppercase">New Sale Invoice</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setActivePane(activePane === "form" ? "preview" : "form")} 
            className="flex items-center gap-1.5 rounded-xl text-xs md:hidden"
          >
            <Eye className="h-3.5 w-3.5" />
            {activePane === "form" ? "View Preview" : "View Form"}
          </Button>
          <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-600 rounded-xl" onClick={() => handleSave(false)}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Split Screen Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Billing Creator Form */}
        <div className={`w-full md:w-1/2 lg:w-5/12 flex flex-col h-full bg-slate-50 overflow-y-auto border-r custom-scrollbar ${activePane === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 space-y-4 pb-24">
            
            {/* Seller/Company Details Block (Dynamically shown based on PRINT checkboxes) */}
            {(printSet.printCompanyName || printSet.printAddress || printSet.printEmail || printSet.printPhone || printSet.printGstin) && (
              <div className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Seller Details (Your Info)</span>
                <div className="space-y-3">
                  {printSet.printCompanyName && (
                    <div className="space-y-1">
                      <Label className="text-xs">Company Name</Label>
                      <Input 
                        value={sellerName} 
                        onChange={(e) => setSellerName(e.target.value)} 
                        placeholder="Seller Company Name"
                        className="h-10 rounded-xl border border-slate-200 focus-visible:ring-1 focus-visible:ring-emerald-500" 
                      />
                    </div>
                  )}
                  {printSet.printGstin && (
                    <div className="space-y-1">
                      <Label className="text-xs">GSTIN on Sale</Label>
                      <Input 
                        value={sellerGstin} 
                        onChange={(e) => setSellerGstin(e.target.value.toUpperCase().slice(0, 15))} 
                        maxLength={15}
                        placeholder="Seller GSTIN"
                        className="h-9 rounded-lg"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {printSet.printPhone && (
                      <div className="space-y-1">
                        <Label className="text-xs">Phone Number</Label>
                        <Input 
                          value={sellerPhone} 
                          onChange={(e) => setSellerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                          maxLength={10}
                          placeholder="Seller Phone"
                          className="h-9 rounded-lg"
                        />
                      </div>
                    )}
                    {printSet.printEmail && (
                      <div className="space-y-1">
                        <Label className="text-xs">Email Address</Label>
                        <Input 
                          value={sellerEmail} 
                          onChange={(e) => setSellerEmail(e.target.value)} 
                          placeholder="Seller Email"
                          className="h-9 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  {printSet.printAddress && (
                    <div className="space-y-1">
                      <Label className="text-xs">Seller Address</Label>
                      <Input 
                        value={sellerAddress} 
                        onChange={(e) => setSellerAddress(e.target.value)} 
                        placeholder="Seller Address"
                        className="h-9 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Customer Details Block */}
            <div className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Billed To (Customer Details)</span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Customer Name</Label>
                  <Input 
                    value={customer} 
                    onChange={(e) => setCustomer(e.target.value)} 
                    placeholder="Enter customer / business name"
                    className="h-10 rounded-xl border border-slate-200 focus-visible:ring-1 focus-visible:ring-emerald-500" 
                  />
                </div>
                {txnSet.billingName && (
                  <div className="space-y-1">
                    <Label className="text-xs">Billing Name</Label>
                    <Input 
                      value={billingName} 
                      onChange={(e) => setBillingName(e.target.value)} 
                      placeholder="Enter legal / billing name"
                      className="h-9 rounded-lg"
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Mobile Number</Label>
                    <Input 
                      value={billedToMobile} 
                      onChange={(e) => setBilledToMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                      maxLength={10}
                      placeholder="98765..." 
                      className="h-9 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">GSTIN</Label>
                    <Input 
                      value={billedToGstin} 
                      onChange={(e) => setBilledToGstin(e.target.value.toUpperCase().slice(0, 15))} 
                      maxLength={15}
                      placeholder="07AAAA..." 
                      className="h-9 rounded-lg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Billing Address</Label>
                    <Input 
                      value={billedToAddress} 
                      onChange={(e) => setBilledToAddress(e.target.value)} 
                      placeholder="City, State" 
                      className="h-9 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">State & Code</Label>
                    <Input 
                      value={billedToState} 
                      onChange={(e) => setBilledToState(e.target.value)} 
                      placeholder="e.g. Delhi (07)" 
                      className="h-9 rounded-lg"
                    />
                  </div>
                </div>
                {printSet.currentBalanceParty && (
                  <div className="space-y-1">
                    <Label className="text-xs">Party Current Balance (₹)</Label>
                    <Input 
                      type="number"
                      value={partyBalance} 
                      onChange={(e) => setPartyBalance(Number(e.target.value) || 0)} 
                      placeholder="e.g. 15000" 
                      className="h-9 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Transport & Additional Details Block */}
            <div className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Transport & Supply Details</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Challan No.</Label>
                  <Input 
                    value={challanNo} 
                    onChange={(e) => setChallanNo(e.target.value)} 
                    placeholder="Challan reference" 
                    className="h-9 rounded-lg"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Vehicle Number</Label>
                  <Input 
                    value={vehicleNo} 
                    onChange={(e) => setVehicleNo(e.target.value.toUpperCase())} 
                    placeholder="DL2CAZXXXX" 
                    className="h-9 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Date of Supply</Label>
                  <Input 
                    type="date"
                    value={dateOfSupply} 
                    onChange={(e) => setDateOfSupply(e.target.value)} 
                    className="h-9 rounded-lg"
                  />
                </div>
                {gstSet.placeOfSupply && (
                  <div className="space-y-1">
                    <Label className="text-xs">Place of Supply</Label>
                    <Input 
                      value={placeOfSupply} 
                      onChange={(e) => setPlaceOfSupply(e.target.value)} 
                      placeholder="Delhi" 
                      className="h-9 rounded-lg"
                    />
                  </div>
                )}
              </div>
              {txnSet.poDetails && (
                <div className="grid grid-cols-2 gap-3 border-t pt-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Customer P.O. No.</Label>
                    <Input 
                      value={poNumber} 
                      onChange={(e) => setPoNumber(e.target.value)} 
                      placeholder="P.O. reference" 
                      className="h-9 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">P.O. Date</Label>
                    <Input 
                      type="date"
                      value={poDate} 
                      onChange={(e) => setPoDate(e.target.value)} 
                      className="h-9 rounded-lg"
                    />
                  </div>
                </div>
              )}
              {gstSet.reverseCharge && (
                <div className="flex items-center justify-between pt-1">
                  <Label className="text-xs">Reverse Charge</Label>
                  <select
                    value={reverseCharge}
                    onChange={(e) => setReverseCharge(e.target.value)}
                    className="h-8 rounded-lg border text-xs bg-white px-2 focus:outline-none"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              )}
            </div>

            {/* Items List Block */}
            <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">Item Details List</span>
                <Button type="button" size="sm" variant="outline" onClick={addLine} className="rounded-full text-xs h-7 px-3 gap-1.5">
                  <Plus className="h-3 w-3" /> Add Item Row
                </Button>
              </div>

              <div className="space-y-3">
                {lines.map((l, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50/80 to-white p-4 relative group">
                    {/* Row 1: Core fields */}
                    <div className="grid grid-cols-12 gap-3 items-end">
                      {/* Item Name */}
                      {cols.itemName && (
                        <div className="col-span-12 sm:col-span-5">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.itemName || "Item Name"}</Label>
                          <Input value={l.name} onChange={(e) => updateLine(i, 'name', e.target.value)} placeholder="Product description" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}

                      {/* HSN/SAC */}
                      {cols.hsnSac && gstSet.enableHsn && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.hsnSac || "HSN/SAC"}</Label>
                          <Input value={l.hsnSac} onChange={(e) => updateLine(i, 'hsnSac', e.target.value)} placeholder="996601" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}

                      {/* Quantity + Free Qty */}
                      {cols.quantity && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.quantity || "Quantity"}</Label>
                          <Input type="number" min={1} value={l.qty} onChange={(e) => updateLine(i, 'qty', Number(e.target.value) || 0)} className="h-9 bg-white text-xs text-center rounded-lg border-slate-200" />
                          {txnSet.freeQty && (
                            <div className="mt-1">
                              <Input 
                                type="number" min={0} value={l.freeQty || 0} 
                                onChange={(e) => updateLine(i, 'freeQty', Number(e.target.value) || 0)} 
                                placeholder="Free Qty"
                                title="Free Quantity"
                                className="h-7 bg-blue-50 text-[10px] text-center rounded border-blue-200 placeholder:text-blue-300" 
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rate / Price + Tax Type */}
                      {cols.priceUnit && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.priceUnit || "Price/Unit"}</Label>
                          <Input type="number" min={0} value={l.rate} onChange={(e) => updateLine(i, 'rate', Number(e.target.value) || 0)} className="h-9 bg-white text-xs text-right rounded-lg border-slate-200" />
                          {txnSet.taxOnRate && (
                            <div className="mt-1">
                              <select 
                                value={l.taxType || "inclusive"} 
                                onChange={(e) => updateLine(i, 'taxType', e.target.value)}
                                className="h-7 w-full text-[10px] rounded border border-slate-200 bg-emerald-50 px-2 font-semibold text-emerald-700 focus:outline-none"
                              >
                                <option value="inclusive">Tax Inclusive</option>
                                <option value="exclusive">Tax Exclusive</option>
                              </select>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delete Button */}
                      <div className="col-span-12 sm:col-span-1 flex sm:justify-end justify-start items-end">
                        <Button type="button" size="icon" variant="ghost" className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => removeLine(i)} disabled={lines.length === 1}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Purchase Price Tag */}
                    {txnSet.displayPurchasePrice && (
                      <div className="flex items-center gap-2 mt-2.5 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-1.5 max-w-max">
                        <span className="text-[10px] text-amber-600 font-semibold shrink-0">Purchase Price ₹</span>
                        <input 
                          type="number" value={l.purchasePrice || ""} 
                          onChange={(e) => updateLine(i, 'purchasePrice', Number(e.target.value) || 0)} 
                          placeholder="0.00" 
                          className="h-5 w-16 bg-transparent text-[11px] font-bold text-amber-800 focus:outline-none" 
                        />
                      </div>
                    )}

                    {/* Row 2: Secondary fields */}
                    <div className="grid grid-cols-12 gap-3 mt-3 items-end">
                      {/* Discount */}
                      {(cols.discount || cols.discountPercent) && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Discount %</Label>
                          <Input type="number" min={0} max={100} value={l.discount} onChange={(e) => updateLine(i, 'discount', Number(e.target.value) || 0)} className="h-9 bg-white text-xs text-center rounded-lg border-slate-200" />
                        </div>
                      )}

                      {/* GST Rate */}
                      {gstSet.enableGst && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">GST Rate %</Label>
                          <select 
                            value={[0, 5, 12, 18, 28].includes(Number(l.gst)) ? String(l.gst) : "custom"} 
                            onChange={(e) => {
                              const val = e.target.value;
                              updateLine(i, 'gst', val === "custom" ? 5 : Number(val));
                            }} 
                            className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                            <option value="custom">Custom</option>
                          </select>
                        </div>
                      )}

                      {/* Cess */}
                      {gstSet.cessOnItem && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">CESS %</Label>
                          <Input type="number" min={0} value={l.cess || ""} onChange={(e) => updateLine(i, 'cess', Number(e.target.value) || 0)} placeholder="0" className="h-9 bg-white text-xs text-center rounded-lg border-slate-200" />
                        </div>
                      )}

                      {/* Additional columns from print settings */}
                      {cols.itemCode && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.itemCode || "Item Code"}</Label>
                          <Input value={l.itemCode || ""} onChange={(e) => updateLine(i, 'itemCode', e.target.value)} placeholder="Code" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.batchNo && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.batchNo || "Batch No."}</Label>
                          <Input value={l.batchNo || ""} onChange={(e) => updateLine(i, 'batchNo', e.target.value)} placeholder="Batch" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.expDate && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.expDate || "Exp. Date"}</Label>
                          <Input value={l.expDate || ""} onChange={(e) => updateLine(i, 'expDate', e.target.value)} placeholder="MM/YY" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.mfgDate && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.mfgDate || "Mfg. Date"}</Label>
                          <Input value={l.mfgDate || ""} onChange={(e) => updateLine(i, 'mfgDate', e.target.value)} placeholder="MM/YY" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.mrp && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.mrp || "MRP"}</Label>
                          <Input type="number" value={l.mrp || ""} onChange={(e) => updateLine(i, 'mrp', Number(e.target.value) || 0)} placeholder="MRP" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.size && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.size || "Size"}</Label>
                          <Input value={l.size || ""} onChange={(e) => updateLine(i, 'size', e.target.value)} placeholder="Size" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.modelNo && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.modelNo || "Model No."}</Label>
                          <Input value={l.modelNo || ""} onChange={(e) => updateLine(i, 'modelNo', e.target.value)} placeholder="Model" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.description && (
                        <div className="col-span-12 sm:col-span-4">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.description || "Description"}</Label>
                          <Input value={l.description || ""} onChange={(e) => updateLine(i, 'description', e.target.value)} placeholder="Item notes..." className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.count && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.count || "Count"}</Label>
                          <Input type="number" value={l.count || ""} onChange={(e) => updateLine(i, 'count', Number(e.target.value) || 0)} placeholder="Count" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.colour && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.colour || "Colour"}</Label>
                          <Input value={l.colour || ""} onChange={(e) => updateLine(i, 'colour', e.target.value)} placeholder="Colour" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.material && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.material || "Material"}</Label>
                          <Input value={l.material || ""} onChange={(e) => updateLine(i, 'material', e.target.value)} placeholder="Material" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.brand && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.brand || "Brand"}</Label>
                          <Input value={l.brand || ""} onChange={(e) => updateLine(i, 'brand', e.target.value)} placeholder="Brand" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.serialNo && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.serialNo || "Serial No."}</Label>
                          <Input value={l.serialNo || ""} onChange={(e) => updateLine(i, 'serialNo', e.target.value)} placeholder="Serial" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.challanNo && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.challanNo || "Challan No."}</Label>
                          <Input value={l.challanNo || ""} onChange={(e) => updateLine(i, 'challanNo', e.target.value)} placeholder="Challan" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                      {cols.unit && (
                        <div className="col-span-4 sm:col-span-2">
                          <Label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">{colNames.unit || "Unit"}</Label>
                          <Input value={l.unit || ""} onChange={(e) => updateLine(i, 'unit', e.target.value)} placeholder="Pcs/Kgs" className="h-9 bg-white text-xs rounded-lg border-slate-200" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer / Additional Details Card */}
            {(printSet.printDescription || printSet.printTermsAndConditions || printSet.printAcknowledgement || printSet.printReceivedByDetails || printSet.printDeliveredByDetails || printSet.printSignatureText) && (
              <div className="bg-white rounded-xl p-4 shadow-sm border space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Footer & T&C Details</span>
                <div className="space-y-3">
                  {printSet.printDescription && (
                    <div className="space-y-1">
                      <Label className="text-xs">Invoice Note / Description</Label>
                      <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Enter description or note"
                        rows="3"
                        className="w-full text-xs p-2.5 border rounded-xl focus:outline-none bg-white border-slate-200"
                      />
                    </div>
                  )}
                  {printSet.printTermsAndConditions && (
                    <div className="space-y-1">
                      <Label className="text-xs">Terms & Conditions</Label>
                      <textarea 
                        value={terms} 
                        onChange={(e) => setTerms(e.target.value)} 
                        placeholder="Enter terms & conditions"
                        rows="3"
                        className="w-full text-xs p-2.5 border rounded-xl focus:outline-none bg-white border-slate-200"
                      />
                    </div>
                  )}
                  {printSet.printSignatureText && (
                    <div className="space-y-3 pt-2 border-t border-dashed">
                      <div className="space-y-1">
                        <Label className="text-xs">Signature Text</Label>
                        <Input 
                          value={signatureText} 
                          onChange={(e) => setSignatureText(e.target.value)} 
                          placeholder="e.g. Authorized Signatory"
                          className="h-9 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs block">Seal & Signature Image</Label>
                        <div className="flex items-center gap-3">
                          <label className="text-[12px] bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 cursor-pointer font-semibold transition-all">
                            Upload Seal & Sign Image
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setSignatureUrl(reader.result);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {signatureUrl && (
                            <button 
                              type="button" 
                              onClick={() => setSignatureUrl("")} 
                              className="text-[11px] text-red-500 hover:underline font-semibold"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        {signatureUrl && (
                          <div className="border rounded-xl p-2 bg-slate-50 w-32 h-16 flex items-center justify-center">
                            <img src={signatureUrl} alt="Seal & Sign" className="max-h-full max-w-full object-contain" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {printSet.printAcknowledgement && (
                    <div className="space-y-1">
                      <Label className="text-xs">Acknowledgement Text</Label>
                      <Input 
                        value={acknowledgement} 
                        onChange={(e) => setAcknowledgement(e.target.value)} 
                        placeholder="e.g. Received goods in good condition"
                        className="h-9 rounded-lg"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {printSet.printReceivedByDetails && (
                      <div className="space-y-1">
                        <Label className="text-xs">Received By</Label>
                        <Input 
                          value={receivedBy} 
                          onChange={(e) => setReceivedBy(e.target.value)} 
                          placeholder="Name of receiver"
                          className="h-9 rounded-lg"
                        />
                      </div>
                    )}
                    {printSet.printDeliveredByDetails && (
                      <div className="space-y-1">
                        <Label className="text-xs">Delivered By</Label>
                        <Input 
                          value={deliveredBy} 
                          onChange={(e) => setDeliveredBy(e.target.value)} 
                          placeholder="Name of deliverer"
                          className="h-9 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Calculations & Payment Configuration */}
            {printSet.paymentMode && (
              <div className="bg-white rounded-xl shadow-sm border p-4 space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Payment Setup</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs">Payment Status</Label>
                    <select
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="w-full h-9 rounded-lg border bg-white px-2 focus:outline-none"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partially Paid</option>
                    </select>
                  </div>
                  {status !== "Unpaid" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Payment Method</Label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full h-9 rounded-lg border bg-white px-2 focus:outline-none"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Online">Online</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  )}
                </div>

                {status !== "Unpaid" && (
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="space-y-1">
                      <Label className="text-xs">Payment Date</Label>
                      <Input 
                        type="date" 
                        value={paymentDate} 
                        onChange={(e) => setPaymentDate(e.target.value)} 
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Payment Time</Label>
                      <Input 
                        type="time" 
                        value={paymentTime} 
                        onChange={(e) => setPaymentTime(e.target.value)} 
                        className="h-9 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {status !== "Unpaid" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Amount Received (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={totals.grand}
                      disabled={status === "Paid"}
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(Number(e.target.value) || 0)}
                      className="h-9 rounded-lg text-right font-bold bg-slate-50 border-slate-200 focus-visible:bg-white"
                    />
                  </div>
                )}

                {status !== "Unpaid" && paymentMethod === "Online" && (
                  <div className="space-y-3 pt-3 border-t border-dashed border-slate-200">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Online Payment Details</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] text-slate-500 font-medium">Transaction ID / UPI</Label>
                        <Input 
                          value={paymentDetails.transactionId} 
                          onChange={(e) => handleUpiChange(e.target.value.slice(0, 30))} 
                          maxLength={30}
                          placeholder="e.g. harsh@paytm or 123456789012"
                          className={`h-9 text-xs rounded-lg ${errors.upi ? 'border-red-400 bg-red-50/50 focus-visible:ring-red-300' : 'border-slate-200'}`}
                        />
                        {errors.upi && (
                          <p className="text-[10px] text-red-500 font-medium mt-0.5">{errors.upi}</p>
                        )}
                        <p className="text-[9px] text-slate-400">UPI ID (name@bank) or 12-30 digit Txn ID</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-slate-500 font-medium">UTR Number</Label>
                        <Input 
                          value={paymentDetails.utr} 
                          onChange={(e) => handleUtrChange(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 22))} 
                          maxLength={22}
                          placeholder="e.g. UTIB12345678901234"
                          className={`h-9 text-xs rounded-lg ${errors.utr ? 'border-red-400 bg-red-50/50 focus-visible:ring-red-300' : 'border-slate-200'}`}
                        />
                        {errors.utr && (
                          <p className="text-[10px] text-red-500 font-medium mt-0.5">{errors.utr}</p>
                        )}
                        <p className="text-[9px] text-slate-400">12-22 alphanumeric characters</p>
                      </div>
                    </div>
                  </div>
                )}

                {status !== "Unpaid" && paymentMethod === "Bank Transfer" && (
                  <div className="space-y-3 pt-3 border-t border-dashed">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-slate-500">Bank Name</Label>
                        <Input 
                          value={paymentDetails.bankName} 
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })} 
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-slate-500">Account No.</Label>
                        <Input 
                          value={paymentDetails.accountNumber} 
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, accountNumber: e.target.value })} 
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-slate-500">IFSC Code</Label>
                        <Input 
                          value={paymentDetails.ifsc} 
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, ifsc: e.target.value })} 
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Print Preview styled as selected Vyapar Theme */}
        <div className={`w-full md:w-1/2 lg:w-7/12 flex flex-col h-full bg-slate-200 overflow-y-auto p-4 custom-scrollbar ${activePane === 'form' ? 'hidden md:flex' : 'flex'}`}>
          


          <div className="bg-white shadow-xl rounded-xl border border-slate-300 w-full min-h-[297mm] p-6 text-[11px] text-slate-800 leading-normal relative mx-auto max-w-[210mm] overflow-hidden">
            <InvoiceTemplateRenderer
              invoice={{
                customer,
                receivedAmount,
                status,
                paymentMethod,
                paymentDetails,
                lines,
                reverseCharge,
                challanNo,
                vehicleNo,
                dateOfSupply,
                placeOfSupply,
                billedToAddress,
                billedToGstin,
                billedToMobile,
                billedToState,
                invoiceNumber: "INV-" + (settings?.lastInvoiceNo || "1001"),
                date: paymentDate ? new Date(paymentDate + "T12:00:00").toISOString() : new Date().toISOString(),
                time: paymentTime,
                terms,
                description,
                receivedBy,
                deliveredBy,
                acknowledgement,
                partyBalance
              }}
              printSettings={{
                ...printSet,
                companyName: sellerName,
                address: sellerAddress,
                email: sellerEmail,
                phone: sellerPhone,
                signatureText: signatureText,
                signatureUrl: signatureUrl
              }}
              gstSettings={{
                ...gstSet,
                gstin: sellerGstin
              }}
              templateName={invoiceTemplate}
              themeColor={themeColor}
              numberToWords={numberToWords}
            />
          </div>

            {/* Visual Invoice Theme Colors Selector */}
            <div className="mt-4 bg-white border border-slate-300 rounded-xl p-4 shadow-sm shrink-0">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Select Template Theme Accent Color</h3>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { id: "slate", class: "bg-slate-800 text-white", name: "Slate" },
                  { id: "red", class: "bg-rose-600 text-white", name: "Rose" },
                  { id: "blue", class: "bg-blue-600 text-white", name: "Blue" },
                  { id: "emerald", class: "bg-emerald-600 text-white", name: "Emerald" },
                  { id: "purple", class: "bg-purple-600 text-white", name: "Purple" },
                  { id: "amber", class: "bg-amber-500 text-slate-900", name: "Amber" },
                  { id: "rose", class: "bg-pink-600 text-white", name: "Pink" },
                  { id: "indigo", class: "bg-indigo-600 text-white", name: "Indigo" }
                ].map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setThemeColor(col.id)}
                    className={`h-8 px-3 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 ${
                      col.class
                    } ${
                      themeColor === col.id
                        ? "ring-2 ring-offset-2 ring-emerald-500 scale-105"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-white/30" />
                    {col.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Invoice Template Selector Cards */}
            <div className="mt-4 bg-white border border-slate-300 rounded-xl p-4 shadow-sm shrink-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Select Invoice Template Layout</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold uppercase">
                  Plan: {user?.subscription?.plan || "Free"}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  {
                    id: "GST Boxed",
                    name: "GST Boxed",
                    desc: "Classic Tally Grid",
                    plan: "Free",
                    preview: (
                      <div className="h-8 w-12 rounded border border-slate-300 bg-white flex flex-col p-0.5 space-y-0.5 mb-1.5 overflow-hidden">
                        <div className="h-1.5 bg-slate-800 w-full" />
                        <div className="h-1 bg-slate-100 w-2/3" />
                        <div className="flex-1 border border-slate-200" />
                      </div>
                    )
                  },
                  {
                    id: "Classic White",
                    name: "Classic White",
                    desc: "Clean Minimal",
                    plan: "Free",
                    preview: (
                      <div className="h-8 w-12 rounded border border-slate-300 bg-white flex flex-col p-0.5 space-y-0.5 mb-1.5 overflow-hidden justify-between">
                        <div className="h-1 bg-slate-400 w-1/3 mx-auto" />
                        <div className="h-2 border-t border-b border-slate-100 w-full" />
                        <div className="h-1 bg-slate-300 w-1/4 self-end" />
                      </div>
                    )
                  },
                  {
                    id: "Modern Green",
                    name: "Modern Green",
                    desc: "Emerald Solid",
                    plan: "Silver",
                    preview: (
                      <div className="h-8 w-12 rounded border border-slate-300 bg-white flex flex-col p-0.5 space-y-0.5 mb-1.5 overflow-hidden">
                        <div className="h-2.5 bg-emerald-600 w-full" />
                        <div className="h-1 bg-slate-100 w-1/2" />
                        <div className="flex-1 border-t border-slate-100" />
                      </div>
                    )
                  },
                  {
                    id: "Stylish Blue",
                    name: "Stylish Blue",
                    desc: "Navy Corporate",
                    plan: "Gold",
                    preview: (
                      <div className="h-8 w-12 rounded border border-slate-300 bg-white flex flex-col p-0.5 space-y-0.5 mb-1.5 overflow-hidden">
                        <div className="h-2.5 bg-slate-900 w-full border-b border-blue-600" />
                        <div className="flex-1 border-t border-slate-100" />
                      </div>
                    )
                  },
                  {
                    id: "Minimalist",
                    name: "Minimalist",
                    desc: "Compact Mono",
                    plan: "Gold",
                    preview: (
                      <div className="h-8 w-12 rounded border border-slate-200 bg-white flex flex-col p-0.5 space-y-0.5 mb-1.5 overflow-hidden justify-center">
                        <div className="h-0.5 bg-slate-400 w-3/4 animate-pulse" />
                        <div className="h-3 w-full space-y-0.5 mt-1">
                          <div className="h-0.5 bg-slate-200 w-full" />
                          <div className="h-0.5 bg-slate-200 w-full" />
                        </div>
                      </div>
                    )
                  },
                  {
                    id: "Crimson Rose",
                    name: "Crimson Rose",
                    desc: "Red Highlight",
                    plan: "Gold",
                    preview: (
                      <div className="h-8 w-12 rounded border border-slate-300 bg-white flex flex-col p-0.5 space-y-0.5 mb-1.5 overflow-hidden">
                        <div className="h-2.5 bg-rose-600 w-full" />
                        <div className="flex-1 border-t border-slate-100" />
                      </div>
                    )
                  },
                  {
                    id: "Warm Amber",
                    name: "Warm Amber",
                    desc: "Amber Gold",
                    plan: "Enterprise",
                    preview: (
                      <div className="h-8 w-12 rounded border border-slate-300 bg-white flex flex-col p-0.5 space-y-0.5 mb-1.5 overflow-hidden">
                        <div className="h-2.5 bg-amber-500 w-full" />
                        <div className="flex-1 border-t border-slate-100" />
                      </div>
                    )
                  },
                  {
                    id: "Royal Purple",
                    name: "Royal Purple",
                    desc: "Royal Violet",
                    plan: "Enterprise",
                    preview: (
                      <div className="h-8 w-12 rounded border border-slate-300 bg-white flex flex-col p-0.5 space-y-0.5 mb-1.5 overflow-hidden">
                        <div className="h-2.5 bg-purple-600 w-full" />
                        <div className="flex-1 border-t border-slate-100" />
                      </div>
                    )
                  },
                  {
                    id: "Charcoal Dark",
                    name: "Charcoal Dark",
                    desc: "Sleek Dark",
                    plan: "Enterprise",
                    preview: (
                      <div className="h-8 w-12 rounded border border-slate-300 bg-white flex flex-col p-0.5 space-y-0.5 mb-1.5 overflow-hidden">
                        <div className="h-2.5 bg-slate-800 w-full" />
                        <div className="flex-1 border-t border-slate-100" />
                      </div>
                    )
                  },
                  {
                    id: "Tally Classic",
                    name: "Tally Classic",
                    desc: "Retro Monochrome",
                    plan: "Enterprise",
                    preview: (
                      <div className="h-8 w-12 rounded border border-slate-300 bg-white flex flex-col p-0.5 space-y-0.5 mb-1.5 overflow-hidden border-double border-4 border-slate-700">
                        <div className="h-1 bg-slate-200 w-full" />
                        <div className="flex-1 border-t border-slate-300" />
                      </div>
                    )
                  }
                ].map((tpl) => {
                  const requiredPlan = tpl.plan;
                  const currentPlan = user?.subscription?.plan || "Free";
                  
                  const plansOrder = ["Free", "Silver", "Gold", "Enterprise"];
                  const hasAccess = plansOrder.indexOf(currentPlan) >= plansOrder.indexOf(requiredPlan);

                  const handleSelect = () => {
                    if (!hasAccess) {
                      toast.error(`"${tpl.id}" is a premium template. Please upgrade to ${requiredPlan} Plan to unlock this format.`);
                      return;
                    }
                    setInvoiceTemplate(tpl.id);
                  };

                  return (
                    <button
                      key={tpl.id}
                      onClick={handleSelect}
                      className={`flex flex-col items-center p-2.5 rounded-lg border text-center transition-all relative ${
                        !hasAccess ? "opacity-50 hover:opacity-70 bg-slate-100/50" : ""
                      } ${
                        invoiceTemplate === tpl.id
                          ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500 scale-105"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                      }`}
                    >
                      {tpl.preview}
                      <span className="text-[10px] font-bold text-slate-800 leading-tight block">{tpl.name}</span>
                      <span className="text-[8px] text-slate-500 block leading-tight mt-0.5">{tpl.desc}</span>
                      {!hasAccess && (
                        <span className="absolute top-1 right-1 text-[8px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-extrabold uppercase scale-90">
                          {requiredPlan}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Bottom Action bar */}
      <div className="sticky bottom-0 shrink-0 bg-white border-t p-4 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:justify-center">
        <Button variant="outline" className="flex-1 rounded-full h-12 text-[14px] font-bold border-slate-300 md:max-w-xs" onClick={() => handleSave(false)}>
          SAVE INVOICE
        </Button>
        <Button className="flex-[2] rounded-full h-12 text-[14px] font-bold bg-emerald-500 hover:bg-emerald-600 md:max-w-xs" onClick={() => handleSave(true)}>
          <Send className="mr-2 h-4 w-4" />
          SAVE & SEND BILL
        </Button>
      </div>
    </div>
  );
}
