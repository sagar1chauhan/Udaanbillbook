import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, Upload, Boxes, AlertTriangle, ScanLine } from "lucide-react";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — LedgerLite" },
      { name: "description", content: "Track stock, low-stock alerts and product categories." },
    ],
  }),
  component: Inventory;
});

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

const products = [
  { name: "Basmati Rice 5kg", sku: "RCE-005", cat: "Grocery", price: 480, stock: 78, min: 20 },
  { name: "Sunflower Oil 1L", sku: "OIL-001", cat: "Grocery", price: 180, stock: 32, min: 25 },
  { name: "Toor Dal 1kg", sku: "DAL-001", cat: "Grocery", price: 150, stock: 12, min: 20 },
  { name: "Tata Salt 1kg", sku: "SLT-001", cat: "Grocery", price: 25, stock: 156, min: 50 },
  { name: "Atta 10kg", sku: "ATA-010", cat: "Grocery", price: 500, stock: 8, min: 15 },
  { name: "Britannia Bread", sku: "BRD-001", cat: "Bakery", price: 45, stock: 28, min: 20 },
  { name: "Amul Butter 500g", sku: "BTR-500", cat: "Dairy", price: 290, stock: 18, min: 12 },
  { name: "Kissan Jam 700g", sku: "JAM-700", cat: "Packaged", price: 220, stock: 22, min: 10 },
];

function Inventory() {
  const [cat, setCat] = useState("all");
  const cats = ["all", "Grocery", "Bakery", "Dairy", "Packaged"];
  const filtered = cat === "all" ? products : products.filter((p) => p.cat === cat);
  const lowCount = products.filter((p) => p.stock < p.min).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle={`${products.length} products · ${lowCount} need restocking`}
        actions={
          <>
            <Button variant="outline" className="rounded-xl">
              <Upload className="mr-1 h-4 w-4" /> Bulk Upload
            </Button>
            <Button className="rounded-xl">
              <Plus className="mr-1 h-4 w-4" /> Add Product
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Stock Value</p>
              <p className="text-xl font-bold">{fmt(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low Stock Items</p>
              <p className="text-xl font-bold">{lowCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardContent className="flex items-center gap-3 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-foreground">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Categories</p>
              <p className="text-xl font-bold">4</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={cat} onValueChange={setCat}>
              <TabsList className="rounded-xl">
                {cats.map((c) => (
                  <TabsTrigger key={c} value={c} className="rounded-lg capitalize">
                    {c}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search product or SKU…" className="h-10 rounded-xl pl-9 sm:w-64" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">SKU</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="w-[180px]">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const low = p.stock < p.min;
                  const pct = Math.min(100, (p.stock / (p.min * 3)) * 100);
                  return (
                    <TableRow key={p.sku}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-xs font-bold">
                            {p.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">{p.sku}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{p.sku}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="rounded-full">{p.cat}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{fmt(p.price)}</TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{p.stock} units</span>
                            {low && (
                              <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-[10px] text-destructive">
                                Low
                              </Badge>
                            )}
                          </div>
                          <Progress
                            value={pct}
                            className={`h-1.5 ${low ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
