import React from "react";

export function ClassicTemplate({ invoice, printSet, gstSet, activeColor, numberToWords }) {
  const { customer, lines, totals, meta, paymentDetails } = invoice;
  return (
    <div className="font-serif bg-white p-6 border border-slate-200 text-slate-800 text-[11px] leading-relaxed shadow-sm">
      {/* Title */}
      <div className={`text-center font-bold tracking-widest text-base mb-4 border-b pb-2 ${activeColor.text}`}>
        TAX INVOICE
      </div>

      {/* Header Centered */}
      <div className="text-center space-y-1 mb-6">
        {printSet.printCompanyName && (
          <h1 className="text-lg font-extrabold text-slate-900 uppercase">
            {printSet.companyName || "KESHAV TRAVELS"}
          </h1>
        )}
        {printSet.printAddress && (
          <p className="text-[10px] text-slate-500 whitespace-pre-line">
            {printSet.address || "S-99/134 first floor moti lal nehru camp JNU, New Delhi"}
          </p>
        )}
        <div className="text-[10px] text-slate-500 flex justify-center gap-4">
          {printSet.printPhone && <span>Phone: {printSet.phone || "+919718403525"}</span>}
          {printSet.printEmail && <span>Email: {printSet.email || "dpakk1989@gmail.com"}</span>}
        </div>
        {printSet.printGstin && (
          <p className="text-[10px] font-mono font-semibold text-slate-700 bg-slate-50 inline-block px-3 py-0.5 rounded border">
            GSTIN: {gstSet.gstin || "07AQXPD2556K2ZB"}
          </p>
        )}
      </div>

      {/* Customer Info Card & Metadata Side-by-side */}
      <div className="grid grid-cols-2 gap-6 border-t border-b py-4 mb-6 border-slate-200 font-sans">
        <div>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h4>
          <p className="font-bold text-slate-900 text-xs mb-1">{customer}</p>
          {meta.billedToAddress && <p className="text-slate-500 text-[10px]">{meta.billedToAddress}</p>}
          {meta.billedToMobile && <p className="text-slate-500 text-[10px]">Mobile: {meta.billedToMobile}</p>}
          {meta.billedToGstin && <p className="text-slate-600 font-mono text-[9px] mt-1">GSTIN: {meta.billedToGstin}</p>}
        </div>
        <div className="text-right space-y-1 text-[10px] font-mono">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Invoice Info</h4>
          <p><span className="text-slate-400">Invoice No:</span> <span className="font-bold text-slate-800">{meta.invoiceNumber}</span></p>
          <p><span className="text-slate-400">Date:</span> {meta.date}</p>
          {meta.vehicleNo && <p><span className="text-slate-400">Vehicle No:</span> {meta.vehicleNo}</p>}
          {meta.placeOfSupply && <p><span className="text-slate-400">Place of Supply:</span> {meta.placeOfSupply}</p>}
        </div>
      </div>

      {/* Lines Table */}
      <table className="w-full text-left font-sans mb-6">
        <thead>
          <tr className={`border-b-2 border-slate-300 text-[9px] font-bold uppercase text-slate-600`}>
            <th className="py-2 w-8">#</th>
            <th className="py-2">Item / Description</th>
            <th className="py-2 text-center w-20">HSN</th>
            <th className="py-2 text-center w-12">Qty</th>
            <th className="py-2 text-right w-20">Rate</th>
            <th className="py-2 text-right w-24">Taxable Amt</th>
            <th className="py-2 text-right w-24">GST Amt</th>
            <th className="py-2 text-right w-24">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {lines.map((l, idx) => {
            const q = Number(l.qty) || 0;
            const r = Number(l.rate) || 0;
            const d = Number(l.discount) || 0;
            const g = Number(l.gst) || 0;

            const rateAfterDisc = r * (1 - d / 100);
            const lineTotal = q * rateAfterDisc;
            const taxableVal = lineTotal / (1 + g / 100);
            const totalTax = lineTotal - taxableVal;

            return (
              <tr key={idx} className="text-[10px] text-slate-700">
                <td className="py-2.5">{idx + 1}</td>
                <td className="py-2.5 font-medium text-slate-900">{l.name || "Product Item"}</td>
                <td className="py-2.5 text-center font-mono">{l.hsnSac || "-"}</td>
                <td className="py-2.5 text-center">{q}</td>
                <td className="py-2.5 text-right font-mono">{r.toFixed(2)}</td>
                <td className="py-2.5 text-right font-mono">{taxableVal.toFixed(2)}</td>
                <td className="py-2.5 text-right font-mono">{totalTax.toFixed(2)} <span className="text-[8px] text-slate-400">({g}%)</span></td>
                <td className="py-2.5 text-right font-bold font-mono text-slate-900">{lineTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Calculations & Bank */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4 border-slate-200">
        <div className="space-y-4">
          <div className="border rounded-xl p-3 bg-slate-50 space-y-1.5 font-sans text-[10px]">
            <span className="font-bold text-[9px] text-slate-500 uppercase tracking-wider block">Remittance Info</span>
            <div className="grid grid-cols-2 gap-1 text-slate-600">
              <span>Bank Name:</span><span className="font-semibold text-slate-900">{paymentDetails.bankName || "Axis Bank"}</span>
              <span>Account Number:</span><span className="font-semibold text-slate-900">{paymentDetails.accountNumber || "921020024898267"}</span>
              <span>IFSC Code:</span><span className="font-semibold text-slate-900">{paymentDetails.ifsc || "UTIB0003532"}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 italic">
            <span className="font-bold block not-italic uppercase text-[8px] text-slate-400 mb-1">In Words</span>
            {numberToWords(totals.grand)}
          </div>
        </div>

        <div className="flex justify-end font-sans text-[10px]">
          <table className="w-64 space-y-2">
            <tbody>
              <tr className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Gross Total</span>
                <span>{totals.taxableAmount.toFixed(2)}</span>
              </tr>
              <tr className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">CGST Amount</span>
                <span>{(totals.gstAmount / 2).toFixed(2)}</span>
              </tr>
              <tr className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">SGST Amount</span>
                <span>{(totals.gstAmount / 2).toFixed(2)}</span>
              </tr>
              <tr className="flex justify-between py-2 border-b border-slate-200 font-bold text-slate-900">
                <span>Net Payable (Inc Tax)</span>
                <span className={activeColor.text}>{totals.grand.toFixed(2)}</span>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
