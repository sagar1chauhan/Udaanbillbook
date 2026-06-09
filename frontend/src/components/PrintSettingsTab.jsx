import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Info, ChevronRight } from "lucide-react";
import { ItemTableCustomizationModal } from "./ItemTableCustomizationModal";
import { ChangeTransactionNamesModal } from "./ChangeTransactionNamesModal";
import { ChangeThemeModal } from "./ChangeThemeModal";

export function PrintSettingsTab({ settings, updateSettings, isMobile }) {
  const print = settings.printSettings || {};
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const tableCols = print.tableColumns || {};
  const names = print.transactionNames || {};
  const colNames = print.tableColumnNames || {};

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        // A4 width in pixels is ~794px at 96 DPI.
        // We calculate available width minus padding (32px).
        const availableWidth = entry.contentRect.width - 32;
        // Calculate the scale needed to fit the width. Cap it at 1 (100%).
        const newScale = Math.min(1, availableWidth / 794);
        setScale(newScale);
      }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const handleUpdate = (key, value) => {
    updateSettings("printSettings", { [key]: value });
  };

  const renderControl = (key, label, disabled = false) => {
    const checked = print[key];
    const onChange = (val) => handleUpdate(key, val);

    return (
      <div className="flex items-center gap-3 py-1 cursor-pointer group">
        <Checkbox 
          checked={!!checked} 
          onCheckedChange={(c) => onChange(!!c)} 
          disabled={disabled} 
          id={`print-${key}`} 
          className="h-5 w-5 rounded shadow-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-slate-300" 
        />
        <Label htmlFor={`print-${key}`} className={`text-[13px] cursor-pointer flex items-center gap-2 ${disabled ? "opacity-40" : ""}`}>
          {label}
          <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Label>
      </div>
    );
  };

  const renderCheckInput = (checkKey, inputKey, label, inputType = "text") => {
    const checked = print[checkKey];
    const value = print[inputKey] || "";

    return (
      <div className="flex items-start gap-4 py-1.5 group">
        <Checkbox 
          checked={!!checked} 
          onCheckedChange={(c) => handleUpdate(checkKey, !!c)} 
          className="mt-2.5 h-5 w-5 rounded shadow-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-slate-300" 
        />
        <div className="relative flex-1 max-w-[320px] flex items-center gap-2">
          <div className="relative flex-1">
            <Label className="absolute -top-2 left-2 bg-white px-1 text-[11px] text-slate-500 z-10">{label}</Label>
            <Input 
              type={inputType}
              value={value} 
              onChange={(e) => handleUpdate(inputKey, e.target.value)} 
              className={`h-10 text-[13px] bg-white border-slate-300 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0 ${!checked ? "opacity-50" : ""}`} 
              disabled={!checked}
            />
          </div>
          <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </div>
    );
  };

  // Convert "4" string to actual pixel font sizes for preview
  const getHeaderSize = () => {
    const s = print.companyNameTextSize || "Large";
    if (s === "Small") return 16;
    if (s === "Medium") return 20;
    if (s === "Large") return 24;
    if (s === "Extra Large") return 28;
    return 24;
  };

  const getBodySize = () => {
    const s = print.invoiceTextSize || "Medium";
    if (s === "Small") return 10;
    if (s === "Medium") return 12;
    if (s === "Large") return 14;
    if (s === "Extra Large") return 16;
    return 12;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start h-[calc(100vh-10rem)] xl:h-[80vh]">
      {/* Scrollable Settings Panel */}
      <div className="w-full xl:w-[380px] shrink-0 space-y-8 overflow-y-auto h-full pr-4 pb-20 custom-scrollbar">
        
        {/* Header Tabs */}
        <div className="flex gap-4 border-b">
          <button className="text-[13px] font-bold text-blue-600 border-b-2 border-blue-600 pb-2 uppercase px-1">Regular Printer</button>
          <button className="text-[13px] font-bold text-slate-500 pb-2 uppercase px-1">Thermal</button>
        </div>

        <div className="space-y-3 px-1 pt-2">
            {renderControl("regularPrinterDefault", "Make Regular Printer Default")}
        </div>

        {/* Section: Themes */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-slate-800 bg-slate-100 p-2 text-sm">Themes</h3>
          <div className="space-y-3 px-2">
             <div className="flex items-center justify-between gap-4 group cursor-pointer hover:bg-slate-50 p-1 -mx-1 rounded" onClick={() => setIsThemeModalOpen(true)}>
                <Label className="text-[14px] text-slate-800 cursor-pointer">Change Theme and Colors</Label>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-slate-500" />
                  <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
             </div>
             
             {/* Text size, Page size, Orientation are kept in formatting section below to not disturb existing UI layout too much, or they can be moved here. The user requested not to disturb other UI. */}
          </div>
        </div>

        {/* Section 1: Print Company Info / Header */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-slate-800 bg-slate-100 p-2 text-sm">Print Company Info/Header</h3>
          <div className="space-y-3 px-1">
            {renderControl("repeatHeader", "Print repeat header in all pages")}

            {renderCheckInput("printCompanyName", "companyName", "Company Name")}

            <div className="flex items-center gap-4 py-1.5 group">
              <Checkbox 
                checked={!!print.printCompanyLogo} 
                onCheckedChange={(c) => handleUpdate("printCompanyLogo", !!c)} 
                className="h-5 w-5 rounded shadow-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-slate-300" 
              />
              <Label className="text-[13px] flex items-center gap-2 cursor-pointer">
                Company Logo <span className="text-blue-500 font-normal hover:underline">(Change)</span>
                <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Label>
            </div>

            {renderCheckInput("printAddress", "address", "Address")}
            {renderCheckInput("printEmail", "email", "Email")}
            {renderCheckInput("printPhone", "phone", "Phone Number")}
            {renderCheckInput("printGstin", "gstinOnSale", "GSTIN on Sale")}
          </div>
        </div>

        {/* Formatting Section */}
        <div className="space-y-4 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[500px]">
            <div className="flex items-center justify-between gap-4 group">
              <Label className="text-[13px] text-slate-700">Paper Size</Label>
              <div className="flex items-center gap-2">
                <Select value={print.paperSize || "A4"} onValueChange={(v) => handleUpdate("paperSize", v)}>
                  <SelectTrigger className="w-32 h-9 text-[13px] bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="A5">A5</SelectItem>
                  </SelectContent>
                </Select>
                <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 group">
              <Label className="text-[13px] text-slate-700">Orientation</Label>
              <div className="flex items-center gap-2">
                <Select value={print.orientation || "Portrait"} onValueChange={(v) => handleUpdate("orientation", v)}>
                  <SelectTrigger className="w-32 h-9 text-[13px] bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Portrait">Portrait</SelectItem>
                    <SelectItem value="Landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
                <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 group mt-2">
              <Label className="text-[13px] text-slate-700">Company Name Text Size</Label>
              <div className="flex items-center gap-2">
                <Select value={print.companyNameTextSize || "Large"} onValueChange={(v) => handleUpdate("companyNameTextSize", v)}>
                  <SelectTrigger className="w-32 h-9 text-[13px] bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                    <SelectItem value="Extra Large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
                <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 group mt-2">
              <Label className="text-[13px] text-slate-700">Invoice Text Size</Label>
              <div className="flex items-center gap-2">
                <Select value={print.invoiceTextSize || "Medium"} onValueChange={(v) => handleUpdate("invoiceTextSize", v)}>
                  <SelectTrigger className="w-32 h-9 text-[13px] bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small">Small</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Large">Large</SelectItem>
                    <SelectItem value="Extra Large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
                <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            {renderControl("printOriginalDuplicate", "Print Original/Duplicate")}
          </div>

          <div className="flex items-center gap-4 py-1.5 group">
            <Label className="text-[13px] text-slate-700">Extra space on Top of PDF</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="number" 
                min="0" 
                max="100" 
                value={print.extraSpaceTop || "0"} 
                onChange={(e) => handleUpdate("extraSpaceTop", e.target.value)} 
                className="w-16 h-8 text-[13px] bg-white" 
              />
              <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[13px] text-blue-500 hover:underline cursor-pointer" onClick={() => setIsNameModalOpen(true)}>Change Transaction Names {'>'}</span>
          </div>
        </div>

        {/* Section 2: Item Table */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Item Table</h3>
          <div className="px-1 space-y-4">
            <div className="flex items-center gap-4 py-1.5 group">
              <Label className="text-[13px] text-slate-700">Min No. of Rows in Item Table</Label>
              <div className="flex items-center gap-2">
                <Input 
                  type="number" 
                  min="0" 
                  max="50" 
                  value={print.minRowsItemTable || "0"} 
                  onChange={(e) => handleUpdate("minRowsItemTable", e.target.value)} 
                  className="w-16 h-8 text-[13px] bg-white" 
                />
                <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div>
              <span className="text-[13px] text-blue-500 hover:underline cursor-pointer" onClick={() => setIsTableModalOpen(true)}>Item Table Customization {'>'}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Totals & Taxes */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Totals & Taxes</h3>
          <div className="px-1 space-y-3">
            {renderControl("totalItemQuantity", "Total Item Quantity")}
            {renderControl("amountWithDecimal", "Amount with Decimal e.g. 0.00")}
            {renderControl("receivedAmount", "Received Amount")}
            {renderControl("balanceAmount", "Balance Amount")}
            {renderControl("currentBalanceParty", "Current Balance of Party")}
            {renderControl("taxDetails", "Tax Details")}
            {renderControl("youSaved", "You Saved")}
            {renderControl("printAmountWithGrouping", "Print Amount with Grouping")}
            
            <div className="flex items-center gap-4 py-1.5 group pt-2">
              <Label className="text-[13px] text-slate-700">Amount in Words</Label>
              <div className="flex items-center gap-2">
                <Select value={print.amountInWords || "Indian"} onValueChange={(v) => handleUpdate("amountInWords", v)}>
                  <SelectTrigger className="w-32 h-9 text-[13px] bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indian">Indian</SelectItem>
                    <SelectItem value="Western">Western</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
                <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Footer */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-slate-800 border-b pb-2">Footer</h3>
          <div className="px-1 space-y-3">
            {renderControl("printDescription", "Print Description")}
            {renderControl("printTermsAndConditions", "Print Terms and Conditions")}
            {renderControl("printReceivedByDetails", "Print Received by details")}
            {renderControl("printDeliveredByDetails", "Print Delivered by details")}
            
            <div className="flex items-start gap-4 py-1.5 group">
              <Checkbox 
                checked={!!print.printSignatureText} 
                onCheckedChange={(c) => handleUpdate("printSignatureText", !!c)} 
                className="mt-2.5 h-5 w-5 rounded shadow-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-slate-300" 
              />
              <div className="flex items-center gap-3">
                <div className="relative w-48">
                  <Label className="absolute -top-2 left-2 bg-white px-1 text-[11px] text-slate-500 z-10">Print Signature Text</Label>
                  <Input 
                    value={print.signatureText || "Authorized Signatory"} 
                    onChange={(e) => handleUpdate("signatureText", e.target.value)} 
                    className={`h-10 text-[13px] bg-white border-slate-300 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0 ${!print.printSignatureText ? "opacity-50" : ""}`} 
                    disabled={!print.printSignatureText}
                  />
                </div>
                <Info className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                <span className="text-[13px] text-blue-500 hover:underline cursor-pointer ml-1">Change Signature</span>
              </div>
            </div>

            {renderControl("paymentMode", "Payment Mode")}
            {renderControl("printAcknowledgement", "Print Acknowledgement")}
          </div>
        </div>
      </div>

      {/* Sticky Live Preview Panel */}
      <div className="w-full xl:flex-1 h-[500px] xl:h-full block overflow-hidden">
        <div className="sticky top-0 h-full rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex flex-col shadow-inner">
          <div ref={containerRef} className="flex-1 overflow-auto p-4 flex justify-center items-start custom-scrollbar">
            {/* Wrapper to maintain proper dimensions for the scaled sheet */}
            <div style={{ width: 794 * scale, height: 1123 * scale }} className="shrink-0 flex justify-center relative">
              {/* The Invoice Preview Sheet */}
              <div 
                className={`w-[210mm] bg-white shadow-md border absolute top-0 left-0 p-8 text-slate-800 font-sans origin-top-left ${print.themeName === 'Tally' ? 'border-2 border-slate-800' : ''}`}
                style={{ 
                  minHeight: "297mm",
                  paddingTop: `${Math.max(32, 32 + Number(print.extraSpaceTop || 0))}px`,
                  fontSize: `${getBodySize()}px`,
                  transform: `scale(${scale})`,
                  borderColor: print.themeName === 'Tally' ? '#1e293b' : (print.themeColor || '#e2e8f0'),
                  borderTopWidth: print.themeName === 'Advanced' ? '12px' : (print.themeName === 'Tally' ? '2px' : '1px')
                }}
              >
              <div className={`flex justify-between items-start mb-6 ${print.themeName === 'Tally' ? 'flex-col items-center text-center border-b border-slate-800 pb-4' : ''}`}>
                <div>
                  {print.printCompanyName && (
                    <h1 className="font-bold leading-tight" style={{ fontSize: `${getHeaderSize()}px` }}>
                      {print.companyName || "Company Name"}
                    </h1>
                  )}
                  {print.printAddress && <p className="whitespace-pre-line text-slate-600 mt-1">{print.address}</p>}
                  {print.printPhone && <p className="text-slate-600 mt-0.5">Ph. no.: {print.phone}</p>}
                  {print.printEmail && <p className="text-slate-600">Email: {print.email}</p>}
                </div>
                {print.printCompanyLogo && (
                  <div className="h-16 w-24 bg-slate-100 flex items-center justify-center text-slate-400 border text-xs">
                    Image
                  </div>
                )}
              </div>
              
              <div className={`text-center font-bold text-lg mb-6 uppercase tracking-wider ${print.themeName === 'Basic' || print.themeName === 'Tally' ? 'text-slate-800 border-b border-slate-300 pb-2 inline-block mx-auto' : ''}`} style={print.themeName !== 'Basic' && print.themeName !== 'Tally' ? { color: print.themeColor || '#9333ea' } : {}}>
                {names.sale || "SALE"}
              </div>

              <div className="flex justify-between mb-6">
                <div>
                  <p className="font-bold mb-1">Bill To:</p>
                  <p className="font-semibold">Classic enterprises</p>
                  <p className="text-slate-600 max-w-[200px]">Plot No. 1, Shop No. 8, Koramangala, Banglore, 560034</p>
                  <p className="text-slate-600 mt-1">Contact No.: 8888888888</p>
                </div>
                <div>
                  <p className="font-bold mb-1">Shipping To:</p>
                  <p className="text-slate-600 max-w-[200px]">Mehta Textiles, Marathalli Road, Banglore, Karnataka, 560034</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold mb-2">Invoice Details</p>
                  <p>Invoice No: Inv. 101</p>
                  <p>Date: 02-07-2019</p>
                  <p>Time: 12:30 PM</p>
                  <p>Due Date: 17-07-2019</p>
                </div>
              </div>

              <table className={`w-full mb-4 ${print.themeName === 'Tally' ? 'border-collapse border border-slate-800' : ''}`}>
                <thead>
                  <tr className={`text-left text-[11px] ${print.themeName === 'Basic' || print.themeName === 'Tally' ? 'text-slate-800 border-b-2 border-slate-800' : ''}`} style={print.themeName !== 'Basic' && print.themeName !== 'Tally' ? { backgroundColor: print.themeColor || '#a855f7', color: 'white' } : {}}>
                    {tableCols.slNo && <th className={`p-2 font-semibold ${print.themeName === 'Tally' ? 'border border-slate-800' : ''}`}>{colNames.slNo || "#"}</th>}
                    {tableCols.itemName && <th className="p-2 font-semibold">{colNames.itemName || "Item name"}</th>}
                    {tableCols.itemCode && <th className="p-2 font-semibold text-center">{colNames.itemCode || "Item Code"}</th>}
                    {tableCols.hsnSac && <th className="p-2 font-semibold text-center">{colNames.hsnSac || "HSN/SAC"}</th>}
                    {tableCols.quantity && <th className="p-2 font-semibold text-right">{colNames.quantity || "Quantity"}</th>}
                    {tableCols.priceUnit && <th className="p-2 font-semibold text-right">{colNames.priceUnit || "Price/unit"}</th>}
                    {tableCols.discount && <th className="p-2 font-semibold text-right">{colNames.discount || "Discount"}</th>}
                    {tableCols.taxAmount && <th className="p-2 font-semibold text-right">{colNames.taxAmount || "GST"}</th>}
                    {tableCols.amount && <th className="p-2 font-semibold text-right">{colNames.amount || "Amount"}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    {tableCols.slNo && <td className="p-2">1</td>}
                    {tableCols.itemName && <td className="p-2 font-semibold">ITEM 1</td>}
                    {tableCols.itemCode && <td className="p-2 text-center">ITM1</td>}
                    {tableCols.hsnSac && <td className="p-2 text-center">1234</td>}
                    {tableCols.quantity && <td className="p-2 text-right">1 + 1</td>}
                    {tableCols.priceUnit && <td className="p-2 text-right">{print.amountWithDecimal ? "₹ 10.00" : "₹ 10"}</td>}
                    {tableCols.discount && <td className="p-2 text-right">₹ 0.10 (1%)</td>}
                    {tableCols.taxAmount && (
                      <td className="p-2 text-right">
                        {print.amountWithDecimal ? "₹ 0.50" : "₹ 1"}<br/><span className="text-[10px] text-slate-500">(5%)</span>
                      </td>
                    )}
                    {tableCols.amount && <td className="p-2 text-right font-semibold">{print.amountWithDecimal ? "₹ 10.40" : "₹ 10"}</td>}
                  </tr>
                  <tr>
                    {tableCols.slNo && <td className="p-2">2</td>}
                    {tableCols.itemName && <td className="p-2 font-semibold">ITEM 2</td>}
                    {tableCols.itemCode && <td className="p-2 text-center">ITM2</td>}
                    {tableCols.hsnSac && <td className="p-2 text-center">6325</td>}
                    {tableCols.quantity && <td className="p-2 text-right">1</td>}
                    {tableCols.priceUnit && <td className="p-2 text-right">{print.amountWithDecimal ? "₹ 30.00" : "₹ 30"}</td>}
                    {tableCols.discount && <td className="p-2 text-right">₹ 0.00 (0%)</td>}
                    {tableCols.taxAmount && (
                      <td className="p-2 text-right">
                        {print.amountWithDecimal ? "₹ 5.40" : "₹ 5"}<br/><span className="text-[10px] text-slate-500">(18%)</span>
                      </td>
                    )}
                    {tableCols.amount && <td className="p-2 text-right font-semibold">{print.amountWithDecimal ? "₹ 35.40" : "₹ 35"}</td>}
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300 font-bold">
                    <td colSpan={
                      (tableCols.slNo ? 1 : 0) + 
                      (tableCols.itemName ? 1 : 0) + 
                      (tableCols.itemCode ? 1 : 0) + 
                      (tableCols.hsnSac ? 1 : 0) || 1
                    } className="p-2 text-center">Total</td>
                    {tableCols.quantity && <td className="p-2 text-right">{print.totalItemQuantity ? "2 + 1" : ""}</td>}
                    {tableCols.priceUnit && <td className="p-2 text-right"></td>}
                    {tableCols.discount && <td className="p-2 text-right">{print.amountWithDecimal ? "₹ 0.10" : "₹ 0"}</td>}
                    {tableCols.taxAmount && <td className="p-2 text-right">{print.amountWithDecimal ? "₹ 5.90" : "₹ 6"}</td>}
                    {tableCols.amount && <td className="p-2 text-right">{print.amountWithDecimal ? "₹ 45.80" : "₹ 46"}</td>}
                  </tr>
                </tfoot>
              </table>

              <div className="flex justify-between mt-6">
                <div className="w-1/2 pr-4 space-y-4">
                  {print.printDescription && (
                    <div>
                      <p className="font-bold">Description</p>
                      <p className="text-slate-600">Sale Description</p>
                    </div>
                  )}
                  {print.amountInWords !== "None" && (
                    <div>
                      <p className="font-bold">INVOICE AMOUNT IN WORDS</p>
                      <p className="text-slate-600">Forty Five Rupees and Eighty Paisa only</p>
                    </div>
                  )}
                  {print.printTermsAndConditions && (
                    <div>
                      <p className="font-bold">TERMS AND CONDITIONS</p>
                      <p className="text-slate-600">Thanks for doing business with us!</p>
                    </div>
                  )}
                </div>
                <div className="w-1/2 flex flex-col items-end">
                  <div className="w-64 space-y-1.5">
                    <div className="flex justify-between"><span className="text-slate-600">Sub Total</span><span>{print.amountWithDecimal ? "₹ 40.00" : "₹ 40"}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Discount</span><span>{print.amountWithDecimal ? "₹ 0.10" : "₹ 0"}</span></div>
                    {print.taxDetails && (
                      <>
                        <div className="flex justify-between"><span className="text-slate-600">SGST@2.5%</span><span>{print.amountWithDecimal ? "₹ 0.25" : "₹ 0"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">CGST@2.5%</span><span>{print.amountWithDecimal ? "₹ 0.25" : "₹ 0"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">SGST@9%</span><span>{print.amountWithDecimal ? "₹ 2.70" : "₹ 3"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-600">CGST@9%</span><span>{print.amountWithDecimal ? "₹ 2.70" : "₹ 3"}</span></div>
                      </>
                    )}
                    <div className={`flex justify-between font-bold border-t pt-1.5 text-sm px-3 py-1.5 mt-2 ${print.themeName !== 'Basic' && print.themeName !== 'Tally' ? '-mr-3 -ml-3' : ''}`} style={print.themeName !== 'Basic' && print.themeName !== 'Tally' ? { backgroundColor: print.themeColor || '#a855f7', color: 'white' } : { borderColor: print.themeColor || '#a855f7', borderTopWidth: '2px', borderBottomWidth: '2px' }}>
                      <span>Total</span><span>{print.amountWithDecimal ? "₹ 45.80" : "₹ 46"}</span>
                    </div>
                    {print.receivedAmount && (
                      <div className="flex justify-between mt-2"><span className="text-slate-600">Received</span><span>{print.amountWithDecimal ? "₹ 0.00" : "₹ 0"}</span></div>
                    )}
                    {print.balanceAmount && (
                      <div className="flex justify-between"><span className="font-semibold">Balance</span><span className="font-semibold">{print.amountWithDecimal ? "₹ 45.80" : "₹ 46"}</span></div>
                    )}
                    {print.currentBalanceParty && (
                      <div className="flex justify-between text-slate-500 mt-3"><span className="text-[11px]">Current Balance</span><span className="text-[11px]">{print.amountWithDecimal ? "₹ 45.80" : "₹ 46"}</span></div>
                    )}
                  </div>
                </div>
              </div>

              {print.printSignatureText && (
                <div className="absolute bottom-12 right-12 text-right">
                  <div className="h-16 border-b border-slate-400 border-dashed w-40 mb-2"></div>
                  <p className="font-semibold">{print.signatureText}</p>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
      <ItemTableCustomizationModal isOpen={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} settings={settings} updateSettings={updateSettings} />
      <ChangeTransactionNamesModal isOpen={isNameModalOpen} onClose={() => setIsNameModalOpen(false)} settings={settings} updateSettings={updateSettings} />
      <ChangeThemeModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} settings={settings} updateSettings={updateSettings} />
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
}
