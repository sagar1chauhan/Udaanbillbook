import React, { useState } from "react";
import { 
  Calculator, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Building2, 
  History,
  FileText,
  Download,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { CashInOutDialog } from "@/components/EntityDialogs";
import { toast } from "sonner";

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

const INITIAL_ENTRIES = [
  { desc: "Sales Invoice #INV-204", date: "Today, 2:30 PM", amount: 4500, type: "IN", party: "Anil Sweets", mode: "Cash" },
  { desc: "Purchase Invoice #PUR-45", date: "Today, 11:15 AM", amount: 12000, type: "OUT", party: "Global Traders", mode: "Bank" },
  { desc: "Electricity Bill", date: "Yesterday", amount: 2400, type: "OUT", party: "MSEB", mode: "Cash" },
  { desc: "Payment Received", date: "Yesterday", amount: 18000, type: "IN", party: "Patel Stores", mode: "UPI" },
  { desc: "Rent Payment", date: "01 May 2024", amount: 15000, type: "OUT", party: "Owner Name", mode: "Bank" },
];

export function AccountingDashboard() {
  const [entries, setEntries] = useState(INITIAL_ENTRIES);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Accounting & Ledger"
        subtitle="Manage your cash, bank accounts and financial statements."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => toast.success("Statement export started")}>
              <Download className="mr-2 h-4 w-4" /> Download Statement
            </Button>
            <Button className="rounded-xl" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Cash In/Out
            </Button>
          </div>
        }
      />

      <CashInOutDialog 
        open={open} 
        onOpenChange={setOpen} 
        onAdd={(newEntry) => setEntries([newEntry, ...entries])} 
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Card className="border-0 shadow-sm bg-primary text-primary-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase opacity-80">Total Cash In Hand</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(45600 + entries.filter(e => e.type === 'IN' && e.mode === 'Cash').reduce((a,b) => a+b.amount, 0) - entries.filter(e => e.type === 'OUT' && e.mode === 'Cash').reduce((a,b) => a+b.amount, 0))}</div>
            <p className="text-[11px] opacity-70 mt-1 flex items-center gap-1">
              <ArrowUpCircle className="h-3 w-3" /> +₹2,400 today
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-accent text-accent-foreground transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase opacity-80">Total Bank Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(1248500)}</div>
            <p className="text-[11px] opacity-70 mt-1">Across 3 bank accounts</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Total Receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{fmt(84200)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Pending from 14 parties</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Total Payables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{fmt(32800)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">To be paid to 6 suppliers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ledgers" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="ledgers" className="rounded-lg">Ledgers</TabsTrigger>
          <TabsTrigger value="statements" className="rounded-lg">Statements</TabsTrigger>
          <TabsTrigger value="bank" className="rounded-lg">Bank A/C</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ledgers" className="mt-6">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-base">Recent Ledger Entries</CardTitle>
                <CardDescription>Track every rupee in and out of your business.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <History className="h-3.5 w-3.5" /> View Full History
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {entries.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/30 transition-colors">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.type === 'IN' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {item.type === 'IN' ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.desc}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{item.date}</span>
                        <span>•</span>
                        <span className="font-medium">{item.party}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${item.type === 'IN' ? 'text-success' : 'text-destructive'}`}>
                        {item.type === 'IN' ? '+' : '-'}{fmt(item.amount)}
                      </p>
                      <Badge variant="outline" className="text-[10px] h-4 font-normal mt-0.5">
                        {item.mode}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements" className="mt-6">
           <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Profit & Loss Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm">Total Revenue</span>
                      <span className="font-bold text-success">{fmt(185400)}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm">Cost of Goods Sold</span>
                      <span className="font-bold text-destructive">{fmt(112000)}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm">Gross Profit</span>
                      <span className="font-bold text-primary">{fmt(73400)}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm">Operating Expenses</span>
                      <span className="font-bold text-destructive">{fmt(24600)}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 pt-4">
                      <span className="font-bold">Net Profit</span>
                      <span className="text-xl font-black text-success">{fmt(48800)}</span>
                   </div>
                   <Button className="w-full rounded-xl mt-2">View Detailed P&L</Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-accent" /> Balance Sheet Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm font-semibold">Total Assets</span>
                      <span className="font-bold">{fmt(2450000)}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b pl-4 text-muted-foreground">
                      <span className="text-xs">Current Assets</span>
                      <span className="text-sm">{fmt(1250000)}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b pl-4 text-muted-foreground">
                      <span className="text-xs">Fixed Assets</span>
                      <span className="text-sm">{fmt(1200000)}</span>
                   </div>
                   <div className="flex items-center justify-between py-2 border-b mt-2">
                      <span className="text-sm font-semibold">Total Liabilities</span>
                      <span className="font-bold text-destructive">{fmt(482000)}</span>
                   </div>
                   <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-semibold">Equity</span>
                      <span className="font-bold text-primary">{fmt(1968000)}</span>
                   </div>
                   <Button variant="outline" className="w-full rounded-xl mt-2">Generate Full Report</Button>
                </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="bank" className="mt-6">
           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              {[
                { name: "HDFC Bank - 4521", type: "Savings", balance: 845200, icon: Building2 },
                { name: "ICICI Bank - 8812", type: "Current", balance: 342100, icon: Building2 },
                { name: "SBI Bank - 1024", type: "Savings", balance: 61200, icon: Building2 },
              ].map((bank, i) => (
                <Card key={i} className="border-0 shadow-sm border-l-4 border-l-primary transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                   <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-lg bg-secondary">
                        <bank.icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="secondary" className="rounded-full text-[10px] font-normal">
                        {bank.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold truncate">{bank.name}</p>
                    <p className="mt-1 text-2xl font-black text-foreground">{fmt(bank.balance)}</p>
                    <div className="mt-4 flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1 text-xs h-8 rounded-lg border">Statement</Button>
                      <Button variant="ghost" size="sm" className="flex-1 text-xs h-8 rounded-lg border">Transfer</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="h-full border-dashed border-2 rounded-xl flex flex-col gap-2 min-h-[160px]">
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Add Bank Account</span>
              </Button>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
