import React from "react";

export function GSTBoxedTemplate({ invoice, printSet, gstSet, activeColor, numberToWords }) {
  const { customer, lines, totals, meta, paymentDetails } = invoice;
  const formatAmt = (val) => {
    const num = Number(val) || 0;
    return printSet.amountWithDecimal ? num.toFixed(2) : Math.round(num).toString();
  };

  const getCompanyNameSizeClass = (size) => {
    switch (size) {
      case "Small": return "text-xs";
      case "Medium": return "text-sm";
      case "Large": return "text-base";
      case "Extra Large": return "text-lg";
      default: return "text-base";
    }
  };

  const getInvoiceSizeClass = (size, fallback) => {
    if (!size || size === "Medium") return fallback;
    if (size === "Small") {
      if (fallback === "text-[10px]") return "text-[8px]";
      if (fallback === "text-[11px]") return "text-[9px]";
      if (fallback === "text-[9px]") return "text-[7px]";
      if (fallback === "text-[8px]") return "text-[6px]";
      return fallback;
    }
    if (size === "Large") {
      if (fallback === "text-[10px]") return "text-[12px]";
      if (fallback === "text-[11px]") return "text-[13px]";
      if (fallback === "text-[9px]") return "text-[11px]";
      if (fallback === "text-[8px]") return "text-[10px]";
      return fallback;
    }
    if (size === "Extra Large") {
      if (fallback === "text-[10px]") return "text-[14px]";
      if (fallback === "text-[11px]") return "text-[15px]";
      if (fallback === "text-[9px]") return "text-[13px]";
      if (fallback === "text-[8px]") return "text-[12px]";
      return fallback;
    }
    return fallback;
  };

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

  const activeColsInOrder = [];
  order.forEach((key) => {
    if (cols[key]) {
      if (key === "amount" && printSet.taxDetails) {
        activeColsInOrder.push("taxableValue");
        activeColsInOrder.push("cgst");
        activeColsInOrder.push("sgst");
      }
      activeColsInOrder.push(key);
    }
  });

  const colSpanBeforeTax = activeColsInOrder.indexOf("taxableValue");

  let colSpanTotalSummaryLabel = activeColsInOrder.indexOf("quantity");
  if (colSpanTotalSummaryLabel === -1) {
    colSpanTotalSummaryLabel = activeColsInOrder.indexOf("taxableValue");
  }
  if (colSpanTotalSummaryLabel === -1) {
    colSpanTotalSummaryLabel = activeColsInOrder.indexOf("amount");
  }
  if (colSpanTotalSummaryLabel === -1 || colSpanTotalSummaryLabel === 0) {
    colSpanTotalSummaryLabel = 1;
  }

  const textSz = printSet.invoiceTextSize || "Medium";

  return (
    <div 
      className={`border border-slate-800 font-mono flex flex-col text-slate-800 ${getInvoiceSizeClass(textSz, "text-[10px]")}`}
      style={{ paddingTop: `${Number(printSet.extraSpaceTop || 0)}px` }}
    >
      {/* Header */}
      <div className="border-b border-slate-800 p-3 text-center space-y-1 bg-white">
        {printSet.printCompanyName && (
          <h2 className={`font-bold text-slate-900 tracking-wide uppercase ${getCompanyNameSizeClass(printSet.companyNameTextSize)}`}>
            {printSet.companyName || "KESHAV TRAVELS"}
          </h2>
        )}
        {printSet.printAddress && (
          <p className={`text-slate-700 whitespace-pre-line leading-tight ${getInvoiceSizeClass(textSz, "text-[9px]")}`}>
            {printSet.address || "S-99/134 first floor moti lal nehru camp JNU, New Delhi, Delhi, 110067"}
          </p>
        )}
        <div className={`text-slate-600 flex flex-wrap justify-center gap-x-3 ${getInvoiceSizeClass(textSz, "text-[9px]")}`}>
          {printSet.printPhone && <span>Ph.: {printSet.phone || "+919718403525"}</span>}
          {printSet.printEmail && <span>Email: {printSet.email || "dpakk1989@gmail.com"}</span>}
        </div>
        <div className={`font-bold text-slate-800 flex justify-center gap-x-4 pt-1 border-t border-dashed mt-1.5 ${getInvoiceSizeClass(textSz, "text-[9px]")}`}>
          {printSet.printGstin && <span>GSTIN : {gstSet.gstin || "07AQXPD2556K2ZB"}</span>}
          <span>PAN No: AQXPD2556K</span>
        </div>
      </div>

      {/* Title */}
      <div className={`border-b border-slate-800 text-center font-bold py-1 bg-slate-50 uppercase tracking-widest ${activeColor.text} ${getInvoiceSizeClass(textSz, "text-[11px]")}`}>
        {gstSet.compositeScheme ? "BILL OF SUPPLY" : "TAX INVOICE"}
      </div>
      {gstSet.compositeScheme && (
        <div className="border-b border-slate-800 text-center text-[8px] py-0.5 bg-amber-50 font-bold text-slate-700 italic border-t border-slate-800">
          Composition taxable person, not eligible to collect tax on supplies
        </div>
      )}

      {/* Meta grid */}
      <div className="grid grid-cols-2 border-b border-slate-800 divide-x divide-slate-800">
        <div className="p-2 space-y-1">
          {gstSet.reverseCharge && (
            <div className="flex"><span className="w-24 shrink-0">Reverse Charge</span><span>: {meta.reverseCharge}</span></div>
          )}
          <div className="flex"><span className="w-24 shrink-0">Invoice No.</span><span>: {meta.invoiceNumber}</span></div>
          <div className="flex"><span className="w-24 shrink-0">Invoice Date</span><span>: {meta.date}</span></div>
          <div className="flex"><span className="w-24 shrink-0">State</span><span>: Delhi</span></div>
        </div>
        <div className="p-2 space-y-1">
          <div className="flex"><span className="w-24 shrink-0">Challan No.</span><span>: {meta.challanNo || "-"}</span></div>
          <div className="flex"><span className="w-24 shrink-0">Vehicle No.</span><span>: {meta.vehicleNo || "-"}</span></div>
          <div className="flex"><span className="w-24 shrink-0">Date of Supply</span><span>: {meta.dateOfSupply || "-"}</span></div>
          {gstSet.placeOfSupply && (
            <div className="flex"><span className="w-24 shrink-0">Place of Supply</span><span>: {meta.placeOfSupply || "Delhi"}</span></div>
          )}
        </div>
      </div>

      {/* Billed to */}
      <div className="border-b border-slate-800 p-2">
        <div className="font-bold border-b border-slate-300 pb-0.5 mb-1.5 uppercase">
          Details of Receiver | Billed to:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex"><span className="w-20 shrink-0 font-semibold">Name</span><span>: {customer}</span></div>
          <div className="flex"><span className="w-20 shrink-0 font-semibold">Address</span><span>: {meta.billedToAddress || "-"}</span></div>
          <div className="flex"><span className="w-20 shrink-0 font-semibold">GSTIN</span><span>: {meta.billedToGstin || "-"}</span></div>
          <div className="flex"><span className="w-20 shrink-0 font-semibold">MOBILE</span><span>: {meta.billedToMobile || "-"}</span></div>
          <div className="flex"><span className="w-20 shrink-0 font-semibold">State</span><span>: {meta.billedToState || "Delhi"}</span></div>
          {printSet.currentBalanceParty && invoice.partyBalance && (
            <div className="flex"><span className="w-20 shrink-0 font-semibold text-red-600">Balance</span><span>: ₹{invoice.partyBalance}</span></div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="border-b border-slate-800 overflow-x-auto">
        <table className={`w-full border-collapse ${getInvoiceSizeClass(textSz, "text-[9px]")}`}>
          <thead>
            <tr className={`bg-slate-50 border-b border-slate-800 font-bold uppercase divide-x divide-slate-800 text-left ${activeColor.text}`}>
              {activeColsInOrder.map((key) => {
                if (key === "slNo") return <th key={key} className="p-1.5 text-center w-8">{colNames.slNo || "Sr."}</th>;
                if (key === "itemName") return <th key={key} className="p-1.5 min-w-[150px]">{colNames.itemName || "Product Description"}</th>;
                if (key === "itemCode") return <th key={key} className="p-1.5 text-center w-16">{colNames.itemCode || "Item Code"}</th>;
                if (key === "hsnSac") return <th key={key} className="p-1.5 text-center w-16">{colNames.hsnSac || "HSN/SAC"}</th>;
                if (key === "batchNo") return <th key={key} className="p-1.5 text-center w-16">{colNames.batchNo || "Batch No."}</th>;
                if (key === "expDate") return <th key={key} className="p-1.5 text-center w-16">{colNames.expDate || "Exp. Date"}</th>;
                if (key === "mfgDate") return <th key={key} className="p-1.5 text-center w-16">{colNames.mfgDate || "Mfg. Date"}</th>;
                if (key === "mrp") return <th key={key} className="p-1.5 text-right w-16">{colNames.mrp || "MRP"}</th>;
                if (key === "size") return <th key={key} className="p-1.5 text-center w-12">{colNames.size || "Size"}</th>;
                if (key === "modelNo") return <th key={key} className="p-1.5 text-center w-16">{colNames.modelNo || "Model No."}</th>;
                if (key === "description") return <th key={key} className="p-1.5 min-w-[100px]">{colNames.description || "Description"}</th>;
                if (key === "count") return <th key={key} className="p-1.5 text-center w-12">{colNames.count || "Count"}</th>;
                if (key === "colour") return <th key={key} className="p-1.5 text-center w-14">{colNames.colour || "Colour"}</th>;
                if (key === "material") return <th key={key} className="p-1.5 text-center w-16">{colNames.material || "Material"}</th>;
                if (key === "brand") return <th key={key} className="p-1.5 text-center w-16">{colNames.brand || "Brand"}</th>;
                if (key === "serialNo") return <th key={key} className="p-1.5 text-center w-20">{colNames.serialNo || "Serial No."}</th>;
                if (key === "challanNo") return <th key={key} className="p-1.5 text-center w-20">{colNames.challanNo || "Challan No."}</th>;
                if (key === "quantity") return <th key={key} className="p-1.5 text-center w-10">{colNames.quantity || "QTY"}</th>;
                if (key === "unit") return <th key={key} className="p-1.5 text-center w-12">{colNames.unit || "Unit"}</th>;
                if (key === "priceUnit") return <th key={key} className="p-1.5 text-right w-16">{colNames.priceUnit || "Rate"}</th>;
                if (key === "discount") return <th key={key} className="p-1.5 text-right w-16">{colNames.discount || "Discount"}</th>;
                if (key === "discountPercent") return <th key={key} className="p-1.5 text-right w-16">{colNames.discountPercent || "Discount %"}</th>;
                if (key === "taxablePriceUnit") return <th key={key} className="p-1.5 text-right w-18">{colNames.taxablePriceUnit || "Taxable Price/Unit"}</th>;
                if (key === "taxableValue") return <th key={key} className="p-1.5 text-right w-18">Taxable Value</th>;
                if (key === "cgst") return <th key={key} className="p-1.5 text-center w-28" colSpan="2">CGST</th>;
                if (key === "sgst") return <th key={key} className="p-1.5 text-center w-28" colSpan="2">SGST</th>;
                if (key === "amount") return <th key={key} className="p-1.5 text-right w-20">{colNames.amount || "Total"}</th>;
                return null;
              })}
            </tr>
            {printSet.taxDetails && (
              <tr className="bg-slate-100 border-b border-slate-800 text-[8px] font-bold text-center divide-x divide-slate-800">
                <td colSpan={colSpanBeforeTax}></td>
                <td className="p-1 w-10">Rate</td>
                <td className="p-1 w-18">Amount</td>
                <td className="p-1 w-10">Rate</td>
                <td className="p-1 w-18">Amount</td>
                {cols.amount && <td></td>}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-800">
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
                <tr key={idx} className="divide-x divide-slate-800 text-[9px] hover:bg-slate-50/20">
                  {activeColsInOrder.map((key) => {
                    if (key === "slNo") return <td key={key} className="p-2 text-center">{idx + 1}</td>;
                    if (key === "itemName") return <td key={key} className="p-2 font-medium font-sans">{l.name || "Service Item Description"}</td>;
                    if (key === "itemCode") return <td key={key} className="p-2 text-center">{l.itemCode || "-"}</td>;
                    if (key === "hsnSac") return <td key={key} className="p-2 text-center">{l.hsnSac || "-"}</td>;
                    if (key === "batchNo") return <td key={key} className="p-2 text-center">{l.batchNo || "-"}</td>;
                    if (key === "expDate") return <td key={key} className="p-2 text-center">{l.expDate || "-"}</td>;
                    if (key === "mfgDate") return <td key={key} className="p-2 text-center">{l.mfgDate || "-"}</td>;
                    if (key === "mrp") return <td key={key} className="p-2 text-right">{l.mrp ? formatAmt(l.mrp) : "-"}</td>;
                    if (key === "size") return <td key={key} className="p-2 text-center">{l.size || "-"}</td>;
                    if (key === "modelNo") return <td key={key} className="p-2 text-center">{l.modelNo || "-"}</td>;
                    if (key === "description") return <td key={key} className="p-2 text-left">{l.description || "-"}</td>;
                    if (key === "count") return <td key={key} className="p-2 text-center">{l.count || "-"}</td>;
                    if (key === "colour") return <td key={key} className="p-2 text-center">{l.colour || "-"}</td>;
                    if (key === "material") return <td key={key} className="p-2 text-center">{l.material || "-"}</td>;
                    if (key === "brand") return <td key={key} className="p-2 text-center">{l.brand || "-"}</td>;
                    if (key === "serialNo") return <td key={key} className="p-2 text-center">{l.serialNo || "-"}</td>;
                    if (key === "challanNo") return <td key={key} className="p-2 text-center">{l.challanNo || "-"}</td>;
                    if (key === "quantity") return <td key={key} className="p-2 text-center">{q}</td>;
                    if (key === "unit") return <td key={key} className="p-2 text-center">{l.unit || "Pcs"}</td>;
                    if (key === "priceUnit") return <td key={key} className="p-2 text-right">{formatAmt(r)}</td>;
                    if (key === "discount") return <td key={key} className="p-2 text-right">{formatAmt(dAmount)}</td>;
                    if (key === "discountPercent") return <td key={key} className="p-2 text-right">{d}%</td>;
                    if (key === "taxablePriceUnit") return <td key={key} className="p-2 text-right">{formatAmt(rateAfterDisc / (1 + g/100))}</td>;
                    if (key === "taxableValue") return <td key={key} className="p-2 text-right">{formatAmt(taxableVal)}</td>;
                    if (key === "cgst") return (
                      <React.Fragment key={key}>
                        <td className="p-1 text-center">{(g / 2)}%</td>
                        <td className="p-2 text-right">{formatAmt(cgstAmount)}</td>
                      </React.Fragment>
                    );
                    if (key === "sgst") return (
                      <React.Fragment key={key}>
                        <td className="p-1 text-center">{(g / 2)}%</td>
                        <td className="p-2 text-right">{formatAmt(cgstAmount)}</td>
                      </React.Fragment>
                    );
                    if (key === "amount") return <td key={key} className="p-2 text-right font-bold">{formatAmt(lineTotal)}</td>;
                    return null;
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-800 font-bold divide-x divide-slate-800 text-[9px]">
              <td colSpan={colSpanTotalSummaryLabel} className="p-2 text-center">Total Summary</td>
              {activeColsInOrder.slice(colSpanTotalSummaryLabel).map((key) => {
                if (key === "quantity") return <td key={key} className="p-2 text-center">{printSet.totalItemQuantity ? lines.reduce((sum, l) => sum + (Number(l.qty) || 0), 0) : "-"}</td>;
                if (key === "taxableValue") return <td key={key} className="p-2 text-right">{formatAmt(totals.taxableAmount)}</td>;
                if (key === "cgst") return (
                  <React.Fragment key={key}>
                    <td></td>
                    <td className="p-2 text-right">{formatAmt(totals.gstAmount / 2)}</td>
                  </React.Fragment>
                );
                if (key === "sgst") return (
                  <React.Fragment key={key}>
                    <td></td>
                    <td className="p-2 text-right">{formatAmt(totals.gstAmount / 2)}</td>
                  </React.Fragment>
                );
                if (key === "amount") return <td key={key} className="p-2 text-right font-extrabold text-emerald-700">{formatAmt(totals.grand)}</td>;
                if (key === "cgst" || key === "sgst") return null;
                return <td key={key}></td>;
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Calculations & Bank */}
      <div className="grid grid-cols-2 divide-x divide-slate-800 border-b border-slate-800">
        <div className="p-3 space-y-3">
          {printSet.amountInWords !== "None" && (
            <div>
              <span className={`font-bold block border-b pb-0.5 mb-1 uppercase text-slate-700 ${getInvoiceSizeClass(textSz, "text-[9px]")}`}>Total Invoice Amount in words</span>
              <span className="text-slate-600 leading-tight italic">{numberToWords(totals.grand)}</span>
            </div>
          )}
          <div className="border rounded-lg p-2.5 bg-slate-50/50 space-y-1">
            <span className={`font-bold border-b block pb-0.5 mb-1 uppercase tracking-wide ${getInvoiceSizeClass(textSz, "text-[8px]")}`}>Bank Account Details</span>
            <div className="flex"><span className="w-24 shrink-0">Account No.</span><span>: {paymentDetails.accountNumber || "921020024898267"}</span></div>
            <div className="flex"><span className="w-24 shrink-0">Bank Name</span><span>: {paymentDetails.bankName || "Axis Bank"}</span></div>
            <div className="flex"><span className="w-24 shrink-0">IFSC Code</span><span>: {paymentDetails.ifsc || "UTIB0003532"}</span></div>
          </div>
        </div>
        <div className="p-3 flex justify-end">
          <table className="w-64 font-mono">
            <tbody>
              <tr className="py-1 flex justify-between"><span>Subtotal Before Tax</span><span>{formatAmt(totals.taxableAmount)}</span></tr>
              <tr className="py-1 flex justify-between"><span>Add: CGST</span><span>{formatAmt(totals.gstAmount / 2)}</span></tr>
              <tr className="py-1 flex justify-between"><span>Add: SGST</span><span>{formatAmt(totals.gstAmount / 2)}</span></tr>
              <tr className="py-1 flex justify-between border-t font-semibold"><span>Total GST Tax</span><span>{formatAmt(totals.gstAmount)}</span></tr>
              <tr className={`py-1.5 flex justify-between font-extrabold border-t-2 border-slate-900 pt-1.5 ${activeColor.text} ${getInvoiceSizeClass(textSz, "text-[11px]")}`}><span className="uppercase">Amount With Tax</span><span>{formatAmt(totals.grand)}</span></tr>
              {printSet.receivedAmount && (
                <tr className={`py-1 flex justify-between text-slate-600 ${getInvoiceSizeClass(textSz, "text-[9px]")}`}>
                  <span>Received Amount</span>
                  <span>{formatAmt(Number(invoice.receivedAmount || 0))}</span>
                </tr>
              )}
              {printSet.balanceAmount && (
                <tr className={`py-1 flex justify-between text-slate-600 font-bold border-t border-dashed mt-0.5 ${getInvoiceSizeClass(textSz, "text-[9px]")}`}>
                  <span>Balance Amount</span>
                  <span>{formatAmt(Math.max(0, totals.grand - Number(invoice.receivedAmount || 0)))}</span>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* T&C and Stamp */}
      {(printSet.printTermsAndConditions || printSet.printSignatureText || printSet.printDescription || printSet.printReceivedByDetails || printSet.printDeliveredByDetails || printSet.printAcknowledgement) && (
        <div className={`grid grid-cols-2 divide-x divide-slate-800 ${getInvoiceSizeClass(textSz, "text-[8px]")}`}>
          <div className="p-3 space-y-2">
            {printSet.printDescription && invoice.description && (
              <div>
                <span className={`font-bold uppercase block text-slate-700 ${getInvoiceSizeClass(textSz, "text-[9px]")}`}>Description / Notes</span>
                <p className="whitespace-pre-line text-slate-600">{invoice.description}</p>
              </div>
            )}
            {printSet.printTermsAndConditions && (
              <div>
                <span className={`font-bold uppercase block text-slate-700 ${getInvoiceSizeClass(textSz, "text-[9px]")}`}>Terms & Conditions</span>
                <p className="whitespace-pre-line text-slate-600">{invoice.terms || "1. We are responsible for the loss of signed Duty slip, check details.\n2. Interest@24% will be charged if bill not paid within 15 days."}</p>
              </div>
            )}
            {printSet.printAcknowledgement && invoice.acknowledgement && (
              <div className="text-slate-500 italic mt-1 border-t border-dashed pt-1">
                <span>Acknowledgement: {invoice.acknowledgement}</span>
              </div>
            )}
          </div>
          <div className="p-3 flex flex-col justify-between items-center min-h-[95px] relative">
            <div className={`text-slate-400 italic text-center w-full space-y-1 mb-2 ${getInvoiceSizeClass(textSz, "text-[8px]")}`}>
              {printSet.printReceivedByDetails && (
                <div>Received By: <span className="font-semibold text-slate-700">{invoice.receivedBy || "________________"}</span></div>
              )}
              {printSet.printDeliveredByDetails && (
                <div>Delivered By: <span className="font-semibold text-slate-700">{invoice.deliveredBy || "________________"}</span></div>
              )}
              <span>Certified that the particulars given above are true and correct</span>
            </div>
            {printSet.printSignatureText && (
              <div className="text-center w-full relative flex flex-col items-center">
                <span className={`font-bold text-slate-800 uppercase block ${getInvoiceSizeClass(textSz, "text-[9px]")}`}>
                  For, {printSet.companyName || "KESHAV TRAVELS"}
                </span>
                {printSet.signatureUrl ? (
                  <img src={printSet.signatureUrl} alt="Seal/Signature" className="h-10 max-h-12 object-contain my-1" />
                ) : (
                  <div className="h-8" />
                )}
                <span className={`text-slate-400 block pt-1 border-t w-32 mx-auto text-center ${getInvoiceSizeClass(textSz, "text-[8px]")}`}>
                  {printSet.signatureText || "Authorised Signatory"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
