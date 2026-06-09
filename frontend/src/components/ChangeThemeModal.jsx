import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";

export function ChangeThemeModal({ isOpen, onClose, settings, updateSettings }) {
  const [selectedTheme, setSelectedTheme] = useState(settings?.printSettings?.themeName || "Advanced");
  const [selectedColor, setSelectedColor] = useState(settings?.printSettings?.themeColor || "#a855f7"); // Default purple

  const themes = [
    { id: "Advanced", name: "Advanced Invoice Format", isFree: true, image: "https://via.placeholder.com/150x200?text=Advanced" },
    { id: "Basic", name: "Basic Invoice", isFree: true, image: "https://via.placeholder.com/150x200?text=Basic" },
    { id: "Simple", name: "Simple Invoice Format", isFree: true, image: "https://via.placeholder.com/150x200?text=Simple" },
    { id: "Tally", name: "Tally Theme", isFree: false, image: "https://via.placeholder.com/150x200?text=Tally" },
    { id: "French", name: "French Elite", isFree: false, image: "https://via.placeholder.com/150x200?text=French" },
  ];

  const colors = [
    "#a855f7", // Purple
    "#0ea5e9", // Blue
    "#10b981", // Green
    "#ef4444", // Red
    "#f59e0b", // Orange
    "#64748b", // Slate
    "#333333", // Dark Gray
    "#8b5cf6", // Violet
  ];

  const handleApply = () => {
    updateSettings("printSettings", {
      themeName: selectedTheme,
      themeColor: selectedColor,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-xl text-slate-800">Transaction Theme</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Side: Theme Selection */}
          <div className="w-full md:w-1/2 border-r flex flex-col">
            <div className="p-4 bg-slate-50 border-b">
              <h3 className="font-semibold text-slate-700 mb-3">Theme Colors</h3>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${selectedColor === color ? "ring-2 ring-offset-2 ring-slate-400" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-slate-100">
              <div className="grid grid-cols-2 gap-4">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`bg-white rounded-lg border overflow-hidden cursor-pointer transition-all hover:shadow-md ${selectedTheme === theme.id ? "ring-2 ring-blue-500 border-transparent shadow-md" : "border-slate-200"}`}
                    onClick={() => setSelectedTheme(theme.id)}
                  >
                    <div className="relative aspect-[3/4] bg-slate-100 p-2 border-b">
                      {theme.isFree && (
                        <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10">
                          Free
                        </div>
                      )}
                      {/* Placeholder for theme image - in a real app, use actual thumbnails */}
                      <div className="w-full h-full bg-white shadow-sm border border-slate-200 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-full h-4" style={{ backgroundColor: selectedColor, borderTopWidth: theme.id === 'Advanced' ? '4px' : '0' }}></div>
                         <div className="p-2 pt-6">
                           <div className="w-1/2 h-2 bg-slate-200 mb-2"></div>
                           <div className="w-1/3 h-2 bg-slate-200 mb-4"></div>
                           <div className="w-full h-12 bg-slate-50 border border-slate-200 mb-2 flex">
                              <div className="w-full h-2 bg-slate-200 mt-2 mx-1"></div>
                           </div>
                           <div className="w-full h-2 bg-slate-200"></div>
                         </div>
                      </div>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-[13px] font-semibold text-slate-800">{theme.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Side: Large Preview Placeholder */}
          <div className="hidden md:flex w-1/2 bg-slate-200 items-center justify-center p-8">
            <div className="w-full max-w-[300px] aspect-[1/1.4] bg-white shadow-lg border relative overflow-hidden flex flex-col">
               <div className="h-12 w-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: selectedColor }}>
                  {themes.find(t => t.id === selectedTheme)?.name || "TAX INVOICE"}
               </div>
               <div className="p-4 flex-1">
                  <div className="w-32 h-3 bg-slate-200 mb-2"></div>
                  <div className="w-24 h-3 bg-slate-200 mb-6"></div>
                  
                  <div className="w-full h-32 border flex flex-col mb-4">
                    <div className="h-6 w-full text-white text-[8px] flex items-center px-2" style={{ backgroundColor: selectedColor }}>
                      Table Header
                    </div>
                    <div className="flex-1 bg-slate-50"></div>
                  </div>
                  
                  <div className="w-full flex justify-end">
                    <div className="w-1/2 border p-2">
                       <div className="w-full h-3 bg-slate-200 mb-1"></div>
                       <div className="w-full h-3 bg-slate-200"></div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-white">
          <Button variant="outline" onClick={onClose} className="w-full md:w-auto">Cancel</Button>
          <Button onClick={handleApply} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">Apply Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
