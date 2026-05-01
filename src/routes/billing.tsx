import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Billing & Invoices — LedgerLite" },
      { name: "description", content: "Create GST invoices, share via WhatsApp and track payments in seconds." },
    ],
  }),
  component: Billing,
});

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

const invoices = [
  { id: "INV-2041", party: "Anil Sweets", date: "28 Apr 2026", amount: 24500, status: "Unpaid" },
  { id: "INV-2040", party: "Sharma Kirana", date: "27 Apr 2026", amount: 12800, status: "Partial" },
  { id: "INV-2039", party: "Green Mart", date: "26 Apr 2026", amount: 8400, status: "Paid" },
  { id: "INV-2038", party: "Patel Stores", date: "25 Apr 2026", amount: 36200, status: "Unpaid" },
  { id: "INV-2037", party: "Mehta Foods", date: "24 Apr 2026", amount: 18900, status: "Paid" },
  { id: "INV-2036", party: "Modern Bakery", date: "23 Apr 2026", amount: 5400, status: "Paid" },
  { id: "INV-2035", party: "Ravi General Store", date: "22 Apr 2026", amount: 14200, status: "Partial" },
];

const statusStyles: Record<string, string> = {
  Paid: "bg-success-soft text-success border-success/20",
  Unpaid: "bg-destructive/10 text-destructive border-destructive/20",
  Partial: "bg-accent-soft text-accent-foreground border-accent/20",
};

function Billing() {
  const [tab, setTab] = useState("all");
  const filtered = tab === "all" ? invoices : invoices.filter((i) => i.status.toLowerCase() === tab);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
        subtitle="248 invoices · ₹4,82,300 collected this month"
        actions={
          <>
            <Button variant="outline" className="rounded-xl">
              <FileDown className="mr-1 h-4 w-4" /> Export
            </Button>
            <Button className="rounded-xl" onClick={() => toast.success("New invoice draft created")}>
              <Plus className="mr-1 h-4 w-4" /> New Invoice
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Invoices", value: "248", tint: "bg-primary-soft text-primary" },
          { label: "Paid", value: fmt(310400), tint: "bg-success-soft text-success" },
          { label: "Unpaid", value: fmt(81900), tint: "bg-destructive/10 text-destructive" },
          { label: "Partially Paid", value: fmt(42600), tint: "bg-accent-soft text-accent-foreground" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-[var(--shadow-card)]">
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
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="rounded-xl">
                <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                <TabsTrigger value="paid" className="rounded-lg">Paid</TabsTrigger>
                <TabsTrigger value="unpaid" className="rounded-lg">Unpaid</TabsTrigger>
                <TabsTrigger value="partial" className="rounded-lg">Partial</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search invoice…" className="h-10 rounded-xl pl-9 sm:w-64" />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead>Invoice</TableHead>
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
                          <DropdownMenuItem onClick={() => toast.success("Downloaded PDF")}>
                            <FileDown className="mr-2 h-4 w-4" /> Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Shared on WhatsApp")}>
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
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl">
              <Share2 className="mr-1 h-4 w-4" /> Share via WhatsApp
            </Button>
            <Button className="rounded-xl">
              <Plus className="mr-1 h-4 w-4" /> Create Invoice
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
