import React from "react";

export function RetailTemplate({ invoice, printSet, gstSet, activeColor, numberToWords }) {
  const { customer, lines, totals, meta, paymentDetails } = invoice;
  return (
    <div className="font-mono bg-white border border-slate-300 text-slate-800 text-[10px] p-4 shadow-sm flex flex-col space-y-4 max-w-md mx-auto">
      {/* Retail Banner Header */}
      <div className="text-center border-b-2 border-dashed pb-3 space-y-1">
        {printSet.printCompanyName && (
          <h2 className="text-sm font-black uppercase tracking-wider">{printSet.companyName || "KESHAV TRAVELS"}</h2>
        )}
        <p className="text-[9px] text-slate-500 whitespace-pre-line leading-tight">
          {printSet.address || "S-99/134 first floor moti lal nehru camp JNU, New Delhi"}
        </p>
        <p className="text-[9px] font-bold">GSTIN: {gstSet.gstin || "07AQXPD2556K2ZB"}</p>
        <div className={`text-[10px] font-extrabold uppercase pt-1.5 ${activeColor.text}`}>RETAIL CASH MEMO</div>
      </div>

      {/* Mini Customer & Meta Card */}
      <div className="text-[9px] space-y-1 bg-slate-50 p-2.5 rounded border border-slate-100">
        <p><span className="font-bold">INVOICE:</span> {meta.invoiceNumber} | <span className="font-bold">DATE:</span> {meta.date}</p>
        <p><span className="font-bold">CUSTOMER:</span> {customer}</p>
        {meta.billedToMobile && <p><span className="font-bold">MOBILE:</span> {meta.billedToMobile}</p>}
      </div>

      {/* Retail Table without complex HSN/GST divisions */}
      <table className="w-full text-left border-b border-dashed pb-2">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500 uppercase text-[8px] font-bold">
            <th className="py-1">Item Description</th>
            <th className="py-1 text-center w-12">Qty</th>
            <th className="py-1 text-right w-16">Price</th>
            <th className="py-1 text-right w-20">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {lines.map((l, idx) => {
            const q = Number(l.qty) || 0;
            const r = Number(l.rate) || 0;
            const d = Number(l.discount) || 0;
            const g = Number(l.gst) || 0;

            const rateAfterDisc = r * (1 - d / 100);
            const lineTotal = q * rateAfterDisc;

            return (
              <tr key={idx} className="text-[9px] text-slate-700">
                <td className="py-1.5 font-bold text-slate-800">{l.name || "Retail Item"}</td>
                <td className="py-1.5 text-center">{q}</td>
                <td className="py-1.5 text-right">{r.toFixed(2)}</td>
                <td className="py-1.5 text-right font-bold text-slate-900">{lineTotal.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Calculations Summary */}
      <div className="space-y-1 border-b border-dashed pb-3 text-[10px] font-mono">
        <div className="flex justify-between"><span>Subtotal (Exc. Tax)</span><span>{totals.taxableAmount.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>GST Tax Charges</span><span>{totals.gstAmount.toFixed(2)}</span></div>
        <div className={`flex justify-between font-extrabold text-[12px] pt-1.5 ${activeColor.text}`}>
          <span>NET PAYABLE</span><span>{totals.grand.toFixed(2)}</span>
        </div>
      </div>

      {/* Retail Footer Declarations */}
      <div className="text-center text-[8px] text-slate-400 space-y-1">
        <p className="italic">Thank you for business with us!</p>
        <p className="font-bold">Goods once sold cannot be returned.</p>
      </div>
    </div>
  );
}
