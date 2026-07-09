import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Search, FileDown, Share2, Filter, ReceiptText, Eye, Trash2, X
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useMockAuth } from "@/lib/auth-store";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { useInvoices } from "@/contexts/InvoiceContext";
import api from "@/lib/api";
import { validateUtr, validateUpi } from "@/lib/validation";

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

const statusStyles = {
  Paid: "bg-success-soft text-success border-success/20",
  Unpaid: "bg-destructive/10 text-destructive border-destructive/20",
  Partial: "bg-accent-soft text-accent-foreground border-accent/20",
};

export function BillingDashboard() {
  const { invoices, refreshInvoices } = useInvoices();
  const { user } = useMockAuth();
  const isViewer = user?.role === "Viewer";
  
  const userRole = user?.role?.toLowerCase() || "user";
  const rolePrefix = (userRole === "staff" || userRole === "viewer") ? "/staff" : "/vendor";

  useEffect(() => {
    refreshInvoices();
  }, []);

  const stats = useMemo(() => {
    let paid = 0;
    let unpaid = 0;
    let partial = 0;

    invoices.forEach((inv) => {
      const amt = Number(inv.amount) || 0;
      if (inv.status === "Paid") paid += amt;
      else if (inv.status === "Unpaid") unpaid += amt;
      else if (inv.status === "Partial") partial += amt;
    });

    return {
      total: invoices.length,
      paid,
      unpaid,
      partial,
      collectedThisMonth: paid,
    };
  }, [invoices]);

  const [tab, setTab] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();

  const typeFilter = searchParams.get("type") || "all";
  const setTypeFilter = (val) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val && val !== "all") {
        next.set("type", val);
      } else {
        next.delete("type");
      }
      return next;
    });
  };

  const search = searchParams.get("q") || "";
  const setSearch = (val) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("q", val);
      else next.delete("q");
      return next;
    });
  };

  const filtered = invoices.filter((i) => {
    const matchesTab = tab === "all" || i.status.toLowerCase() === tab;
    const matchesType = typeFilter === "all" || (i.type || "Sale").toLowerCase() === typeFilter;
    const matchesSearch = 
      (i.invoiceNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.partyName || i.party || "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesType && matchesSearch;
  });

  // --- Status Update Modal State ---
  const [statusModal, setStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [newStatus, setNewStatus] = useState("Paid");
  const [modalPaymentMethod, setModalPaymentMethod] = useState("Cash");
  const [modalReceivedAmount, setModalReceivedAmount] = useState(0);
  const [modalPaymentDetails, setModalPaymentDetails] = useState({
    transactionId: "", utr: "", bankName: "", accountNumber: "", ifsc: ""
  });
  const [modalErrors, setModalErrors] = useState({ utr: "", upi: "" });

  const openStatusModal = (inv, selectedStatus) => {
    if (selectedStatus === "Unpaid") {
      directStatusUpdate(inv, "Unpaid", undefined, 0, {});
      return;
    }
    setStatusTarget(inv);
    setNewStatus(selectedStatus);
    setModalPaymentMethod(inv.paymentMethod || "Cash");
    setModalReceivedAmount(selectedStatus === "Paid" ? (inv.grandTotal || inv.amount) : Math.round((inv.grandTotal || inv.amount) / 2));
    setModalPaymentDetails({ transactionId: "", utr: "", bankName: "", accountNumber: "", ifsc: "" });
    setModalErrors({ utr: "", upi: "" });
    setStatusModal(true);
  };

  const directStatusUpdate = async (inv, status, paymentMethod, receivedAmount, paymentDetails) => {
    try {
      await api.patch(`/invoices/${inv._id}/status`, {
        status, receivedAmount, paymentMethod, paymentDetails
      });
      refreshInvoices();
      toast.success(`${inv.invoiceNumber || inv.id} → ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleModalSubmit = () => {
    if (modalPaymentMethod === "Online") {
      let hasError = false;
      let errs = { utr: "", upi: "" };
      if (!validateUtr(modalPaymentDetails.utr)) {
        errs.utr = "Please enter a valid UTR Number.";
        hasError = true;
      }
      if (!validateUpi(modalPaymentDetails.transactionId)) {
        errs.upi = "Please enter a valid UPI ID.";
        hasError = true;
      }
      if (hasError) {
        setModalErrors(errs);
        return;
      }
    }
    directStatusUpdate(statusTarget, newStatus, modalPaymentMethod, modalReceivedAmount, modalPaymentDetails);
    setStatusModal(false);
  };

  const downloadOne = (inv) => {
    downloadInvoicePdf({
      number: inv.invoiceNumber || inv.id,
      date: new Date(inv.date).toLocaleDateString(),
      business: {
        name: "Sharma Traders",
        address: "Shop 12, MG Road, Indore, MP 452001",
        gstin: "23ABCDE1234F1Z5",
        phone: "+91 98765 43210",
      },
      party: { name: inv.partyName || inv.party },
      lines: [
        { name: "Items as per challan", qty: 1, rate: (inv.grandTotal || inv.amount) / 1.18, gst: 18 },
      ],
    });
    toast.success(`${inv.invoiceNumber || inv.id} downloaded`);
  };

  const shareWA = (inv) => {
    const msg = encodeURIComponent(
      `Hi ${inv.partyName || inv.party}, your invoice ${inv.invoiceNumber || inv.id} of ₹${(inv.grandTotal || inv.amount).toLocaleString("en-IN")} is ready.`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const previewOne = (inv) => {
    downloadInvoicePdf({
      number: inv.invoiceNumber || inv.id,
      date: new Date(inv.date).toLocaleDateString(),
      business: {
        name: "Sharma Traders",
        address: "Shop 12, MG Road, Indore, MP 452001",
        gstin: "23ABCDE1234F1Z5",
        phone: "+91 98765 43210",
      },
      party: { name: inv.partyName || inv.party },
      lines: [
        { name: "Items as per challan", qty: 1, rate: (inv.grandTotal || inv.amount) / 1.18, gst: 18 },
      ],
    }, { preview: true });
    toast.success(`Opening preview for ${inv.invoiceNumber || inv.id}`);
  };

  const deleteOne = async (inv) => {
    if (!window.confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber || inv.id}?`)) return;
    try {
      await api.delete(`/invoices/${inv._id}`);
      refreshInvoices();
      toast.success(`Invoice ${inv.invoiceNumber || inv.id} deleted successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete invoice");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
        subtitle={`${stats.total} invoices · ${fmt(stats.collectedThisMonth)} collected`}
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={() => toast.success("Exporting invoices…")}>
              <FileDown className="mr-1 h-4 w-4" /> Export
            </Button>
            {!isViewer && (
              <>
                <Button asChild className="rounded-xl bg-red-500 hover:bg-red-600">
                  <Link to={`${rolePrefix}/sale/new`}>
                    <Plus className="mr-1 h-4 w-4" /> Sale
                  </Link>
                </Button>
                <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700">
                  <Link to={`${rolePrefix}/purchase/new`}>
                    <Plus className="mr-1 h-4 w-4" /> Purchase
                  </Link>
                </Button>
              </>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { label: "Total Invoices", value: stats.total.toString(), tint: "bg-primary-soft text-primary" },
          { label: "Paid", value: fmt(stats.paid), tint: "bg-success-soft text-success" },
          { label: "Unpaid", value: fmt(stats.unpaid), tint: "bg-destructive/10 text-destructive" },
          { label: "Partially Paid", value: fmt(stats.partial), tint: "bg-accent-soft text-accent-foreground" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}>
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={tab} onValueChange={setTab} className="hidden sm:block">
              <TabsList className="rounded-xl">
                <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                <TabsTrigger value="paid" className="rounded-lg">Paid</TabsTrigger>
                <TabsTrigger value="unpaid" className="rounded-lg">Unpaid</TabsTrigger>
                <TabsTrigger value="partial" className="rounded-lg">Partial</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex w-full gap-2 sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs sm:text-sm font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring flex items-center gap-1.5 cursor-pointer">
                    {typeFilter === "all" ? "All Types" : typeFilter === "sale" ? "Sales Only" : "Purchases Only"}
                    <span className="text-[10px] text-slate-500">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 rounded-2xl shadow-lg border border-slate-100 p-1.5 bg-white">
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter("all")} 
                    className={`cursor-pointer rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${typeFilter === "all" ? "bg-slate-50 text-emerald-700 font-bold" : "text-slate-700"}`}
                  >
                    All Types
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter("sale")} 
                    className={`cursor-pointer rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${typeFilter === "sale" ? "bg-slate-50 text-emerald-700 font-bold" : "text-slate-700"}`}
                  >
                    Sales Only
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setTypeFilter("purchase")} 
                    className={`cursor-pointer rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${typeFilter === "purchase" ? "bg-slate-50 text-emerald-700 font-bold" : "text-slate-700"}`}
                  >
                    Purchases Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="relative flex-1 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search invoice…" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-full pl-9 sm:w-64" 
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl sm:hidden">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem onClick={() => setTab("all")} className="cursor-pointer">All Statuses</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTab("paid")} className="cursor-pointer">Paid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTab("unpaid")} className="cursor-pointer">Unpaid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTab("partial")} className="cursor-pointer">Partial</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead>Invoice</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead className="text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv._id || inv.id} className="border-b last:border-0">
                    <TableCell className="font-semibold">{inv.invoiceNumber || inv.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={inv.type === 'Sale' ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'}>
                        {inv.type || 'Sale'}
                      </Badge>
                    </TableCell>
                    <TableCell>{inv.partyName || inv.party}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {inv.date ? new Date(inv.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : ""}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{fmt(inv.grandTotal || inv.amount)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="cursor-pointer focus:outline-none">
                            <Badge variant="outline" className={`rounded-full ${statusStyles[inv.status]} hover:opacity-80 transition-opacity`}>
                              {inv.status} ▾
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-36 rounded-xl">
                          {['Paid', 'Unpaid', 'Partial'].map((s) => (
                            <DropdownMenuItem 
                              key={s} 
                              onClick={() => openStatusModal(inv, s)} 
                              className={`cursor-pointer text-xs font-medium ${inv.status === s ? 'bg-slate-100 font-bold' : ''}`}
                            >
                              <Badge variant="outline" className={`rounded-full mr-2 ${statusStyles[s]}`}>
                                {s}
                              </Badge>
                              {inv.status === s && '✓'}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      {inv.status === "Unpaid" ? (
                        <span className="text-[11px] text-muted-foreground">—</span>
                      ) : (
                        <Badge variant="outline" className="rounded-full bg-slate-100 border-slate-200 text-[10px] text-slate-800 font-semibold px-2 py-0.5">
                          {inv.paymentMethod || "Cash"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100" 
                          onClick={() => previewOne(inv)}
                          title="Preview PDF"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100" 
                          onClick={() => downloadOne(inv)}
                          title="Download PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50" 
                          onClick={() => shareWA(inv)}
                          title="Share WhatsApp"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50" 
                          onClick={() => deleteOne(inv)}
                          title="Delete Invoice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 bg-gradient-to-br from-primary-soft to-card shadow-[var(--shadow-card)]">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold">Create your next GST invoice</h3>
            <p className="text-sm text-muted-foreground">Auto-calculated CGST/SGST · WhatsApp share · PDF download</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => window.open("https://wa.me/?text=" + encodeURIComponent("Sharing invoice from Udaan"), "_blank")}
            >
              <Share2 className="mr-1 h-4 w-4" /> Share via WhatsApp
            </Button>
            {!isViewer && (
              <>
                <Button asChild className="rounded-xl bg-red-500 hover:bg-red-600">
                  <Link to={`${rolePrefix}/sale/new`}>
                    <Plus className="mr-1 h-4 w-4" /> Sale
                  </Link>
                </Button>
                <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700">
                  <Link to={`${rolePrefix}/purchase/new`}>
                    <Plus className="mr-1 h-4 w-4" /> Purchase
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ====== Status Update Modal ====== */}
      <Dialog open={statusModal} onOpenChange={setStatusModal}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Update Status → <Badge variant="outline" className={`rounded-full ml-1 ${statusStyles[newStatus]}`}>{newStatus}</Badge>
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {statusTarget?.invoiceNumber} · {statusTarget?.partyName || statusTarget?.party} · {fmt(statusTarget?.grandTotal || statusTarget?.amount || 0)}
            </p>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Received Amount (only for Partial) */}
            {newStatus === "Partial" && (
              <div>
                <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Received Amount (₹)</label>
                <Input
                  type="number"
                  min={0}
                  max={statusTarget?.grandTotal || statusTarget?.amount || 0}
                  value={modalReceivedAmount}
                  onChange={(e) => setModalReceivedAmount(Number(e.target.value) || 0)}
                  className="h-9 rounded-xl"
                />
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Payment Method</label>
              <select
                value={modalPaymentMethod}
                onChange={(e) => setModalPaymentMethod(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1"
              >
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Online Fields */}
            {modalPaymentMethod === "Online" && (
              <div className="space-y-3 pt-2 border-t border-dashed">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">UPI ID</label>
                    <Input
                      value={modalPaymentDetails.transactionId}
                      onChange={(e) => {
                        setModalPaymentDetails({ ...modalPaymentDetails, transactionId: e.target.value });
                        if (validateUpi(e.target.value)) setModalErrors(p => ({ ...p, upi: "" }));
                      }}
                      placeholder="e.g. name@okhdfcbank"
                      maxLength={45}
                      className={`h-9 rounded-xl text-xs ${modalErrors.upi ? 'border-red-500' : ''}`}
                    />
                    {modalErrors.upi && <span className="text-[10px] text-red-500 mt-1 block">{modalErrors.upi}</span>}
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">UTR Number</label>
                    <Input
                      value={modalPaymentDetails.utr}
                      onChange={(e) => {
                        setModalPaymentDetails({ ...modalPaymentDetails, utr: e.target.value });
                        if (validateUtr(e.target.value)) setModalErrors(p => ({ ...p, utr: "" }));
                      }}
                      placeholder="e.g. 123456789012"
                      maxLength={22}
                      className={`h-9 rounded-xl text-xs ${modalErrors.utr ? 'border-red-500' : ''}`}
                    />
                    {modalErrors.utr && <span className="text-[10px] text-red-500 mt-1 block">{modalErrors.utr}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Bank Transfer Fields */}
            {modalPaymentMethod === "Bank Transfer" && (
              <div className="space-y-3 pt-2 border-t border-dashed">
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Bank Name</label>
                    <Input
                      value={modalPaymentDetails.bankName}
                      onChange={(e) => setModalPaymentDetails({ ...modalPaymentDetails, bankName: e.target.value })}
                      placeholder="HDFC / SBI"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Account No.</label>
                    <Input
                      value={modalPaymentDetails.accountNumber}
                      onChange={(e) => setModalPaymentDetails({ ...modalPaymentDetails, accountNumber: e.target.value })}
                      placeholder="987654321012"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 mb-1 block">IFSC Code</label>
                    <Input
                      value={modalPaymentDetails.ifsc}
                      onChange={(e) => setModalPaymentDetails({ ...modalPaymentDetails, ifsc: e.target.value })}
                      placeholder="HDFC0001234"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" className="rounded-xl" onClick={() => setStatusModal(false)}>
              Cancel
            </Button>
            <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600" onClick={handleModalSubmit}>
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
