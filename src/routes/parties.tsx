import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Phone, MessageCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/parties")({
  head: () => ({
    meta: [
      { title: "Parties — LedgerLite" },
      { name: "description", content: "Manage customers and suppliers with khata-style ledgers." },
    ],
  }),
  component: Parties,
});

const fmt = (n: number) => "₹" + Math.abs(n).toLocaleString("en-IN");

const parties = [
  { name: "Anil Sweets", type: "Customer", phone: "+91 98xxxx 4521", balance: 24500 },
  { name: "Patel Stores", type: "Customer", phone: "+91 98xxxx 7821", balance: 36200 },
  { name: "Sharma Kirana", type: "Customer", phone: "+91 98xxxx 6611", balance: 12800 },
  { name: "Green Mart", type: "Customer", phone: "+91 98xxxx 9032", balance: -4200 },
  { name: "FreshFarm Supplies", type: "Supplier", phone: "+91 98xxxx 1144", balance: -22000 },
  { name: "Mehta Foods", type: "Customer", phone: "+91 98xxxx 7456", balance: 18900 },
  { name: "Ravi General Store", type: "Customer", phone: "+91 98xxxx 5510", balance: 14200 },
  { name: "City Wholesale", type: "Supplier", phone: "+91 98xxxx 8800", balance: -48700 },
];

function Parties() {
  const totalReceivable = parties.filter((p) => p.balance > 0).reduce((s, p) => s + p.balance, 0);
  const totalPayable = parties.filter((p) => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parties"
        subtitle={`${parties.length} customers & suppliers · digital khata`}
        actions={
          <Button className="rounded-xl">
            <Plus className="mr-1 h-4 w-4" /> Add Party
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-0 bg-gradient-to-br from-success-soft to-card shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">You'll Receive</p>
            <p className="mt-1 text-3xl font-bold text-success">{fmt(totalReceivable)}</p>
            <p className="mt-1 text-xs text-muted-foreground">From {parties.filter((p) => p.balance > 0).length} parties</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-accent-soft to-card shadow-[var(--shadow-card)]">
          <CardContent className="p-5">
            <p className="text-xs font-medium text-muted-foreground">You'll Pay</p>
            <p className="mt-1 text-3xl font-bold text-accent-foreground">{fmt(totalPayable)}</p>
            <p className="mt-1 text-xs text-muted-foreground">To {parties.filter((p) => p.balance < 0).length} suppliers</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs defaultValue="all">
              <TabsList className="rounded-xl">
                <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                <TabsTrigger value="cust" className="rounded-lg">Customers</TabsTrigger>
                <TabsTrigger value="supp" className="rounded-lg">Suppliers</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search party…" className="h-10 rounded-xl pl-9 sm:w-64" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {parties.map((p) => {
              const credit = p.balance >= 0;
              return (
                <div key={p.name} className="flex items-center gap-3 rounded-2xl border bg-card p-3 transition-shadow hover:shadow-[var(--shadow-card)]">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback className="bg-primary-soft text-sm font-semibold text-primary">
                      {p.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <Badge variant="secondary" className="rounded-full text-[10px]">{p.type}</Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{p.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${credit ? "text-success" : "text-destructive"}`}>
                      {credit ? "+" : "-"}{fmt(p.balance)}
                    </p>
                    <div className="mt-1 flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toast.success(`Reminder sent to ${p.name}`)}>
                        <MessageCircle className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7">
                        <BookOpen className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
