import React from "react";

export function ModernTemplate({ invoice, printSet, gstSet, activeColor, numberToWords }) {
  const { customer, lines, totals, meta, paymentDetails } = invoice;
  return (
    <div className="font-sans bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-200 text-slate-800 text-[11px] leading-normal shadow-sm flex flex-col">
      {/* Colored Header Block */}
      <div className={`p-6 text-white ${activeColor.bg} flex flex-col sm:flex-row justify-between items-center gap-4`}>
        <div className="space-y-1 text-center sm:text-left">
          {printSet.printCompanyName && (
            <h1 className="text-xl font-black uppercase tracking-wider">
              {printSet.companyName || "KESHAV TRAVELS"}
            </h1>
          )}
          {printSet.printAddress && (
            <p className="text-[10px] opacity-90 whitespace-pre-line leading-tight">
              {printSet.address || "S-99/134 first floor moti lal nehru camp JNU, New Delhi"}
            </p>
          )}
        </div>
        <div className="text-center sm:text-right space-y-1 font-mono text-[10px]">
          <p className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full inline-block">TAX INVOICE</p>
          {printSet.printGstin && <p className="opacity-90 mt-1">GSTIN: {gstSet.gstin || "07AQXPD2556K2ZB"}</p>}
          {printSet.printPhone && <p className="opacity-90">Ph.: {printSet.phone || "+919718403525"}</p>}
        </div>
      </div>

      {/* Rounded content container */}
      <div className="p-6 space-y-6 flex-1">
        
        {/* Customer and Invoice details row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm space-y-2">
            <h4 className={`text-[10px] font-extrabold uppercase tracking-widest ${activeColor.text}`}>Customer Details</h4>
            <p className="font-bold text-slate-900 text-xs">{customer}</p>
            {meta.billedToAddress && <p className="text-slate-500 text-[10px]">{meta.billedToAddress}</p>}
            {meta.billedToMobile && <p className="text-slate-500 text-[10px]">Phone: {meta.billedToMobile}</p>}
            {meta.billedToGstin && <p className="text-slate-600 font-mono text-[9px] mt-1">GSTIN: {meta.billedToGstin}</p>}
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm grid grid-cols-2 gap-2 text-[10px] font-mono items-center">
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-semibold">Invoice No</p>
              <p className="font-bold text-slate-800">{meta.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-semibold">Invoice Date</p>
              <p className="font-bold text-slate-800">{meta.date}</p>
            </div>
            {meta.vehicleNo && (
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-semibold">Vehicle No</p>
                <p className="font-bold text-slate-800">{meta.vehicleNo}</p>
              </div>
            )}
            {meta.placeOfSupply && (
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-semibold">Place of Supply</p>
                <p className="font-bold text-slate-800">{meta.placeOfSupply}</p>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic rounded table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-left">
            <thead className={`${activeColor.bg} text-white text-[9px] uppercase font-bold`}>
              <tr className="divide-x divide-white/10">
                <th className="p-2 text-center w-8">#</th>
                <th className="p-2">Description</th>
                <th className="p-2 text-center w-20">HSN/SAC</th>
                <th className="p-2 text-center w-12">Qty</th>
                <th className="p-2 text-right w-20">Rate</th>
                <th className="p-2 text-right w-24">Taxable</th>
                <th className="p-2 text-right w-24">Tax</th>
                <th className="p-2 text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px] text-slate-700">
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
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 text-center">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900">{l.name || "Product Name"}</td>
                    <td className="p-2.5 text-center font-mono">{l.hsnSac || "-"}</td>
                    <td className="p-2.5 text-center">{q}</td>
                    <td className="p-2.5 text-right font-mono">{r.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-mono">{taxableVal.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-mono">{totalTax.toFixed(2)} <span className="text-[8px] text-slate-400">({g}%)</span></td>
                    <td className="p-2.5 text-right font-extrabold font-mono text-slate-900">{lineTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals & Bank details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div className="border border-slate-200 bg-white rounded-xl p-4 shadow-sm space-y-2">
              <h5 className="font-bold text-[9px] text-slate-400 uppercase tracking-widest">Bank Remittance details</h5>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-600 font-mono">
                <span className="font-medium">Bank Name</span><span className="text-slate-800 font-bold">{paymentDetails.bankName || "Axis Bank"}</span>
                <span className="font-medium">Account No.</span><span className="text-slate-800 font-bold">{paymentDetails.accountNumber || "921020024898267"}</span>
                <span className="font-medium">IFSC Code</span><span className="text-slate-800 font-bold">{paymentDetails.ifsc || "UTIB0003532"}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              <span className="font-bold uppercase text-[8px] block not-italic text-slate-400 mb-0.5">Amount in words</span>
              {numberToWords(totals.grand)}
            </p>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col items-end">
            <div className="w-full space-y-1.5 text-[10px] font-mono">
              <div className="flex justify-between"><span>Subtotal Before Tax</span><span className="font-semibold">{totals.taxableAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>SGST / CGST Splits</span><span className="font-semibold">{(totals.gstAmount / 2).toFixed(2)} x 2</span></div>
              <div className="flex justify-between border-t pt-1 font-bold text-slate-700"><span>Tax Amount: GST</span><span>{totals.gstAmount.toFixed(2)}</span></div>
              <div className={`flex justify-between font-extrabold text-[12px] border-t-2 pt-2 border-slate-200 ${activeColor.text}`}>
                <span>Total Amount Due</span><span>{totals.grand.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
