import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Download, FileText, TrendingUp, Receipt, PieChart as PieIcon } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — LedgerLite" },
      { name: "description", content: "Sales, profit/loss and GST reports with export." },
    ],
  }),
  component: Reports,
});

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

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

function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Insights into sales, profit and GST liability"
        actions={
          <>
            <Button variant="outline" className="rounded-xl">
              <FileText className="mr-1 h-4 w-4" /> PDF
            </Button>
            <Button className="rounded-xl">
              <Download className="mr-1 h-4 w-4" /> Export Excel
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Sales Report", value: fmt(1426000), icon: TrendingUp, tint: "bg-primary-soft text-primary", trend: "+18% YoY" },
          { label: "Profit / Loss", value: fmt(867000), icon: Receipt, tint: "bg-success-soft text-success", trend: "Margin 60.8%" },
          { label: "GST Payable", value: fmt(76760), icon: PieIcon, tint: "bg-accent-soft text-accent-foreground", trend: "Q4 FY26" },
        ].map((r) => (
          <Card key={r.label} className="border-0 shadow-[var(--shadow-card)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${r.tint}`}>
                  <r.icon className="h-5 w-5" />
                </div>
                <Badge variant="secondary" className="rounded-full text-[10px]">{r.trend}</Badge>
              </div>
              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">{r.label}</p>
              <p className="mt-1 text-2xl font-bold">{r.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Profit Trend</CardTitle>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => fmt(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" stroke="var(--color-accent)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="profit" stroke="var(--color-chart-2)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">GST Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground">Current quarter</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={gstSplit} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {gstSplit.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 space-y-1.5">
              {gstSplit.map((g, i) => (
                <div key={g.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: pieColors[i] }} />
                    <span className="font-medium">{g.name}</span>
                  </div>
                  <span className="font-semibold">{fmt(g.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sales vs Expenses by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="m" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="sales" fill="var(--color-primary)" radius={[8, 8, 0, 0]} maxBarSize={28} />
              <Bar dataKey="expense" fill="var(--color-accent)" radius={[8, 8, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
