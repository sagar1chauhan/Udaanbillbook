import { Bell, Search, Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-card/80 px-3 backdrop-blur md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="relative ml-2 hidden flex-1 max-w-md md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search invoices, products, parties…"
          className="h-10 rounded-xl border-transparent bg-secondary pl-9 focus-visible:bg-card"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button size="sm" className="hidden h-10 rounded-xl px-4 sm:inline-flex">
          <Plus className="mr-1 h-4 w-4" />
          New Invoice
        </Button>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full bg-destructive p-0 px-1 text-[10px]">
            3
          </Badge>
        </Button>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-2 py-1.5">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              RK
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight md:block">
            <p className="text-xs font-semibold">Rahul Kumar</p>
            <p className="text-[10px] text-muted-foreground">Sharma Traders</p>
          </div>
        </div>
      </div>
    </header>
  );
}
