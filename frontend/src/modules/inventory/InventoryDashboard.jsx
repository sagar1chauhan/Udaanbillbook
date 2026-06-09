import React, { useState } from "react";
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus, Search, Upload, Boxes, AlertTriangle, ScanLine, Filter,
  MoreVertical, PlusCircle, MinusCircle, Ban, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useMockAuth } from "@/lib/auth-store";
import { AddProductDialog } from "@/components/EntityDialogs";

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

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

export function InventoryDashboard() {
  const { user } = useMockAuth();
  const isViewer = user?.role === "Viewer";

  const [inventory, setInventory] = useState(products);
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState(false);
  const cats = ["all", "Grocery", "Bakery", "Dairy", "Packaged"];

  // Stock adjustment dialog state
  const [stockDialog, setStockDialog] = useState({ open: false, mode: null, product: null });
  const [stockQty, setStockQty] = useState(1);

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  const filtered = cat === "all" ? inventory : inventory.filter((p) => p.cat === cat);
  const lowCount = inventory.filter((p) => p.stock < p.min && p.stock > 0).length;
  const outOfStockCount = inventory.filter((p) => p.stock === 0).length;
  const totalValue = inventory.reduce((s, p) => s + p.price * p.stock, 0);

  const handleAdd = (newP) => {
    setInventory([newP, ...inventory]);
    setOpen(false);
  };

  // --- Stock Management Handlers ---
  const openStockDialog = (product, mode) => {
    setStockQty(1);
    setStockDialog({ open: true, mode, product });
  };

  const handleStockAdjust = () => {
    const { mode, product } = stockDialog;
    const qty = Number(stockQty) || 0;
    if (qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }

    setInventory((prev) =>
      prev.map((p) => {
        if (p.sku !== product.sku) return p;
        if (mode === "add") {
          return { ...p, stock: p.stock + qty };
        } else {
          const newStock = Math.max(0, p.stock - qty);
          return { ...p, stock: newStock };
        }
      })
    );

    const label = mode === "add" ? "added to" : "removed from";
    toast.success(`${qty} units ${label} ${product.name}`);
    setStockDialog({ open: false, mode: null, product: null });
  };

  const handleOutOfStock = (product) => {
    setInventory((prev) =>
      prev.map((p) => (p.sku === product.sku ? { ...p, stock: 0 } : p))
    );
    toast.warning(`${product.name} marked as Out of Stock`);
  };

  const openDeleteDialog = (product) => {
    setDeleteDialog({ open: true, product });
  };

  const handleDeleteProduct = () => {
    const { product } = deleteDialog;
    setInventory((prev) => prev.filter((p) => p.sku !== product.sku));
    toast.success(`${product.name} deleted from inventory`);
    setDeleteDialog({ open: false, product: null });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle={`${inventory.length} products · ${lowCount} low stock · ${outOfStockCount} out of stock`}
        actions={
          <>
            <Button variant="outline" className="rounded-xl" onClick={() => toast.message("Upload .xlsx with product list")}>
              <Upload className="mr-1 h-4 w-4" /> Bulk Upload
            </Button>
            {!isViewer && (
              <Button className="rounded-xl" onClick={() => setOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Add Product
              </Button>
            )}
          </>
        }
      />

      <AddProductDialog open={open} onOpenChange={setOpen} onAdd={handleAdd} />

      {/* Stock Adjustment Dialog */}
      <Dialog open={stockDialog.open} onOpenChange={(v) => !v && setStockDialog({ open: false, mode: null, product: null })}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {stockDialog.mode === "add" ? (
                <PlusCircle className="h-5 w-5 text-green-600" />
              ) : (
                <MinusCircle className="h-5 w-5 text-orange-500" />
              )}
              {stockDialog.mode === "add" ? "Add Stock" : "Remove Stock"}
            </DialogTitle>
            <DialogDescription>
              {stockDialog.product?.name} — Current stock: <strong>{stockDialog.product?.stock} units</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="stock-qty">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl shrink-0"
                  onClick={() => setStockQty((q) => Math.max(1, q - 1))}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <Input
                  id="stock-qty"
                  type="number"
                  min={1}
                  value={stockQty}
                  onChange={(e) => setStockQty(Number(e.target.value) || 0)}
                  className="h-10 rounded-xl text-center text-lg font-bold"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl shrink-0"
                  onClick={() => setStockQty((q) => q + 1)}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {stockDialog.mode === "remove" && stockQty > (stockDialog.product?.stock || 0) && (
              <p className="text-xs text-destructive font-medium">
                ⚠ Quantity exceeds current stock. Stock will be set to 0.
              </p>
            )}
            <div className="rounded-xl bg-secondary/50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Stock</span>
                <span className="font-semibold">{stockDialog.product?.stock} units</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">After Adjustment</span>
                <span className="font-bold text-primary">
                  {stockDialog.mode === "add"
                    ? (stockDialog.product?.stock || 0) + (Number(stockQty) || 0)
                    : Math.max(0, (stockDialog.product?.stock || 0) - (Number(stockQty) || 0))
                  } units
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setStockDialog({ open: false, mode: null, product: null })}>
              Cancel
            </Button>
            <Button
              className={`rounded-xl ${stockDialog.mode === "add" ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"} text-white`}
              onClick={handleStockAdjust}
            >
              {stockDialog.mode === "add" ? "Add Stock" : "Remove Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(v) => !v && setDeleteDialog({ open: false, product: null })}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.product?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3 text-sm text-destructive">
            <p className="font-medium">This will permanently remove:</p>
            <ul className="mt-1 list-disc list-inside text-xs space-y-0.5">
              <li>Product details and pricing</li>
              <li>Stock records ({deleteDialog.product?.stock} units)</li>
              <li>Stock value of {fmt((deleteDialog.product?.price || 0) * (deleteDialog.product?.stock || 0))}</li>
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeleteDialog({ open: false, product: null })}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-xl" onClick={handleDeleteProduct}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-3 sm:p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Stock Value</p>
              <p className="text-xl font-bold">{fmt(totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-3 sm:p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Low Stock Items</p>
              <p className="text-xl font-bold">{lowCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-3 sm:p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Ban className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Out of Stock</p>
              <p className="text-xl font-bold">{outOfStockCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-3 sm:p-5">
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
            <Tabs value={cat} onValueChange={setCat} className="hidden sm:block w-full overflow-x-auto">
              <TabsList className="rounded-xl inline-flex min-w-max">
                {cats.map((c) => (
                  <TabsTrigger key={c} value={c} className="rounded-lg capitalize">
                    {c}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex w-full gap-2 sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search product or SKU…" className="h-10 w-full rounded-xl pl-9 sm:w-64" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl sm:hidden">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  {cats.map((c) => (
                    <DropdownMenuItem 
                      key={c} 
                      className="capitalize cursor-pointer"
                      onClick={() => setCat(c)}
                    >
                      {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
                  {!isViewer && <TableHead className="w-[50px] text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => {
                  const isOutOfStock = p.stock === 0;
                  const low = p.stock < p.min && p.stock > 0;
                  const pct = Math.min(100, (p.stock / (p.min * 3)) * 100);
                  return (
                    <TableRow key={p.sku} className={isOutOfStock ? "opacity-60" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${isOutOfStock ? "bg-destructive/10 text-destructive" : "bg-secondary"}`}>
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
                            {isOutOfStock ? (
                              <Badge variant="outline" className="border-gray-400/30 bg-gray-100 text-[10px] text-gray-600">
                                Out of Stock
                              </Badge>
                            ) : low ? (
                              <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-[10px] text-destructive">
                                Low
                              </Badge>
                            ) : null}
                          </div>
                          <Progress
                            value={pct}
                            className={`h-1.5 ${isOutOfStock ? "[&>div]:bg-gray-400" : low ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
                          />
                        </div>
                      </TableCell>
                      {!isViewer && (
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-secondary">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52 rounded-xl">
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 py-2.5"
                                onClick={() => openStockDialog(p, "add")}
                              >
                                <PlusCircle className="h-4 w-4 text-green-600" />
                                <span>Add Stock</span>
                                <span className="ml-auto text-xs text-muted-foreground">+Qty</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 py-2.5"
                                onClick={() => openStockDialog(p, "remove")}
                                disabled={p.stock === 0}
                              >
                                <MinusCircle className="h-4 w-4 text-orange-500" />
                                <span>Remove Stock</span>
                                <span className="ml-auto text-xs text-muted-foreground">−Qty</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 py-2.5"
                                onClick={() => handleOutOfStock(p)}
                                disabled={p.stock === 0}
                              >
                                <Ban className="h-4 w-4 text-gray-500" />
                                <span>Mark Out of Stock</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer gap-2 py-2.5 text-destructive focus:text-destructive"
                                onClick={() => openDeleteDialog(p)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete Product</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
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

