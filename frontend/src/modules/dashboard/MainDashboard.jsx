import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ReceiptText,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { NewInvoiceDialog } from "@/components/NewInvoiceDialog";

const salesData = [
  { d: "Mon", sales: 18400, expense: 7200 },
  { d: "Tue", sales: 22100, expense: 8400 },
  { d: "Wed", sales: 19800, expense: 6900 },
  { d: "Thu", sales: 28600, expense: 9100 },
  { d: "Fri", sales: 31200, expense: 10400 },
  { d: "Sat", sales: 38900, expense: 11800 },
  { d: "Sun", sales: 26400, expense: 8800 },
];

const topProducts = [
  { name: "Basmati Rice 5kg", sold: 142, revenue: 56800, stock: 78 },
  { name: "Sunflower Oil 1L", sold: 118, revenue: 21240, stock: 32 },
  { name: "Toor Dal 1kg", sold: 96, revenue: 14400, stock: 12 },
  { name: "Tata Salt 1kg", sold: 87, revenue: 2175, stock: 156 },
  { name: "Atta 10kg", sold: 64, revenue: 32000, stock: 8 },
];

const pending = [
  { name: "Anil Sweets", amount: 24500, days: 12, status: "overdue" },
  { name: "Sharma Kirana", amount: 12800, days: 5, status: "due" },
  { name: "Green Mart", amount: 8400, days: 2, status: "due" },
  { name: "Patel Stores", amount: 36200, days: 21, status: "overdue" },
];

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

function Kpi({
  label,
  value,
  delta,
  up,
  icon: Icon,
  tint,
}) {
  return (
    <Card className="overflow-hidden border-0 shadow-[var(--shadow-card)]">
      <CardContent className="p-3 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground truncate">
              {label}
            </p>
            <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight truncate">{value}</p>
            <div className="mt-1 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs">
              {up ? (
                <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-success" />
              ) : (
                <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-destructive" />
              )}
              <span className={up ? "font-semibold text-success" : "font-semibold text-destructive"}>
                {delta}
              </span>
              <span className="hidden sm:inline text-muted-foreground">vs last week</span>
            </div>
          </div>
          <div className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${tint}`}>
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MainDashboard() {
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Good morning, Rahul 👋"
        subtitle="Here's what's happening at Sharma Traders today."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">
              <Download className="mr-1 h-4 w-4" /> Export
            </Button>
            <Button className="rounded-xl" onClick={() => setIsNewInvoiceOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> New Invoice
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Kpi label="Total Sales" value={fmt(185400)} delta="+12.4%" up icon={IndianRupee} tint="bg-primary-soft text-primary" />
        <Kpi label="Invoices" value="248" delta="+8.1%" up icon={ReceiptText} tint="bg-accent-soft text-accent" />
        <Kpi label="Expenses" value={fmt(62600)} delta="-3.2%" up={false} icon={Wallet} tint="bg-secondary text-secondary-foreground" />
        <Kpi label="Net Profit" value={fmt(122800)} delta="+18.6%" up icon={PiggyBank} tint="bg-success-soft text-success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Sales vs Expenses</CardTitle>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
            <Badge variant="secondary" className="gap-1 rounded-full">
              <TrendingUp className="h-3 w-3 text-success" /> +12.4%
            </Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="d" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v) => fmt(v)}
                />
                <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#gSales)" />
                <Area type="monotone" dataKey="expense" stroke="var(--color-accent)" strokeWidth={2.5} fill="url(#gExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cash Flow</CardTitle>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl bg-gradient-to-br from-primary to-[oklch(0.55_0.18_150)] p-4 text-primary-foreground shadow-[var(--shadow-glow)]">
              <p className="text-xs opacity-80">Available balance</p>
              <p className="mt-1 text-3xl font-bold tracking-tight">{fmt(348920)}</p>
              <div className="mt-3 flex gap-4 text-xs">
                <div>
                  <p className="opacity-75">Inflow</p>
                  <p className="font-semibold">{fmt(412300)}</p>
                </div>
                <div>
                  <p className="opacity-75">Outflow</p>
                  <p className="font-semibold">{fmt(63380)}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Receivables</span>
                <span className="font-semibold">{fmt(184500)}</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Payables</span>
                <span className="font-semibold">{fmt(48200)}</span>
              </div>
              <Progress value={28} className="h-2 [&>div]:bg-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Top Products</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {topProducts.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-secondary"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sold} sold · {p.stock} in stock</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{fmt(p.revenue)}</p>
                    {p.stock < 20 && (
                      <Badge variant="outline" className="mt-0.5 border-destructive/30 bg-destructive/10 text-[10px] text-destructive">
                        Low stock
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Pending Payments</CardTitle>
              <p className="text-xs text-muted-foreground">{fmt(81900)} total due</p>
            </div>
            <TrendingDown className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.map((c) => (
              <div key={c.name} className="flex items-center gap-3 rounded-xl border p-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-secondary text-xs font-semibold">
                    {c.name.split(" ").map((s) => s[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.days} days {c.status === "overdue" ? "overdue" : "to due"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{fmt(c.amount)}</p>
                  <Badge
                    variant="outline"
                    className={
                      c.status === "overdue"
                        ? "border-destructive/30 bg-destructive/10 text-[10px] text-destructive"
                        : "border-accent/30 bg-accent-soft text-[10px] text-accent-foreground"
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Revenue</CardTitle>
          <p className="text-xs text-muted-foreground">Compare revenue across the last 6 months</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[
              { m: "May", r: 184000 },
              { m: "Jun", r: 212000 },
              { m: "Jul", r: 198000 },
              { m: "Aug", r: 246000 },
              { m: "Sep", r: 274000 },
              { m: "Oct", r: 312000 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} formatter={(v) => fmt(v)} />
              <Bar dataKey="r" fill="var(--color-primary)" radius={[8, 8, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <NewInvoiceDialog open={isNewInvoiceOpen} onOpenChange={setIsNewInvoiceOpen} />
    </div>
  );
}
