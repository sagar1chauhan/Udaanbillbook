import React from "react";

export function ProfessionalTemplate({ invoice, printSet, gstSet, activeColor, numberToWords }) {
  const { customer, lines, totals, meta, paymentDetails } = invoice;
  return (
    <div className="font-sans bg-white p-6 border-t-8 border-b-8 border-l border-r border-slate-200 text-slate-800 text-[10px] leading-relaxed shadow-sm flex flex-col space-y-6"
      style={{ borderTopColor: activeColor.raw || "#1e293b", borderBottomColor: activeColor.raw || "#1e293b" }}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          {printSet.printCompanyName && (
            <h1 className={`text-base font-extrabold uppercase ${activeColor.text}`}>
              {printSet.companyName || "KESHAV TRAVELS"}
            </h1>
          )}
          {printSet.printAddress && (
            <p className="text-[9px] text-slate-500 max-w-sm whitespace-pre-line leading-tight">
              {printSet.address || "S-99/134 first floor moti lal nehru camp JNU, New Delhi"}
            </p>
          )}
        </div>
        <div className="text-right space-y-1">
          <span className={`text-[11px] font-black tracking-widest uppercase bg-slate-50 border px-3 py-1 rounded inline-block ${activeColor.text}`}>
            TAX INVOICE
          </span>
          <p className="font-mono text-[9px]">Invoice Number: <span className="font-bold">{meta.invoiceNumber}</span></p>
          <p className="font-mono text-[9px]">Invoice Date: {meta.date}</p>
        </div>
      </div>

      {/* Customer Info Card Container */}
      <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider">Client Description</span>
          <p className="font-bold text-slate-900 text-[11px]">{customer}</p>
          {meta.billedToAddress && <p className="text-slate-500 leading-tight">{meta.billedToAddress}</p>}
          {meta.billedToMobile && <p className="text-slate-500">Mob: {meta.billedToMobile}</p>}
        </div>
        <div className="space-y-1 font-mono text-[9px] sm:text-right">
          <span className="text-[8px] text-slate-400 font-bold uppercase block tracking-wider sm:text-right">Transport / Supply Details</span>
          {meta.vehicleNo && <p><span className="text-slate-400">Vehicle:</span> {meta.vehicleNo}</p>}
          {meta.placeOfSupply && <p><span className="text-slate-400">Place of Supply:</span> {meta.placeOfSupply}</p>}
          {meta.billedToGstin && <p><span className="text-slate-400">GSTIN:</span> {meta.billedToGstin}</p>}
        </div>
      </div>

      {/* Professional Grid Table */}
      <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className={`text-[9px] font-bold uppercase divide-x divide-white/10 ${activeColor.bg} text-white`}>
              <th className="p-2.5 text-center w-8">#</th>
              <th className="p-2.5">Item Details</th>
              <th className="p-2.5 text-center w-20">HSN</th>
              <th className="p-2.5 text-center w-12">Qty</th>
              <th className="p-2.5 text-right w-20">Price</th>
              <th className="p-2.5 text-right w-24">Taxable Amt</th>
              <th className="p-2.5 text-right w-24">Total</th>
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

              return (
                <tr key={idx} className="divide-x divide-slate-100 text-[10px] text-slate-700">
                  <td className="p-2.5 text-center">{idx + 1}</td>
                  <td className="p-2.5 font-bold text-slate-900">{l.name || "Product/Service"}</td>
                  <td className="p-2.5 text-center font-mono">{l.hsnSac || "-"}</td>
                  <td className="p-2.5 text-center">{q}</td>
                  <td className="p-2.5 text-right font-mono">{r.toFixed(2)}</td>
                  <td className="p-2.5 text-right font-mono">{taxableVal.toFixed(2)}</td>
                  <td className="p-2.5 text-right font-extrabold font-mono text-slate-900">{lineTotal.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Double Signatory Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch gap-6 pt-4 border-t border-slate-100">
        <div className="flex-1 space-y-2">
          <div className="bg-slate-50 border rounded-lg p-3 text-[9px] space-y-1 font-mono">
            <span className="font-bold text-[8px] uppercase tracking-wider block text-slate-400 mb-1">Billing Summary</span>
            <div className="flex justify-between"><span>Taxable amount</span><span>{totals.taxableAmount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>GST Taxes</span><span>{totals.gstAmount.toFixed(2)}</span></div>
            <div className={`flex justify-between font-extrabold text-[10px] border-t pt-1 ${activeColor.text}`}>
              <span>Total Payable</span><span>{totals.grand.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-500 italic">{numberToWords(totals.grand)}</p>
        </div>
        <div className="w-64 border rounded-xl p-3 flex flex-col justify-between items-center text-center bg-slate-50/50 min-h-[90px]">
          <span className="text-[8px] text-slate-400 italic">For {printSet.companyName || "KESHAV TRAVELS"}</span>
          <span className="text-[8px] text-slate-400 font-bold border-t w-full pt-1.5 uppercase">Authorised Signatory</span>
        </div>
      </div>

    </div>
  );
}
