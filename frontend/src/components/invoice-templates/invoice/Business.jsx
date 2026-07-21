import React from "react";
import { getTemplateColumns, formatAmt, renderCommonFooter } from "../templateUtils.jsx";

export function BusinessTemplate({ invoice, printSet, gstSet, activeColor, numberToWords }) {
  const { customer, lines, totals, meta, paymentDetails } = invoice;
  const { cols, colNames, activeColsInOrder } = getTemplateColumns(printSet);
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
          {meta.poNumber && <p className="font-mono text-[10px]">P.O. No: {meta.poNumber}</p>}
          {meta.poDate && <p className="font-mono text-[10px]">P.O. Date: {meta.poDate}</p>}
        </div>
      </div>

      {/* Customer Info Box Side-by-side columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
        <div>
          <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-1">Customer / Consignee:</span>
          <p className="font-bold text-slate-900">{meta.billingName || customer}</p>
          {meta.billingName && <p className="text-[10px] text-slate-600 font-semibold mb-0.5">M/s: {customer}</p>}
          {meta.billedToAddress && <p className="text-slate-500 text-[10px]">{meta.billedToAddress}</p>}
          {meta.billedToState && <p className="text-slate-500 text-[10px]">State: {meta.billedToState}</p>}
          {meta.billedToMobile && <p className="text-slate-500 text-[10px]">Mob: {meta.billedToMobile}</p>}
          {meta.billedToGstin && <p className="text-slate-600 font-mono text-[9px] mt-1">GSTIN: {meta.billedToGstin}</p>}
          {printSet.currentBalanceParty && invoice.partyBalance && (
            <p className="text-red-600 font-mono font-bold text-[10px] mt-1">Balance: ₹{invoice.partyBalance}</p>
          )}
        </div>
        <div className="space-y-1">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase block mb-1">Shipment & Supply:</span>
          {meta.challanNo && <p className="text-[10px]"><span className="font-semibold text-slate-500">Challan No:</span> {meta.challanNo}</p>}
          {meta.dateOfSupply && <p className="text-[10px]"><span className="font-semibold text-slate-500">Date of Supply:</span> {meta.dateOfSupply}</p>}
          {meta.vehicleNo && <p className="text-[10px]"><span className="font-semibold text-slate-500">Vehicle No:</span> {meta.vehicleNo}</p>}
          {meta.placeOfSupply && <p className="text-[10px]"><span className="font-semibold text-slate-500">Place of Supply:</span> {meta.placeOfSupply}</p>}
          {gstSet.reverseCharge && <p className="text-[10px]"><span className="font-semibold text-slate-500">Reverse Charge:</span> {meta.reverseCharge}</p>}
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-4 border border-slate-200">
        <thead>
          <tr className={`text-[10px] font-bold uppercase divide-x divide-slate-200 border-b border-slate-200 ${activeColor.bgClass} text-white`}>
            {activeColsInOrder.map((key) => {
              if (key === "slNo") return <th key={key} className="p-2 text-center w-8">{colNames.slNo || "Sr."}</th>;
              if (key === "itemName") return <th key={key} className="p-2 min-w-[150px]">{colNames.itemName || "Description"}</th>;
              if (key === "itemCode") return <th key={key} className="p-2 text-center w-16">{colNames.itemCode || "Item Code"}</th>;
              if (key === "hsnSac") return <th key={key} className="p-2 text-center w-20">{colNames.hsnSac || "HSN/SAC"}</th>;
              if (key === "batchNo") return <th key={key} className="p-2 text-center w-16">{colNames.batchNo || "Batch No."}</th>;
              if (key === "expDate") return <th key={key} className="p-2 text-center w-16">{colNames.expDate || "Exp. Date"}</th>;
              if (key === "mfgDate") return <th key={key} className="p-2 text-center w-16">{colNames.mfgDate || "Mfg. Date"}</th>;
              if (key === "mrp") return <th key={key} className="p-2 text-right w-16">{colNames.mrp || "MRP"}</th>;
              if (key === "size") return <th key={key} className="p-2 text-center w-12">{colNames.size || "Size"}</th>;
              if (key === "modelNo") return <th key={key} className="p-2 text-center w-16">{colNames.modelNo || "Model No."}</th>;
              if (key === "description") return <th key={key} className="p-2 min-w-[100px]">{colNames.description || "Desc"}</th>;
              if (key === "count") return <th key={key} className="p-2 text-center w-12">{colNames.count || "Count"}</th>;
              if (key === "colour") return <th key={key} className="p-2 text-center w-14">{colNames.colour || "Colour"}</th>;
              if (key === "material") return <th key={key} className="p-2 text-center w-16">{colNames.material || "Material"}</th>;
              if (key === "brand") return <th key={key} className="p-2 text-center w-16">{colNames.brand || "Brand"}</th>;
              if (key === "serialNo") return <th key={key} className="p-2 text-center w-20">{colNames.serialNo || "Serial No."}</th>;
              if (key === "challanNo") return <th key={key} className="p-2 text-center w-20">{colNames.challanNo || "Challan No."}</th>;
              if (key === "quantity") return <th key={key} className="p-2 text-center w-12">{colNames.quantity || "Qty"}</th>;
              if (key === "unit") return <th key={key} className="p-2 text-center w-12">{colNames.unit || "Unit"}</th>;
              if (key === "priceUnit") return <th key={key} className="p-2 text-right w-20">{colNames.priceUnit || "Rate"}</th>;
              if (key === "discount") return <th key={key} className="p-2 text-right w-16">{colNames.discount || "Discount"}</th>;
              if (key === "discountPercent") return <th key={key} className="p-2 text-right w-16">{colNames.discountPercent || "Disc. %"}</th>;
              if (key === "taxablePriceUnit") return <th key={key} className="p-2 text-right w-20">{colNames.taxablePriceUnit || "Taxable"}</th>;
              if (key === "taxableValue") return <th key={key} className="p-2 text-right w-24">Taxable Amt</th>;
              if (key === "cgst") return <th key={key} className="p-2 text-center w-24" colSpan="2">CGST</th>;
              if (key === "sgst") return <th key={key} className="p-2 text-center w-24" colSpan="2">SGST</th>;
              if (key === "amount") return <th key={key} className="p-2 text-right w-24">{colNames.amount || "Total"}</th>;
              return null;
            })}
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
            const cgstAmount = totalTax / 2;
            const dAmount = r * (d / 100);

            return (
              <tr key={idx} className="divide-x divide-slate-100 text-[10px] text-slate-700">
                {activeColsInOrder.map((key) => {
                  if (key === "slNo") return <td key={key} className="p-2 text-center">{idx + 1}</td>;
                  if (key === "itemName") return <td key={key} className="p-2 font-semibold text-slate-900">{l.name || "Item Details"}</td>;
                  if (key === "itemCode") return <td key={key} className="p-2 text-center">{l.itemCode || "-"}</td>;
                  if (key === "hsnSac") return <td key={key} className="p-2 text-center font-mono">{l.hsnSac || "-"}</td>;
                  if (key === "batchNo") return <td key={key} className="p-2 text-center">{l.batchNo || "-"}</td>;
                  if (key === "expDate") return <td key={key} className="p-2 text-center">{l.expDate || "-"}</td>;
                  if (key === "mfgDate") return <td key={key} className="p-2 text-center">{l.mfgDate || "-"}</td>;
                  if (key === "mrp") return <td key={key} className="p-2 text-right font-mono">{l.mrp ? formatAmt(l.mrp, printSet) : "-"}</td>;
                  if (key === "size") return <td key={key} className="p-2 text-center">{l.size || "-"}</td>;
                  if (key === "modelNo") return <td key={key} className="p-2 text-center">{l.modelNo || "-"}</td>;
                  if (key === "description") return <td key={key} className="p-2 text-left">{l.description || "-"}</td>;
                  if (key === "count") return <td key={key} className="p-2 text-center">{l.count || "-"}</td>;
                  if (key === "colour") return <td key={key} className="p-2 text-center">{l.colour || "-"}</td>;
                  if (key === "material") return <td key={key} className="p-2 text-center">{l.material || "-"}</td>;
                  if (key === "brand") return <td key={key} className="p-2 text-center">{l.brand || "-"}</td>;
                  if (key === "serialNo") return <td key={key} className="p-2 text-center">{l.serialNo || "-"}</td>;
                  if (key === "challanNo") return <td key={key} className="p-2 text-center">{l.challanNo || "-"}</td>;
                  if (key === "quantity") return <td key={key} className="p-2 text-center font-mono">{q}</td>;
                  if (key === "unit") return <td key={key} className="p-2 text-center">{l.unit || "Pcs"}</td>;
                  if (key === "priceUnit") return <td key={key} className="p-2 text-right font-mono">{formatAmt(r, printSet)}</td>;
                  if (key === "discount") return <td key={key} className="p-2 text-right font-mono">{formatAmt(dAmount, printSet)}</td>;
                  if (key === "discountPercent") return <td key={key} className="p-2 text-right font-mono">{d}%</td>;
                  if (key === "taxablePriceUnit") return <td key={key} className="p-2 text-right font-mono">{formatAmt(rateAfterDisc / (1 + g/100), printSet)}</td>;
                  if (key === "taxableValue") return <td key={key} className="p-2 text-right font-mono">{formatAmt(taxableVal, printSet)}</td>;
                  if (key === "cgst") return (
                    <React.Fragment key={key}>
                      <td className="p-2 text-center font-mono text-slate-400">{(g / 2)}%</td>
                      <td className="p-2 text-right font-mono">{formatAmt(cgstAmount, printSet)}</td>
                    </React.Fragment>
                  );
                  if (key === "sgst") return (
                    <React.Fragment key={key}>
                      <td className="p-2 text-center font-mono text-slate-400">{(g / 2)}%</td>
                      <td className="p-2 text-right font-mono">{formatAmt(cgstAmount, printSet)}</td>
                    </React.Fragment>
                  );
                  if (key === "amount") return <td key={key} className="p-2 text-right font-bold font-mono text-slate-900">{formatAmt(lineTotal, printSet)}</td>;
                  return null;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Calculations row */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="text-[10px] text-slate-500 max-w-sm space-y-1 mt-2">
          <p className="font-bold text-slate-700 uppercase text-[9px]">Bank Details:</p>
          <p>Bank: {paymentDetails.bankName || "Axis Bank"} | A/c: {paymentDetails.accountNumber || "921020024898267"}</p>
          <p>IFSC: {paymentDetails.ifsc || "UTIB0003532"}</p>
        </div>
        <div className="w-72 bg-slate-50 border rounded-lg p-3 space-y-1.5 font-mono text-[10px]">
          <div className="flex justify-between"><span>Gross Subtotal</span><span>{formatAmt(totals.taxableAmount, printSet)}</span></div>
          <div className="flex justify-between"><span>CGST / SGST</span><span>{formatAmt(totals.gstAmount, printSet)}</span></div>
          <div className={`flex justify-between font-extrabold text-[12px] border-t pt-1.5 ${activeColor.text}`}>
            <span>Total Payable</span><span>{formatAmt(totals.grand, printSet)}</span>
          </div>
          {printSet.receivedAmount && (
            <div className="flex justify-between text-slate-500">
              <span>Received Amount</span>
              <span>{formatAmt(Number(invoice.receivedAmount || 0), printSet)}</span>
            </div>
          )}
          {printSet.balanceAmount && (
            <div className="flex justify-between font-bold text-slate-800 border-t border-dashed pt-1 mt-1">
              <span>Balance Amount</span>
              <span>{formatAmt(Math.max(0, totals.grand - Number(invoice.receivedAmount || 0)), printSet)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Footer Block */}
      {(printSet.printTermsAndConditions || printSet.printSignatureText || printSet.printDescription || printSet.printReceivedByDetails || printSet.printDeliveredByDetails || printSet.printAcknowledgement) && (
        <div className="grid grid-cols-2 gap-6 mt-4 border-t border-slate-200 pt-4">
          {renderCommonFooter(invoice, printSet, {
            titleClass: "text-[10px] text-slate-400 font-extrabold",
            textClass: "text-slate-600 text-[10px]",
            containerClass: "space-y-4",
            signatureContainerClass: "space-y-4 flex flex-col justify-between items-end text-right"
          })}
        </div>
      )}
    </div>
  );
}
