import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ItemTableCustomizationModal({ isOpen, onClose, settings, updateSettings }) {
  const print = settings.printSettings || {};
  const [localColumns, setLocalColumns] = useState({});
  const [localNames, setLocalNames] = useState({});

  useEffect(() => {
    if (isOpen) {
      setLocalColumns(print.tableColumns || {});
      setLocalNames(print.tableColumnNames || {});
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleUpdate = (key, value) => {
    setLocalColumns(prev => ({ ...prev, [key]: value }));
  };

  const handleNameUpdate = (key, value) => {
    setLocalNames(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings("printSettings", {
      ...print,
      tableColumns: localColumns,
      tableColumnNames: localNames
    });
    onClose();
  };

  const renderCheckGroup = (key, defaultLabel, inputLabel = null) => {
    const checked = localColumns[key];
    const customName = localNames[key] || "";
    
    return (
      <div className="flex items-start gap-3 py-2 group">
        <Checkbox 
          checked={!!checked} 
          onCheckedChange={(c) => handleUpdate(key, !!c)} 
          className="mt-1 h-4 w-4 rounded shadow-sm data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-slate-300" 
        />
        <div className="flex flex-col gap-1 w-full max-w-[240px]">
          <Label className="text-[13px] text-slate-700 cursor-pointer" onClick={() => handleUpdate(key, !checked)}>
            {defaultLabel}
          </Label>
          {inputLabel && (
            <div className="relative mt-1">
              <Label className="absolute -top-2 left-2 bg-white px-1 text-[10px] text-slate-400 z-10">{inputLabel}</Label>
              <Input 
                value={customName} 
                onChange={(e) => handleNameUpdate(key, e.target.value)}
                disabled={!checked}
                className={`h-8 text-[12px] bg-white border-slate-200 text-slate-600 focus-visible:ring-1 focus-visible:ring-blue-500 ${!checked ? "opacity-50" : ""}`} 
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-0">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">Item Table Customization</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-full p-1 bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Header Preview */}
        <div className="px-6 pb-2 shrink-0 overflow-x-auto">
          <div className="min-w-[800px] border border-slate-200 rounded-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-indigo-400 text-white text-[12px]">
                  {localColumns.slNo && <th className="p-2 font-medium">{localNames.slNo || "#"}</th>}
                  {localColumns.itemName && <th className="p-2 font-medium">{localNames.itemName || "Item name"}</th>}
                  {localColumns.hsnSac && <th className="p-2 font-medium">{localNames.hsnSac || "HSN/SAC"}</th>}
                  {localColumns.itemCode && <th className="p-2 font-medium">{localNames.itemCode || "Item Code"}</th>}
                  {localColumns.batchNo && <th className="p-2 font-medium">{localNames.batchNo || "Batch No."}</th>}
                  {localColumns.expDate && <th className="p-2 font-medium">{localNames.expDate || "Exp. Date"}</th>}
                  {localColumns.mfgDate && <th className="p-2 font-medium">{localNames.mfgDate || "Mfg. Date"}</th>}
                  {localColumns.mrp && <th className="p-2 font-medium">{localNames.mrp || "MRP"}</th>}
                  {localColumns.size && <th className="p-2 font-medium">{localNames.size || "Size"}</th>}
                  {localColumns.modelNo && <th className="p-2 font-medium">{localNames.modelNo || "Model No."}</th>}
                  {localColumns.description && <th className="p-2 font-medium">{localNames.description || "Description"}</th>}
                  {localColumns.count && <th className="p-2 font-medium">{localNames.count || "Count"}</th>}
                  {localColumns.colour && <th className="p-2 font-medium">{localNames.colour || "Colour"}</th>}
                  {localColumns.material && <th className="p-2 font-medium">{localNames.material || "Material"}</th>}
                  {localColumns.brand && <th className="p-2 font-medium">{localNames.brand || "Brand"}</th>}
                  {localColumns.serialNo && <th className="p-2 font-medium">{localNames.serialNo || "Serial No."}</th>}
                  {localColumns.challanNo && <th className="p-2 font-medium">{localNames.challanNo || "Challan/Order No."}</th>}
                  {localColumns.quantity && <th className="p-2 font-medium">{localNames.quantity || "Quantity"}</th>}
                  {localColumns.unit && <th className="p-2 font-medium">{localNames.unit || "Unit"}</th>}
                  {localColumns.priceUnit && <th className="p-2 font-medium">{localNames.priceUnit || "Price/Unit"}</th>}
                  {localColumns.discount && <th className="p-2 font-medium">{localNames.discount || "Discount"}</th>}
                  {localColumns.discountPercent && <th className="p-2 font-medium">{localNames.discountPercent || "Discount %"}</th>}
                  {localColumns.taxablePriceUnit && <th className="p-2 font-medium">{localNames.taxablePriceUnit || "Taxable Price/Unit"}</th>}
                  {localColumns.taxAmount && <th className="p-2 font-medium">{localNames.taxAmount || "Tax Amount"}</th>}
                  {localColumns.taxPercent && <th className="p-2 font-medium">{localNames.taxPercent || "Tax Percent"}</th>}
                  {localColumns.taxableAmount && <th className="p-2 font-medium">{localNames.taxableAmount || "Taxable Amount"}</th>}
                  {localColumns.cess && <th className="p-2 font-medium">{localNames.cess || "Ad. CESS"}</th>}
                  {localColumns.finalRate && <th className="p-2 font-medium">{localNames.finalRate || "Final Rate"}</th>}
                  {localColumns.amount && <th className="p-2 font-medium">{localNames.amount || "Amount"}</th>}
                </tr>
              </thead>
              <tbody>
                <tr className="text-[12px] text-slate-700 bg-white">
                  {localColumns.slNo && <td className="p-2 border-r">1</td>}
                  {localColumns.itemName && <td className="p-2 border-r">Item 1</td>}
                  {localColumns.hsnSac && <td className="p-2 border-r">101</td>}
                  {localColumns.itemCode && <td className="p-2 border-r">ITM001</td>}
                  {localColumns.batchNo && <td className="p-2 border-r">B10</td>}
                  {localColumns.expDate && <td className="p-2 border-r">09/24</td>}
                  {localColumns.mfgDate && <td className="p-2 border-r">31/12</td>}
                  {localColumns.mrp && <td className="p-2 border-r">₹ 500</td>}
                  {localColumns.size && <td className="p-2 border-r">1</td>}
                  {localColumns.modelNo && <td className="p-2 border-r">MDL1</td>}
                  {localColumns.description && <td className="p-2 border-r">Desc...</td>}
                  {localColumns.count && <td className="p-2 border-r">10</td>}
                  {localColumns.colour && <td className="p-2 border-r">Red</td>}
                  {localColumns.material && <td className="p-2 border-r">Cotton</td>}
                  {localColumns.brand && <td className="p-2 border-r">Puma</td>}
                  {localColumns.serialNo && <td className="p-2 border-r">SN123</td>}
                  {localColumns.challanNo && <td className="p-2 border-r">CH001</td>}
                  {localColumns.quantity && <td className="p-2 border-r">1</td>}
                  {localColumns.unit && <td className="p-2 border-r">Pcs</td>}
                  {localColumns.priceUnit && <td className="p-2 border-r">₹ 500</td>}
                  {localColumns.discount && <td className="p-2 border-r">₹ 25</td>}
                  {localColumns.discountPercent && <td className="p-2 border-r">5%</td>}
                  {localColumns.taxablePriceUnit && <td className="p-2 border-r">₹ 475</td>}
                  {localColumns.taxAmount && <td className="p-2 border-r">₹ 85</td>}
                  {localColumns.taxPercent && <td className="p-2 border-r">18%</td>}
                  {localColumns.taxableAmount && <td className="p-2 border-r">₹ 475</td>}
                  {localColumns.cess && <td className="p-2 border-r">₹ 0</td>}
                  {localColumns.finalRate && <td className="p-2 border-r">₹ 560</td>}
                  {localColumns.amount && <td className="p-2 border-r">₹ 560</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Body columns */}
        <div className="flex-1 overflow-y-auto px-6 py-4 border-t custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Column 1 */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b">Item related columns</h3>
              <div className="space-y-1">
                {renderCheckGroup("slNo", "#", "Sl No.")}
                {renderCheckGroup("itemName", "Item name", "Item Name")}
                {renderCheckGroup("itemCode", "Item Code", "Item Code")}
                {renderCheckGroup("hsnSac", "HSN/ SAC", "HSN/SAC")}
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b flex justify-between">
                Additional Item Columns
                <span className="text-xs bg-slate-700 text-white px-2 py-0.5 rounded cursor-pointer">Drag and Drop Columns to Re-Order</span>
              </h3>
              <div className="space-y-1">
                {renderCheckGroup("batchNo", "Batch No.")}
                {renderCheckGroup("expDate", "Exp. Date")}
                {renderCheckGroup("mfgDate", "Mfg. Date")}
                {renderCheckGroup("mrp", "MRP")}
                {renderCheckGroup("size", "Size")}
                {renderCheckGroup("modelNo", "Model No.")}
                {renderCheckGroup("description", "Description")}
                {renderCheckGroup("count", "Count")}
                {renderCheckGroup("colour", "Colour")}
                {renderCheckGroup("material", "Material")}
                {renderCheckGroup("brand", "Brand")}
              </div>

              <h3 className="font-bold text-slate-800 mt-6 mb-4 pb-2 border-b">Item Serial Number</h3>
              <div className="space-y-1">
                {renderCheckGroup("serialNo", "Serial No.")}
              </div>

              <h3 className="font-bold text-slate-800 mt-6 mb-4 pb-2 border-b">Additional Fields</h3>
              <div className="space-y-1">
                {renderCheckGroup("challanNo", "Challan/Order No.")}
              </div>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b">Amounts, Totals & Taxes</h3>
              <div className="space-y-1">
                {renderCheckGroup("quantity", "Quantity", "Quantity")}
                {renderCheckGroup("unit", "Unit", "Unit Of Measurement")}
                {renderCheckGroup("priceUnit", "Price/ Unit", "Price/Unit")}
                {renderCheckGroup("discount", "Discount", "Discount/Amount")}
                {renderCheckGroup("discountPercent", "Discount Percent")}
                {renderCheckGroup("taxablePriceUnit", "Taxable Price/ Unit", "Taxable Price/Unit")}
                {renderCheckGroup("taxAmount", "Tax Amount")}
                {renderCheckGroup("taxPercent", "Tax Percent")}
                {renderCheckGroup("taxableAmount", "Taxable amount", "Taxable Amount")}
                {renderCheckGroup("cess", "Ad. CESS", "Additional Cess")}
                {renderCheckGroup("finalRate", "Final Rate", "Final Price/Unit")}
                {renderCheckGroup("amount", "Amount", "Total Amount")}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end shrink-0 bg-slate-50 rounded-b-lg">
          <button 
            onClick={handleSave}
            className="px-6 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-sm text-sm"
          >
            DONE
          </button>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
}
