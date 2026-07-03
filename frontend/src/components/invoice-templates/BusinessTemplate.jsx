import React from "react";

export function BusinessTemplate({ invoice, printSet, gstSet, activeColor, numberToWords }) {
  const { customer, lines, totals, meta, paymentDetails } = invoice;
  return (
    <div className="font-sans bg-white p-6 border-2 border-slate-200 text-slate-800 text-[11px] leading-relaxed shadow-sm">
      {/* Split Header layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b pb-4 mb-4">
        <div>
          {printSet.printCompanyName && (
            <h1 className={`text-base font-extrabold uppercase ${activeColor.text}`}>
              {printSet.companyName || "KESHAV TRAVELS"}
            </h1>
          )}
          {printSet.printAddress && (
            <p className="text-[10px] text-slate-500 max-w-sm">
              {printSet.address || "S-99/134 first floor moti lal nehru camp JNU, New Delhi"}
            </p>
          )}
          {printSet.printGstin && (
            <span className="text-[10px] text-slate-600 block mt-1">GSTIN: {gstSet.gstin || "07AQXPD2556K2ZB"}</span>
          )}
        </div>
        <div className="text-right space-y-1">
          <span className={`text-xs font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded inline-block ${activeColor.text}`}>
            Invoice Bill
          </span>
          <p className="font-mono text-[10px]">Invoice No: <span className="font-bold">{meta.invoiceNumber}</span></p>
          <p className="font-mono text-[10px]">Date: {meta.date}</p>
        </div>
      </div>

      {/* Customer Info Box Side-by-side columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
        <div>
          <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-1">Customer / Consignee:</span>
          <p className="font-bold text-slate-900">{customer}</p>
          {meta.billedToAddress && <p className="text-slate-500 text-[10px]">{meta.billedToAddress}</p>}
          {meta.billedToMobile && <p className="text-slate-500 text-[10px]">Mob: {meta.billedToMobile}</p>}
          {meta.billedToGstin && <p className="text-slate-600 font-mono text-[9px] mt-1">GSTIN: {meta.billedToGstin}</p>}
        </div>
        <div className="space-y-1">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-1">Shipment & Supply:</span>
          {meta.vehicleNo && <p className="text-[10px]"><span className="font-semibold text-slate-500">Vehicle No:</span> {meta.vehicleNo}</p>}
          {meta.placeOfSupply && <p className="text-[10px]"><span className="font-semibold text-slate-500">Place of Supply:</span> {meta.placeOfSupply}</p>}
          {meta.challanNo && <p className="text-[10px]"><span className="font-semibold text-slate-500">Challan No:</span> {meta.challanNo}</p>}
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-4 border border-slate-200">
        <thead>
          <tr className={`text-[10px] font-bold uppercase divide-x divide-slate-200 border-b border-slate-200 ${activeColor.bg} text-white`}>
            <th className="p-2 text-center w-8">#</th>
            <th className="p-2">Description of Services</th>
            <th className="p-2 text-center w-20">HSN Code</th>
            <th className="p-2 text-center w-12">Qty</th>
            <th className="p-2 text-right w-20">Rate</th>
            <th className="p-2 text-right w-24">CGST / SGST</th>
            <th className="p-2 text-right w-24">Taxable Value</th>
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
            const cgstHalf = (lineTotal - taxableVal) / 2;

            return (
              <tr key={idx} className="divide-x divide-slate-100 text-[10px] text-slate-700">
                <td className="p-2 text-center">{idx + 1}</td>
                <td className="p-2 font-semibold text-slate-900">{l.name || "Item Details"}</td>
                <td className="p-2 text-center font-mono">{l.hsnSac || "-"}</td>
                <td className="p-2 text-center">{q}</td>
                <td className="p-2 text-right font-mono">{r.toFixed(2)}</td>
                <td className="p-2 text-right font-mono">{cgstHalf.toFixed(2)} x 2 <span className="text-[8px] text-slate-400">({g}%)</span></td>
                <td className="p-2 text-right font-bold font-mono text-slate-900">{lineTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Calculations row */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="text-[10px] text-slate-500 max-w-sm space-y-1">
          <p className="font-bold text-slate-700 uppercase text-[9px]">Terms of Service:</p>
          <p className="leading-tight">All claims must be presented within 15 days of invoice date.</p>
        </div>
        <div className="w-72 bg-slate-50 border rounded-lg p-3 space-y-1.5 font-mono text-[10px]">
          <div className="flex justify-between"><span>Gross Subtotal</span><span>{totals.taxableAmount.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>CGST / SGST</span><span>{totals.gstAmount.toFixed(2)}</span></div>
          <div className={`flex justify-between font-extrabold text-[12px] border-t pt-1.5 ${activeColor.text}`}>
            <span>Total Payable</span><span>{totals.grand.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
