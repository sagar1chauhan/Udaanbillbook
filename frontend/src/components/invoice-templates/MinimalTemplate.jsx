import React from "react";

export function MinimalTemplate({ invoice, printSet, gstSet, activeColor, numberToWords }) {
  const { customer, lines, totals, meta, paymentDetails } = invoice;
  return (
    <div className="font-mono bg-white text-slate-800 text-[10px] leading-tight space-y-4 p-2">
      {/* Top compact line info */}
      <div className="flex justify-between border-b pb-2 border-slate-200">
        <div>
          {printSet.printCompanyName && (
            <h1 className="text-xs font-bold text-slate-900 uppercase">
              {printSet.companyName || "KESHAV TRAVELS"}
            </h1>
          )}
          <span className="text-[9px] text-slate-500">GSTIN: {gstSet.gstin || "07AQXPD2556K2ZB"}</span>
        </div>
        <div className="text-right">
          <p className={`font-extrabold uppercase text-[11px] ${activeColor.text}`}>TAX INVOICE</p>
          <p>INV NO: {meta.invoiceNumber}</p>
          <p>DATE: {meta.date}</p>
        </div>
      </div>

      {/* Customer block minimal */}
      <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between items-start gap-4">
        <div>
          <span className="text-[8px] text-slate-400 font-bold uppercase block mb-0.5">Billed To:</span>
          <p className="font-bold text-slate-900">{customer}</p>
          {meta.billedToAddress && <p className="text-[9px] text-slate-500">{meta.billedToAddress}</p>}
        </div>
        {meta.vehicleNo && (
          <div className="text-right">
            <span className="text-[8px] text-slate-400 font-bold uppercase block mb-0.5">Vehicle / Supply:</span>
            <p className="font-bold text-slate-900">{meta.vehicleNo}</p>
            <p className="text-[9px] text-slate-500">{meta.placeOfSupply}</p>
          </div>
        )}
      </div>

      {/* Minimal Table */}
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-400 text-slate-500 uppercase text-[9px] font-bold">
            <th className="py-1">Description</th>
            <th className="py-1 text-center w-16">HSN</th>
            <th className="py-1 text-center w-10">Qty</th>
            <th className="py-1 text-right w-16">Rate</th>
            <th className="py-1 text-right w-18">Tax</th>
            <th className="py-1 text-right w-20">Total</th>
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
                <td className="py-1.5 font-bold text-slate-800">{l.name || "Product/Service"}</td>
                <td className="py-1.5 text-center font-mono">{l.hsnSac || "-"}</td>
                <td className="py-1.5 text-center">{q}</td>
                <td className="py-1.5 text-right font-mono">{r.toFixed(2)}</td>
                <td className="py-1.5 text-right font-mono">{totalTax.toFixed(2)} ({g}%)</td>
                <td className="py-1.5 text-right font-extrabold font-mono text-slate-900">{lineTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary compact */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-t pt-2 border-slate-200">
        <div className="text-[8px] text-slate-400 space-y-1">
          <p>Bank: {paymentDetails.bankName || "Axis Bank"} | A/c: {paymentDetails.accountNumber || "921020024898267"}</p>
          <p>IFSC: {paymentDetails.ifsc || "UTIB0003532"}</p>
        </div>
        <div className="text-right space-y-1 w-64 text-[10px] font-mono border-t pt-1 border-slate-100">
          <div className="flex justify-between"><span>Taxable Amount</span><span>{totals.taxableAmount.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>GST Amount</span><span>{totals.gstAmount.toFixed(2)}</span></div>
          <div className={`flex justify-between font-extrabold text-[11px] border-t-2 pt-1 border-slate-800 ${activeColor.text}`}>
            <span>Total Payable</span><span>{totals.grand.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
