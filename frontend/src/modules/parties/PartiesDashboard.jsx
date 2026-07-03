import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Phone, MessageCircle, BookOpen, Filter, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { AddPartyDialog } from "@/components/EntityDialogs";

const fmt = (n) => "₹" + Math.abs(n).toLocaleString("en-IN");

export function PartiesDashboard() {
  const [parties, setParties] = useState([]);
  const [partyTypes, setPartyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = searchParams.get("type") || "all";
  const setTab = (val) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val && val !== "all") {
        next.set("type", val);
      } else {
        next.delete("type");
      }
      return next;
    });
  };

  const search = searchParams.get("q") || "";
  const setSearch = (val) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set("q", val);
      else next.delete("q");
      return next;
    });
  };

  const fetchParties = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parties');
      setParties(res.data);
    } catch (error) {
      console.error("Failed to load parties:", error);
      toast.error("Failed to load parties");
    } finally {
      setLoading(false);
    }
  };

  const fetchPartyTypes = async () => {
    try {
      const res = await api.get('/party-types');
      setPartyTypes(res.data || []);
    } catch (error) {
      console.error("Failed to load party types:", error);
    }
  };

  const fetchedRef = React.useRef(false);

  React.useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchParties();
      fetchPartyTypes();
    }
  }, []);

  const handleAddParty = async (payload) => {
    try {
      const res = await api.post('/parties', payload);
      toast.success(`${res.data.name} added to parties`);
      fetchParties();
      // Refresh types in case a new one was used
      fetchPartyTypes();
    } catch (error) {
      console.error("Failed to add party:", error);
      toast.error(error.response?.data?.message || "Failed to add party");
    }
  };

  const totalReceivable = parties.filter((p) => p.balance > 0).reduce((s, p) => s + p.balance, 0);
  const totalPayable = parties.filter((p) => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);

  const filteredParties = parties.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.phone.includes(search);
    if (!matchesSearch) return false;
    if (tab === "all") return true;
    return (p.type || "").toLowerCase() === tab.toLowerCase();
  });

  const callParty = (p) => {
    window.open(`tel:${p.phone.replace(/\s/g, "")}`);
  };
  const openLedger = (p) => {
    toast.message(`Opening khata for ${p.name}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parties"
        subtitle={`${parties.length} customers & suppliers · digital khata`}
        actions={
          <Button className="rounded-xl" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Party
          </Button>
        }
      />

      <AddPartyDialog
        open={open}
        onOpenChange={setOpen}
        onAdd={handleAddParty}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="border-0 bg-gradient-to-br from-success-soft to-card shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-3 sm:p-5">
            <p className="text-xs font-medium text-muted-foreground">You'll Receive</p>
            <p className="mt-1 text-xl sm:text-3xl font-bold text-success">{fmt(totalReceivable)}</p>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">From {parties.filter((p) => p.balance > 0).length} parties</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-accent-soft to-card shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-3 sm:p-5">
            <p className="text-xs font-medium text-muted-foreground">You'll Pay</p>
            <p className="mt-1 text-xl sm:text-3xl font-bold text-accent-foreground">{fmt(totalPayable)}</p>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground">To {parties.filter((p) => p.balance < 0).length} suppliers</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 md:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={tab} onValueChange={setTab} className="hidden sm:block w-full overflow-x-auto">
              <TabsList className="rounded-xl inline-flex min-w-max">
                <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                {partyTypes.map((t) => (
                  <TabsTrigger key={t._id || t.name} value={t.name} className="rounded-lg capitalize">
                    {t.name}s
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex w-full gap-2 sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search party…"
                  className="h-10 w-full rounded-xl pl-9 sm:w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl sm:hidden">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                  <DropdownMenuItem onClick={() => setTab("all")} className="cursor-pointer">All</DropdownMenuItem>
                  {partyTypes.map((t) => (
                    <DropdownMenuItem key={t._id || t.name} onClick={() => setTab(t.name)} className="cursor-pointer capitalize">
                      {t.name}s
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredParties.map((p) => {
              const credit = p.balance >= 0;
              return (
                <div key={p._id || p.name} className="flex items-center gap-3 rounded-2xl border bg-card p-3 transition-shadow hover:shadow-[var(--shadow-card)]">
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
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => callParty(p)}>
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openLedger(p)}>
                        <BookOpen className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={async () => {
                        if (confirm(`Delete ${p.name}?`)) {
                          try {
                            await api.delete(`/parties/${p._id}`);
                            toast.success(`${p.name} deleted`);
                            fetchParties();
                          } catch (err) {
                            toast.error("Failed to delete party");
                          }
                        }
                      }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredParties.length === 0 && !loading && (
              <div className="col-span-2 text-center text-muted-foreground text-sm py-8">
                No parties found{tab !== "all" ? ` for type "${tab}"` : ""}.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
