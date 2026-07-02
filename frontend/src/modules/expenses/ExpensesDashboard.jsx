import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Fuel, Truck, Zap, Wifi, ShoppingBag, Users, Layers } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

const catIcons = {
  Fuel: Fuel,
  Utilities: Zap,
  Logistics: Truck,
  Supplies: ShoppingBag,
  Payroll: Users,
};

const catColors = {
  Fuel: "bg-accent-soft text-accent-foreground",
  Utilities: "bg-primary-soft text-primary",
  Logistics: "bg-secondary text-secondary-foreground",
  Supplies: "bg-success-soft text-success",
  Payroll: "bg-destructive/10 text-destructive",
};

const formatDate = (dateStr) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  } catch (err) {
    return dateStr;
  }
};

export function ExpensesDashboard() {
  const [expenseList, setExpenseList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Fuel");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Category modal states
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenseList(res.data || []);
    } catch (err) {
      console.error("Failed to load expenses:", err);
      toast.error("Failed to load expenses");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/expense-categories');
      setCategories(res.data || []);
      if (res.data && res.data.length > 0) {
        const exists = res.data.some(c => c.name === category);
        if (!exists) {
          setCategory(res.data[0].name);
        }
      }
    } catch (err) {
      console.error("Failed to load expense categories:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  const handleAddCategory = async (name) => {
    try {
      const res = await api.post('/expense-categories', { name });
      toast.success(`Category "${res.data.name}" added`);
      await fetchCategories();
      setCategory(res.data.name);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to add category");
    }
  };

  const total = expenseList.reduce((s, e) => s + e.amount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) {
      toast.error("Please fill in title and amount");
      return;
    }

    try {
      const payload = {
        description: title,
        category: category,
        amount: parseFloat(amount),
        date: date,
      };
      await api.post('/expenses', payload);
      toast.success("Expense recorded");
      setTitle("");
      setAmount("");
      fetchExpenses();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to record expense");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle={`${fmt(total)} spent this month across ${expenseList.length} entries`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-0 shadow-[var(--shadow-card)] lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Diesel for van"
                  className="h-10 rounded-xl"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amt">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                  <Input
                    id="amt"
                    type="number"
                    placeholder="0"
                    className="h-10 rounded-xl pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Category</Label>
                  <button
                    type="button"
                    onClick={() => setCategoryOpen(true)}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    + Add Type/Category
                  </button>
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id || c.name} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  className="h-10 rounded-xl"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
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
            {expenseList.map((e, i) => {
              const Icon = catIcons[e.category || e.cat] || Layers;
              const color = catColors[e.category || e.cat] || "bg-primary-soft text-primary";
              const titleText = e.description || e.name;
              const catText = e.category || e.cat;
              const dateText = formatDate(e.date);

              return (
                <div key={e._id || i} className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-all duration-200 hover:translate-x-1 hover:shadow-sm">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{titleText}</p>
                    <p className="text-xs text-muted-foreground">{catText} · {dateText}</p>
                  </div>
                  <p className="text-sm font-bold">-{fmt(e.amount)}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="max-w-md rounded-2xl w-[90%] sm:w-full">
          <DialogHeader>
            <DialogTitle>Add Expense Category</DialogTitle>
            <DialogDescription>Create a new category to group your business expenses.</DialogDescription>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!newCategoryName.trim()) {
              toast.error("Category name cannot be empty");
              return;
            }
            await handleAddCategory(newCategoryName.trim());
            setNewCategoryName("");
            setCategoryOpen(false);
          }} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="newCat">Category Name</Label>
              <Input
                id="newCat"
                placeholder="e.g. Marketing, Rent, Travel"
                className="h-10 rounded-xl"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCategoryOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl">
                Add Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
