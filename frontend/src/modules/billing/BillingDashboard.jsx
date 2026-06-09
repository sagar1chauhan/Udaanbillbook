import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  Plus, Search, FileDown, Share2, MoreHorizontal, Filter, ReceiptText,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useMockAuth } from "@/lib/auth-store";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { useInvoices } from "@/contexts/InvoiceContext";

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

const statusStyles = {
  Paid: "bg-success-soft text-success border-success/20",
  Unpaid: "bg-destructive/10 text-destructive border-destructive/20",
  Partial: "bg-accent-soft text-accent-foreground border-accent/20",
};

export function BillingDashboard() {
  const { user } = useMockAuth();
  const isViewer = user?.role === "Viewer";
  const { invoices } = useInvoices();

  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? invoices : invoices.filter((i) => i.status.toLowerCase() === tab);

  const downloadOne = (inv) => {
    downloadInvoicePdf({
      number: inv.id,
      date: inv.date,
      business: {
        name: "Sharma Traders",
        address: "Shop 12, MG Road, Indore, MP 452001",
        gstin: "23ABCDE1234F1Z5",
        phone: "+91 98765 43210",
      },
      party: { name: inv.party },
      lines: [
        { name: "Items as per challan", qty: 1, rate: inv.amount / 1.18, gst: 18 },
      ],
    });
    toast.success(`${inv.id} downloaded`);
  };

  const shareWA = (inv) => {
    const msg = encodeURIComponent(
      `Hi ${inv.party}, your invoice ${inv.id} of ₹${inv.amount.toLocaleString("en-IN")} is ready.`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
        subtitle="248 invoices · ₹4,82,300 collected this month"
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={() => toast.success("Exporting invoices…")}>
              <FileDown className="mr-1 h-4 w-4" /> Export
            </Button>
            {!isViewer && (
              <>
                <Button asChild className="rounded-xl bg-red-500 hover:bg-red-600">
                  <Link to="/sale/new">
                    <Plus className="mr-1 h-4 w-4" /> Sale
                  </Link>
                </Button>
                <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700">
                  <Link to="/purchase/new">
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
          { label: "Total Invoices", value: "248", tint: "bg-primary-soft text-primary" },
          { label: "Paid", value: fmt(310400), tint: "bg-success-soft text-success" },
          { label: "Unpaid", value: fmt(81900), tint: "bg-destructive/10 text-destructive" },
          { label: "Partially Paid", value: fmt(42600), tint: "bg-accent-soft text-accent-foreground" },
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
              <div className="relative flex-1 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search invoice…" className="h-10 w-full rounded-xl pl-9 sm:w-64" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl sm:hidden">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem onClick={() => setTab("all")} className="cursor-pointer">All</DropdownMenuItem>
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
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow key={inv.id} className="border-b last:border-0">
                    <TableCell className="font-semibold">{inv.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={inv.type === 'Sale' ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'}>
                        {inv.type || 'Sale'}
                      </Badge>
                    </TableCell>
                    <TableCell>{inv.party}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{inv.date}</TableCell>
                    <TableCell className="text-right font-semibold">{fmt(inv.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full ${statusStyles[inv.status]}`}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => downloadOne(inv)}>
                            <FileDown className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => shareWA(inv)}>
                            <Share2 className="mr-2 h-4 w-4" /> Share via WhatsApp
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                  <Link to="/sale/new">
                    <Plus className="mr-1 h-4 w-4" /> Sale
                  </Link>
                </Button>
                <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700">
                  <Link to="/purchase/new">
                    <Plus className="mr-1 h-4 w-4" /> Purchase
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
