import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Fuel, Truck, Zap, Wifi, ShoppingBag, Users } from "lucide-react";
import { toast } from "sonner";

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

const expenses = [
  { name: "Diesel - Delivery Van", cat: "Fuel", icon: Fuel, amount: 4200, date: "28 Apr" },
  { name: "Shop Electricity Bill", cat: "Utilities", icon: Zap, amount: 6800, date: "27 Apr" },
  { name: "Transport - Wholesale Pickup", cat: "Logistics", icon: Truck, amount: 3500, date: "26 Apr" },
  { name: "Internet & Phone", cat: "Utilities", icon: Wifi, amount: 1200, date: "25 Apr" },
  { name: "Packaging Material", cat: "Supplies", icon: ShoppingBag, amount: 2400, date: "24 Apr" },
  { name: "Staff Salary - Apr", cat: "Payroll", icon: Users, amount: 28000, date: "23 Apr" },
];

const catColors = {
  Fuel: "bg-accent-soft text-accent-foreground",
  Utilities: "bg-primary-soft text-primary",
  Logistics: "bg-secondary text-secondary-foreground",
  Supplies: "bg-success-soft text-success",
  Payroll: "bg-destructive/10 text-destructive",
};

export function ExpensesDashboard() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle={`${fmt(total)} spent this month across ${expenses.length} entries`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Expense recorded");
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="e.g. Diesel for van" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amt">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                  <Input id="amt" type="number" placeholder="0" className="h-10 rounded-xl pl-7" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select defaultValue="Fuel">
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(catColors).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" className="h-10 rounded-xl" />
              </div>
              <Button type="submit" className="w-full rounded-xl">
                <Plus className="mr-1 h-4 w-4" /> Save Expense
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Expenses</CardTitle>
            <Badge variant="secondary" className="rounded-full">This month</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenses.map((e, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-all duration-200 hover:translate-x-1 hover:shadow-sm">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${catColors[e.cat]}`}>
                  <e.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.cat} · {e.date}</p>
                </div>
                <p className="text-sm font-bold">-{fmt(e.amount)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
