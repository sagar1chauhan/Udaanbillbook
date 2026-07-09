import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Download, FileText, TrendingUp, Receipt, PieChart as PieIcon,
  Search, ChevronDown, ChevronRight, Eye, FileSpreadsheet,
  ShoppingCart, Users, FileCheck, Package, BarChart3,
  ArrowUpDown, IndianRupee, CreditCard, Truck, Calculator,
  CalendarDays, Filter, Crown, BookOpen, Landmark, Wallet,
  ClipboardList, FileBarChart, ShieldCheck, ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import { useInvoices } from "@/contexts/InvoiceContext";
import api from "@/lib/api";

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

// ─── Quick Insights Chart Data ──────────────────────────────────────────
const monthly = [
  { m: "Nov", sales: 184000, expense: 78000, profit: 106000 },
  { m: "Dec", sales: 212000, expense: 84000, profit: 128000 },
  { m: "Jan", sales: 198000, expense: 81000, profit: 117000 },
  { m: "Feb", sales: 246000, expense: 96000, profit: 150000 },
  { m: "Mar", sales: 274000, expense: 102000, profit: 172000 },
  { m: "Apr", sales: 312000, expense: 118000, profit: 194000 },
];

const gstSplit = [
  { name: "CGST 9%", value: 28080 },
  { name: "SGST 9%", value: 28080 },
  { name: "IGST 18%", value: 14200 },
  { name: "Exempt", value: 6400 },
];
const pieColors = ["var(--color-primary)", "var(--color-chart-2)", "var(--color-accent)", "var(--color-muted-foreground)"];

// ─── Report Categories Definition ───────────────────────────────────────
const reportCategories = [
  {
    id: "transaction",
    title: "Transaction Reports",
    icon: ReceiptText,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800/40",
    reports: [
      { name: "Sale Report", description: "Detailed sales transactions with party, item & tax breakdowns", icon: ShoppingCart },
      { name: "Purchase Report", description: "All purchase entries with supplier and cost details", icon: Truck },
      { name: "Day Book", description: "Complete daily transaction log across all categories", icon: BookOpen },
      { name: "Cash Flow Statement", description: "Track money inflows and outflows over time", icon: ArrowUpDown },
      { name: "Estimate / Quotation Report", description: "List all estimates and quotations with status", icon: ClipboardList },
      { name: "Delivery Challan Report", description: "Track all delivery challans and goods dispatched", icon: FileCheck },
      { name: "Credit Note Report", description: "All credit notes issued with amounts and reasons", icon: CreditCard },
      { name: "Debit Note Report", description: "All debit notes raised with details", icon: CreditCard },
    ],
  },
  {
    id: "party",
    title: "Party Reports",
    icon: Users,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800/40",
    reports: [
      { name: "Party Statement", description: "Ledger of transactions for a specific customer/supplier", icon: FileText },
      { name: "All Parties Report", description: "Summary of all parties with balances and activity", icon: Users },
      { name: "Party wise Profit & Loss", description: "Profit or loss breakdown per individual party", icon: TrendingUp },
      { name: "Receivable Report", description: "Amounts receivable from customers with aging", icon: IndianRupee },
      { name: "Payable Report", description: "Amounts payable to suppliers with due dates", icon: Wallet },
    ],
  },
  {
    id: "gst",
    title: "GST Reports",
    icon: ShieldCheck,
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800/40",
    reports: [
      { name: "GSTR-1 Report", description: "Outward supplies – All sales transactions for GST filing", icon: FileBarChart },
      { name: "GSTR-2 Report", description: "Inward supplies – All purchase data for return matching", icon: FileBarChart },
      { name: "GSTR-3B Summary", description: "Consolidated monthly summary of input/output tax", icon: Calculator },
      { name: "GSTR-9 Annual Return", description: "Yearly consolidated GST return data", icon: FileBarChart, premium: true },
      { name: "Sale Summary by HSN/SAC", description: "Sales grouped by HSN/SAC codes with tax breakup", icon: ClipboardList },
      { name: "Purchase Summary by HSN/SAC", description: "Purchase grouped by HSN/SAC codes with tax breakup", icon: ClipboardList },
    ],
  },
  {
    id: "stock",
    title: "Item / Stock Reports",
    icon: Package,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800/40",
    reports: [
      { name: "Stock Summary", description: "Current stock levels, value and movement overview", icon: Package },
      { name: "Item Report", description: "All items with sale/purchase history and quantities", icon: FileText },
      { name: "Item wise Profit & Loss", description: "Profit margin analysis for each product/service", icon: TrendingUp },
      { name: "Low Stock Summary", description: "Items below minimum stock threshold – reorder alerts", icon: Package },
      { name: "Stock Detail Report", description: "Detailed stock-in / stock-out history per item", icon: ArrowUpDown },
      { name: "Item Rate List", description: "Complete price list of all products/services", icon: IndianRupee },
    ],
  },
  {
    id: "business",
    title: "Business Status",
    icon: BarChart3,
    color: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800/40",
    reports: [
      { name: "Profit & Loss Statement", description: "Complete revenue vs expenses breakdown over a period", icon: TrendingUp },
      { name: "Balance Sheet", description: "Assets, liabilities and equity snapshot of the business", icon: Landmark },
      { name: "Expense Report", description: "All business expenses categorized by type", icon: Wallet },
      { name: "Expense Category Report", description: "Spending breakdown across different expense categories", icon: PieIcon },
      { name: "Bank Statement", description: "Reconciled bank transaction history", icon: Landmark, premium: true },
    ],
  },
];

// ─── Report Action Handlers ─────────────────────────────────────────────
const handleAction = (reportName, action) => {
  toast.success(`${action} — ${reportName}`, {
    description: action === "View" 
      ? "Opening report view..." 
      : `${reportName}.${action === "PDF" ? "pdf" : "csv"} will download shortly.`,
  });

  setTimeout(() => {
    if (action === "View") {
      const dummyContent = `<html><head><title>${reportName}</title><style>body{font-family:sans-serif;padding:40px;}h2{color:#333;}table{border-collapse:collapse;width:100%;max-width:800px;margin-top:20px;}th,td{border:1px solid #ddd;padding:12px;text-align:left;}th{background-color:#f8f9fa;}</style></head><body><h2>${reportName}</h2><p>This is a simulated view for the selected report.</p><table><tr><th>Date</th><th>Description</th><th>Amount</th></tr><tr><td>2026-06-01</td><td>Sample Transaction 1</td><td>₹ 1,500.00</td></tr><tr><td>2026-06-02</td><td>Sample Transaction 2</td><td>₹ 3,250.00</td></tr></table></body></html>`;
      const blob = new Blob([dummyContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } else if (action === "PDF") {
      // Minimal valid PDF structure
      const pdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 50 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Mock PDF Report) Tj\nET\nendstream\nendobj\ntrailer\n<< /Root 1 0 R /Size 6 >>\n%%EOF`;
      const blob = new Blob([pdfContent], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (action === "Excel") {
      // Generate CSV which opens perfectly in Excel
      const csvContent = `Report,${reportName}\nDate,${new Date().toLocaleDateString()}\n\nDate,Description,Amount\n2026-06-01,Sample Transaction 1,1500\n2026-06-02,Sample Transaction 2,3250`;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportName.replace(/\s+/g, "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, 600);
};

// ─── Individual Report Row ──────────────────────────────────────────────
function ReportRow({ report, handleAction }) {
  const Icon = report.icon;
  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-muted/40 hover:shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 group-hover:bg-background transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-foreground truncate">{report.name}</p>
          {report.premium && (
            <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
          )}
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">{report.description}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[11px] rounded-lg hover:bg-primary/10 hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(report.name, "View");
          }}
          disabled={report.premium}
        >
          <Eye className="h-3 w-3 mr-1" /> View
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[11px] rounded-lg hover:bg-red-500/10 hover:text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(report.name, "PDF");
          }}
          disabled={report.premium}
        >
          <FileText className="h-3 w-3 mr-1" /> PDF
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-[11px] rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(report.name, "Excel");
          }}
          disabled={report.premium}
        >
          <FileSpreadsheet className="h-3 w-3 mr-1" /> Excel
        </Button>
      </div>
      {/* Mobile action buttons */}
      <div className="flex items-center gap-1 shrink-0 sm:hidden">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(report.name, "View");
          }}
          disabled={report.premium}
        >
          <Eye className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            handleAction(report.name, "PDF");
          }}
          disabled={report.premium}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Report Category Section ────────────────────────────────────────────
function ReportCategorySection({ category, isExpanded, onToggle, searchQuery, handleAction }) {
  const Icon = category.icon;

  const filteredReports = searchQuery
    ? category.reports.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : category.reports;

  if (searchQuery && filteredReports.length === 0) return null;

  return (
    <Card className={`border shadow-[var(--shadow-card)] transition-all duration-300 overflow-hidden ${category.borderColor}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${category.bgColor}`}>
          <Icon className={`h-5 w-5 ${category.color}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">{category.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <Badge variant="secondary" className="rounded-full text-[10px] font-bold mr-2">
          {filteredReports.length}
        </Badge>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
          <Separator className="mb-2" />
          {filteredReports.map((report) => (
            <ReportRow key={report.name} report={report} handleAction={handleAction} />
          ))}
        </div>
      )}
    </Card>
  );
}

// ─── Main Reports Dashboard ─────────────────────────────────────────────
export function ReportsDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({
    transaction: true,
    party: false,
    gst: false,
    stock: false,
    business: false,
  });
  const [showInsights, setShowInsights] = useState(false);
  const { invoices, refreshInvoices } = useInvoices();
  const [expenses, setExpenses] = useState([]);
  const [parties, setParties] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      refreshInvoices();
      
      try {
        const res = await api.get('/expenses');
        setExpenses(res.data || []);
      } catch (err) {
        console.error("Error loading expenses:", err);
      }

      try {
        const res = await api.get('/parties');
        setParties(res.data || []);
      } catch (err) {
        console.error("Error loading parties:", err);
      }

      try {
        const res = await api.get('/items');
        setItems(res.data || []);
      } catch (err) {
        console.error("Error loading items:", err);
      }

      setLoading(false);
    };
    loadData();
  }, []);

  const toggleCategory = (id) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    reportCategories.forEach((c) => (allExpanded[c.id] = true));
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed = {};
    reportCategories.forEach((c) => (allCollapsed[c.id] = false));
    setExpandedCategories(allCollapsed);
  };

  // Total reports count
  const totalReports = reportCategories.reduce((acc, c) => acc + c.reports.length, 0);

  // If searching, auto expand all categories
  const effectiveExpanded = searchQuery
    ? Object.fromEntries(reportCategories.map((c) => [c.id, true]))
    : expandedCategories;

  // Real data computations
  const salesVal = useMemo(() => {
    return invoices.filter(i => i.type === "Sale").reduce((sum, i) => sum + (i.grandTotal || i.amount || 0), 0);
  }, [invoices]);

  const purchaseVal = useMemo(() => {
    return invoices.filter(i => i.type === "Purchase").reduce((sum, i) => sum + (i.grandTotal || i.amount || 0), 0);
  }, [invoices]);

  const expensesVal = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const profitVal = useMemo(() => {
    return salesVal - purchaseVal - expensesVal;
  }, [salesVal, purchaseVal, expensesVal]);
  
  const gstPayableVal = useMemo(() => {
    const salesGst = invoices.filter(i => i.type === "Sale").reduce((sum, i) => sum + (i.gstAmount || 0), 0);
    const purchaseGst = invoices.filter(i => i.type === "Purchase").reduce((sum, i) => sum + (i.gstAmount || 0), 0);
    return Math.max(0, salesGst - purchaseGst);
  }, [invoices]);

  const dynamicMonthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last6 = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6.push({
        monthName: months[d.getMonth()],
        year: d.getFullYear(),
        sales: 0,
        expense: 0,
        profit: 0
      });
    }

    invoices.forEach(inv => {
      const invDate = new Date(inv.dateRaw || inv.date);
      const invMonthName = months[invDate.getMonth()];
      const invYear = invDate.getFullYear();
      const match = last6.find(l => l.monthName === invMonthName && l.year === invYear);
      if (match) {
        if (inv.type === "Sale") {
          match.sales += (inv.grandTotal || 0);
          match.profit += ((inv.grandTotal || 0) - (inv.taxableAmount || 0));
        } else if (inv.type === "Purchase") {
          match.expense += (inv.grandTotal || 0);
        }
      }
    });

    return last6.map(l => ({
      m: l.monthName,
      sales: l.sales,
      expense: l.expense,
      profit: l.sales - l.expense
    }));
  }, [invoices]);

  const dynamicGstSplit = useMemo(() => {
    let cgst = 0, sgst = 0, igst = 0;
    invoices.filter(i => i.type === "Sale").forEach(inv => {
      const amt = inv.gstAmount || 0;
      cgst += amt / 2;
      sgst += amt / 2;
    });

    return [
      { name: "CGST 9%", value: cgst },
      { name: "SGST 9%", value: sgst },
      { name: "IGST 18%", value: igst }
    ].filter(item => item.value > 0);
  }, [invoices]);

  const generateReportData = (reportName) => {
    let headers = [];
    let rows = [];
    const nameLower = reportName.toLowerCase();

    if (nameLower.includes("sale report") || nameLower.includes("gstr-1")) {
      headers = ["Date", "Invoice No", "Customer", "Taxable Value (₹)", "GST Amount (₹)", "Total (₹)", "Status"];
      rows = invoices.filter(i => i.type === "Sale").map(i => [
        new Date(i.date).toLocaleDateString("en-IN"),
        i.invoiceNumber,
        i.partyName,
        i.taxableAmount,
        i.gstAmount,
        i.grandTotal,
        i.status
      ]);
    } 
    else if (nameLower.includes("purchase report") || nameLower.includes("gstr-2")) {
      headers = ["Date", "Purchase No", "Supplier", "Taxable Value (₹)", "GST Amount (₹)", "Total (₹)", "Status"];
      rows = invoices.filter(i => i.type === "Purchase").map(i => [
        new Date(i.date).toLocaleDateString("en-IN"),
        i.invoiceNumber,
        i.partyName,
        i.taxableAmount,
        i.gstAmount,
        i.grandTotal,
        i.status
      ]);
    } 
    else if (nameLower.includes("day book")) {
      headers = ["Date", "Type / Voucher No", "Party", "Taxable (₹)", "GST (₹)", "Total (₹)"];
      const allTxns = [
        ...invoices.map(i => ({ date: i.date, type: `${i.type} / ${i.invoiceNumber}`, party: i.partyName, taxable: i.taxableAmount, gst: i.gstAmount, total: i.grandTotal })),
        ...expenses.map(e => ({ date: e.date, type: `Expense / ${e.category || "General"}`, party: "N/A", taxable: e.amount, gst: 0, total: e.amount }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      rows = allTxns.map(t => [
        new Date(t.date).toLocaleDateString("en-IN"),
        t.type,
        t.party,
        t.taxable,
        t.gst,
        t.total
      ]);
    } 
    else if (nameLower.includes("cash flow")) {
      headers = ["Date", "Description", "Inflow (₹)", "Outflow (₹)"];
      rows = [
        ...invoices.filter(i => i.type === "Sale").map(i => [new Date(i.date).toLocaleDateString("en-IN"), `Sale Invoice ${i.invoiceNumber}`, i.receivedAmount || i.grandTotal, 0]),
        ...invoices.filter(i => i.type === "Purchase").map(i => [new Date(i.date).toLocaleDateString("en-IN"), `Purchase Bill ${i.invoiceNumber}`, 0, i.grandTotal]),
        ...expenses.map(e => [new Date(e.date).toLocaleDateString("en-IN"), `Expense: ${e.title || "General"}`, 0, e.amount])
      ];
    } 
    else if (nameLower.includes("all parties")) {
      headers = ["Party Name", "Type", "Mobile", "GSTIN", "Opening Balance (₹)"];
      rows = parties.map(p => [
        p.name,
        p.type || "Customer",
        p.phone || "N/A",
        p.gstin || "N/A",
        p.openingBalance || 0
      ]);
    } 
    else if (nameLower.includes("stock summary") || nameLower.includes("low stock")) {
      headers = ["Item Name", "HSN/SAC", "Sale Price (₹)", "Purchase Price (₹)", "Stock Quantity", "Min Threshold"];
      let stockItems = items;
      if (nameLower.includes("low stock")) {
        stockItems = items.filter(item => (item.stock || 0) <= (item.minStock || 5));
      }
      rows = stockItems.map(item => [
        item.name,
        item.hsnSac || "N/A",
        item.salePrice || 0,
        item.purchasePrice || 0,
        item.stock || 0,
        item.minStock || 5
      ]);
    } 
    else if (nameLower.includes("expense report")) {
      headers = ["Date", "Expense Category", "Title / Description", "Amount (₹)"];
      rows = expenses.map(e => [
        new Date(e.date).toLocaleDateString("en-IN"),
        e.category || "General",
        e.title || "",
        e.amount
      ]);
    } 
    else {
      headers = ["Date", "Description", "Amount (₹)"];
      rows = invoices.map(i => [
        new Date(i.date).toLocaleDateString("en-IN"),
        `${i.type} Invoice ${i.invoiceNumber}`,
        i.grandTotal
      ]);
    }
    return { headers, rows };
  };

  const handleAction = (reportName, action) => {
    toast.success(`${action} — ${reportName}`, {
      description: `Generating live report data...`,
    });

    const { headers, rows } = generateReportData(reportName);

    if (action === "View") {
      const tableHeaders = headers.map(h => `<th>${h}</th>`).join("");
      const tableRows = rows.map(r => `<tr>${r.map(val => `<td>${val}</td>`).join("")}</tr>`).join("");
      
      const htmlContent = `
        <html>
        <head>
          <title>${reportName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; background-color: #f8fafc; color: #1e293b; }
            h2 { color: #0f172a; font-weight: 800; margin-bottom: 5px; }
            p.subtitle { color: #64748b; font-size: 13px; margin-bottom: 25px; }
            table { border-collapse: collapse; width: 100%; max-width: 1000px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #f1f5f9; }
            th { background-color: #f8fafc; font-weight: 700; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; }
            td { font-size: 13px; color: #334155; }
            tr:last-child td { border-bottom: none; }
            tr:hover td { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <h2>${reportName}</h2>
          <p class="subtitle">Generated dynamically from live database records on ${new Date().toLocaleString('en-IN')}</p>
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows.length > 0 ? tableRows : `<tr><td colspan="${headers.length}" style="text-align: center; color: #94a3b8; padding: 40px 0;">No records found in database</td></tr>`}</tbody>
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } 
    else if (action === "Excel") {
      const csvContent = [
        `Report: ${reportName}`,
        `Generated: ${new Date().toLocaleString('en-IN')}`,
        "",
        headers.join(","),
        ...rows.map(r => r.map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportName.replace(/\s+/g, "_")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } 
    else if (action === "PDF") {
      const tableHeaders = headers.map(h => `<th>${h}</th>`).join("");
      const tableRows = rows.map(r => `<tr>${r.map(val => `<td>${val}</td>`).join("")}</tr>`).join("");
      
      const htmlContent = `
        <html>
        <head>
          <title>${reportName}</title>
          <style>
            body { font-family: system-ui; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 12px; }
            th { background-color: #f1f5f9; }
          </style>
        </head>
        <body>
          <h2 style="margin-bottom:0;">${reportName}</h2>
          <p style="font-size:10px; color:#64748b; margin-top:2px;">Live database compilation - ${new Date().toLocaleDateString('en-IN')}</p>
          <hr />
          <table>
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows.length > 0 ? tableRows : `<tr><td colspan="${headers.length}" style="text-align: center;">No records</td></tr>`}</tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `;
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Report aggregates...</div>;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Reports"
        subtitle={`${totalReports} reports across ${reportCategories.length} categories — Generate, view & export`}
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-xl text-xs"
              onClick={() => setShowInsights(!showInsights)}
            >
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
              {showInsights ? "Hide" : "Show"} Quick Insights
            </Button>
            <Button className="rounded-xl text-xs" onClick={expandAll}>
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              Expand All
            </Button>
          </>
        }
      />

      {/* ── Summary Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 animate-in fade-in duration-200">
        {[
          { label: "Sales Report", value: fmt(salesVal), icon: TrendingUp, tint: "bg-primary-soft text-primary", trend: "Live Sales" },
          { label: "Purchase Report", value: fmt(purchaseVal), icon: ShoppingCart, tint: "bg-blue-50 text-blue-600", trend: "Live Purchases" },
          { label: "Profit / Loss", value: fmt(profitVal), icon: Receipt, tint: "bg-success-soft text-success", trend: "Live P&L" },
          { label: "GST Payable", value: fmt(gstPayableVal), icon: PieIcon, tint: "bg-accent-soft text-accent-foreground", trend: "Live Offset Balance" },
        ].map((r) => (
          <Card key={r.label} className="border-0 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${r.tint}`}>
                  <r.icon className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="rounded-full text-[10px]">{r.trend}</Badge>
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{r.label}</p>
              <p className="mt-1 text-lg sm:text-2xl font-bold">{r.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Search & Filter Bar ────────────────────────────────────── */}
      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="py-3 px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports... (e.g. GSTR, stock, profit)"
                className="pl-9 h-10 rounded-xl text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg text-xs text-muted-foreground"
                onClick={collapseAll}
              >
                Collapse All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg text-xs text-muted-foreground"
                onClick={expandAll}
              >
                Expand All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Report Categories ──────────────────────────────────────── */}
      <div className="space-y-4">
        {reportCategories.map((category) => (
          <ReportCategorySection
            key={category.id}
            category={category}
            isExpanded={effectiveExpanded[category.id]}
            onToggle={() => toggleCategory(category.id)}
            searchQuery={searchQuery}
            handleAction={handleAction}
          />
        ))}
      </div>

      {/* ── Quick Insights (collapsible charts) ────────────────────── */}
      {showInsights && (
        <div className="space-y-4 animate-in slide-in-from-top-3 duration-300">
          <Separator />
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Quick Insights</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Profit Trend</CardTitle>
                <p className="text-xs text-muted-foreground">Last 6 months</p>
              </CardHeader>
              <CardContent>
                {dynamicMonthlyData.every(d => d.sales === 0 && d.expense === 0) ? (
                  <div className="h-[300px] flex items-center justify-center text-xs text-muted-foreground">No monthly stats available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dynamicMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => fmt(v)} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="expense" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="profit" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-[var(--shadow-card)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">GST Breakdown</CardTitle>
                <p className="text-xs text-muted-foreground">Current quarter</p>
              </CardHeader>
              <CardContent>
                {dynamicGstSplit.length === 0 ? (
                  <div className="h-[240px] flex items-center justify-center text-xs text-muted-foreground">No GST records.</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie data={dynamicGstSplit} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                          {dynamicGstSplit.map((_, i) => (
                            <Cell key={i} fill={pieColors[i % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => fmt(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-1.5">
                      {dynamicGstSplit.map((g, i) => (
                        <div key={g.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: pieColors[i % pieColors.length] }} />
                            <span className="font-medium">{g.name}</span>
                          </div>
                          <span className="font-semibold">{fmt(g.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-[var(--shadow-card)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sales vs Expenses by Month</CardTitle>
            </CardHeader>
            <CardContent>
              {dynamicMonthlyData.every(d => d.sales === 0 && d.expense === 0) ? (
                <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">No comparative stats available.</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dynamicMonthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                    <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => fmt(v)} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="sales" fill="var(--color-primary)" radius={[8, 8, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="expense" fill="var(--color-accent)" radius={[8, 8, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
