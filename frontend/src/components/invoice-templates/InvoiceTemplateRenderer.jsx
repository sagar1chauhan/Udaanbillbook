import React from "react";
import { useMockAuth } from "@/lib/auth-store";
import { GSTBoxedTemplate } from "./GSTBoxedTemplate";
import { ClassicTemplate } from "./ClassicTemplate";
import { ModernTemplate } from "./ModernTemplate";
import { MinimalTemplate } from "./MinimalTemplate";
import { BusinessTemplate } from "./BusinessTemplate";
import { CorporateTemplate } from "./CorporateTemplate";
import { RetailTemplate } from "./RetailTemplate";
import { ProfessionalTemplate } from "./ProfessionalTemplate";

export function normalizeInvoice(inv) {
  if (!inv) return null;
  const lines = inv.lines || inv.items || [];
  const customer = inv.customer || inv.partyName || "Walk-in Customer";
  const totals = inv.totals || {
    subtotal: inv.subtotal || 0,
    discountAmount: inv.discountAmount || 0,
    taxableAmount: inv.taxableAmount || 0,
    gstAmount: inv.gstAmount || 0,
    roundOff: inv.roundOff || 0,
    grand: inv.grandTotal || inv.grand || 0
  };
  const meta = {
    reverseCharge: inv.reverseCharge || "No",
    challanNo: inv.challanNo || "",
    vehicleNo: inv.vehicleNo || "",
    dateOfSupply: inv.dateOfSupply || "",
    placeOfSupply: inv.placeOfSupply || "Delhi",
    billedToAddress: inv.billedToAddress || "",
    billedToGstin: inv.billedToGstin || "",
    billedToMobile: inv.billedToMobile || "",
    billedToState: inv.billedToState || "",
    invoiceNumber: inv.invoiceNumber || "INV-XXXX",
    date: inv.date 
      ? `${new Date(inv.date).toLocaleDateString('en-IN')}${inv.time ? ' ' + inv.time : ''}` 
      : `${new Date().toLocaleDateString('en-IN')}${inv.time ? ' ' + inv.time : ''}`
  };
  return { 
    customer, 
    lines, 
    totals, 
    meta, 
    status: inv.status || "Unpaid", 
    paymentMethod: inv.paymentMethod || "Cash", 
    paymentDetails: inv.paymentDetails || {},
    description: inv.description || "",
    terms: inv.terms || "",
    receivedBy: inv.receivedBy || "",
    deliveredBy: inv.deliveredBy || "",
    acknowledgement: inv.acknowledgement || "",
    partyBalance: inv.partyBalance || ""
  };
}

export function InvoiceTemplateRenderer({ invoice, printSettings, gstSettings, templateName, themeColor, numberToWords }) {
  const { user } = useMockAuth();
  if (!invoice) return null;
  const normalized = normalizeInvoice(invoice);

  const printSet = printSettings || {
    printCompanyName: true,
    companyName: "KESHAV TRAVELS",
    printAddress: true,
    address: "S-99/134 first floor moti lal nehru camp JNU, New Delhi, Delhi, 110067",
    printPhone: true,
    phone: "+919718403525",
    printEmail: true,
    email: "dpakk1989@gmail.com"
  };

  const gstSet = gstSettings || {
    gstin: "07AQXPD2556K2ZB"
  };

  const colorMap = {
    slate: { bg: "bg-slate-800", text: "text-slate-800", border: "border-slate-800", focus: "ring-slate-500", raw: "#1e293b" },
    red: { bg: "bg-rose-600", text: "text-rose-600", border: "border-rose-600", focus: "ring-rose-500", raw: "#e11d48" },
    blue: { bg: "bg-blue-600", text: "text-blue-600", border: "border-blue-600", focus: "ring-blue-500", raw: "#2563eb" },
    emerald: { bg: "bg-emerald-600", text: "text-emerald-600", border: "border-emerald-600", focus: "ring-emerald-500", raw: "#059669" },
    purple: { bg: "bg-purple-600", text: "text-purple-600", border: "border-purple-600", focus: "ring-purple-500", raw: "#9333ea" },
    amber: { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-500", focus: "ring-amber-500", raw: "#d97706" },
    rose: { bg: "bg-pink-600", text: "text-pink-600", border: "border-pink-600", focus: "ring-pink-500", raw: "#db2777" },
    indigo: { bg: "bg-indigo-600", text: "text-indigo-600", border: "border-indigo-600", focus: "ring-indigo-500", raw: "#4f46e5" }
  };

  const activeColor = colorMap[themeColor] || colorMap.slate;

  // Resolve template components
  const templateJSX = (() => {
    switch (templateName) {
      case "GST Boxed":
        return <GSTBoxedTemplate invoice={normalized} printSet={printSet} gstSet={gstSet} activeColor={activeColor} numberToWords={numberToWords} />;
      case "Classic White":
        return <ClassicTemplate invoice={normalized} printSet={printSet} gstSet={gstSet} activeColor={activeColor} numberToWords={numberToWords} />;
      case "Modern Green":
      case "Stylish Blue":
      case "Charcoal Dark":
        return <ModernTemplate invoice={normalized} printSet={printSet} gstSet={gstSet} activeColor={activeColor} numberToWords={numberToWords} />;
      case "Minimalist":
        return <MinimalTemplate invoice={normalized} printSet={printSet} gstSet={gstSet} activeColor={activeColor} numberToWords={numberToWords} />;
      case "Crimson Rose":
        return <BusinessTemplate invoice={normalized} printSet={printSet} gstSet={gstSet} activeColor={activeColor} numberToWords={numberToWords} />;
      case "Warm Amber":
        return <CorporateTemplate invoice={normalized} printSet={printSet} gstSet={gstSet} activeColor={activeColor} numberToWords={numberToWords} />;
      case "Royal Purple":
        return <ProfessionalTemplate invoice={normalized} printSet={printSet} gstSet={gstSet} activeColor={activeColor} numberToWords={numberToWords} />;
      case "Tally Classic":
      default:
        return <RetailTemplate invoice={normalized} printSet={printSet} gstSet={gstSet} activeColor={activeColor} numberToWords={numberToWords} />;
    }
  })();

  const showLogo = user?.subscription?.showUdaanLogo !== false;

  return (
    <div className="relative flex flex-col justify-between h-full min-h-[inherit]">
      <div className="flex-1">
        {templateJSX}
      </div>
      {showLogo && (
        <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-sans print:flex">
          <span>Generated using</span>
          <img src="/udaan-logo-removebg-preview.png" alt="Udaan" className="h-3.5 w-3.5 object-contain" />
          <span className="font-semibold text-slate-600">Udaan BillBook</span>
        </div>
      )}
    </div>
  );
}
