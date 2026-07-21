import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Truck } from "lucide-react";

export function TransportDetailsDrawer({ isOpen, onClose, onSave, transportDetails, setTransportDetails, shippingDetails, setShippingDetails }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Transport & Dispatch Details</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Part B: Transport Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-1">Part B: Transport Info</h3>
            
            <div className="space-y-2">
              <Label className="text-xs">Transporter Name</Label>
              <Input 
                value={transportDetails.transporterName || ""}
                onChange={(e) => setTransportDetails({...transportDetails, transporterName: e.target.value})}
                placeholder="e.g. Fast Track Logistics" 
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Transporter ID (GSTIN)</Label>
              <Input 
                value={transportDetails.transporterId || ""}
                onChange={(e) => setTransportDetails({...transportDetails, transporterId: e.target.value})}
                placeholder="27AADCB2230M1Z2" 
                className="h-9 uppercase"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Vehicle Number</Label>
                <Input 
                  value={transportDetails.vehicleNumber || ""}
                  onChange={(e) => setTransportDetails({...transportDetails, vehicleNumber: e.target.value})}
                  placeholder="MH12AB1234" 
                  className="h-9 uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Vehicle Type</Label>
                <select 
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                  value={transportDetails.vehicleType || "Regular"}
                  onChange={(e) => setTransportDetails({...transportDetails, vehicleType: e.target.value})}
                >
                  <option value="Regular">Regular</option>
                  <option value="ODC">Over Dimensional (ODC)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Mode of Transport</Label>
                <select 
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none"
                  value={transportDetails.modeOfTransport || "Road"}
                  onChange={(e) => setTransportDetails({...transportDetails, modeOfTransport: e.target.value})}
                >
                  <option value="Road">Road</option>
                  <option value="Rail">Rail</option>
                  <option value="Air">Air</option>
                  <option value="Ship">Ship</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Approx Distance (KM)</Label>
                <Input 
                  type="number"
                  value={transportDetails.approxDistance || ""}
                  onChange={(e) => setTransportDetails({...transportDetails, approxDistance: Number(e.target.value)})}
                  placeholder="100" 
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">LR / RR Number</Label>
                <Input 
                  value={transportDetails.lrNumber || ""}
                  onChange={(e) => setTransportDetails({...transportDetails, lrNumber: e.target.value})}
                  placeholder="LR123456" 
                  className="h-9 uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">LR Date</Label>
                <Input 
                  type="date"
                  value={transportDetails.lrDate ? new Date(transportDetails.lrDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => setTransportDetails({...transportDetails, lrDate: e.target.value})}
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-blue-600">Official E-Way Bill Number</Label>
              <Input 
                value={transportDetails.ewbNumber || ""}
                onChange={(e) => setTransportDetails({...transportDetails, ewbNumber: e.target.value})}
                placeholder="Enter 12-digit EWB Number if already generated" 
                className="h-9 border-blue-200 bg-blue-50/50"
              />
            </div>
          </div>

          {/* Shipping Details */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-1">Dispatch & Delivery</h3>
            
            <div className="space-y-2">
              <Label className="text-xs">Dispatch From (Address)</Label>
              <Input 
                value={shippingDetails.dispatchFromAddress || ""}
                onChange={(e) => setShippingDetails({...shippingDetails, dispatchFromAddress: e.target.value})}
                placeholder="Warehouse / Shop Address" 
                className="h-9"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Place of Dispatch (PIN Code / City)</Label>
              <Input 
                value={shippingDetails.placeOfDispatch || ""}
                onChange={(e) => setShippingDetails({...shippingDetails, placeOfDispatch: e.target.value})}
                placeholder="e.g. 400001" 
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Ship To (Address)</Label>
              <Input 
                value={shippingDetails.shipToAddress || ""}
                onChange={(e) => setShippingDetails({...shippingDetails, shipToAddress: e.target.value})}
                placeholder="Delivery Address" 
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Place of Delivery (PIN Code / City)</Label>
              <Input 
                value={shippingDetails.placeOfDelivery || ""}
                onChange={(e) => setShippingDetails({...shippingDetails, placeOfDelivery: e.target.value})}
                placeholder="e.g. 110001" 
                className="h-9"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700">Save & Generate E-Way Bill</Button>
        </div>
      </div>
    </div>
  );
}
