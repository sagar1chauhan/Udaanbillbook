import React, { useState } from "react";
import { Bell, Search, Plus, LogOut, Settings as SettingsIcon, User, Menu } from "lucide-react";
import { useNavigate, Link, useLocation, useSearchParams } from "react-router-dom";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
const logo = "/udaan-logo-removebg-preview.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewInvoiceDialog } from "@/components/NewInvoiceDialog";
import { useMockAuth, mockAuth } from "@/lib/auth-store";
import { toast } from "sonner";

export function AppTopbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const open = searchParams.get("create-invoice") === "true";
  const setOpen = (val) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) {
        next.set("create-invoice", "true");
      } else {
        next.delete("create-invoice");
      }
      return next;
    });
  };
  const { user } = useMockAuth();
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const location = useLocation();

  if (location.pathname.startsWith('/sale/new') || location.pathname.startsWith('/purchase/new')) return null;

  const initials = (user?.name || "RK")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onLogout = () => {
    mockAuth.signOut();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-3 backdrop-blur md:px-6">
        
        {/* Mobile Left: Logo & Business Name */}
        <div className="flex items-center gap-2 md:hidden">
          <Avatar className="h-8 w-8 shadow-sm">
            <AvatarFallback className="bg-slate-900 text-white text-[10px] font-bold">
              {user?.business?.substring(0, 2).toUpperCase() || "ST"}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{user?.business ?? "Sharma Traders"}</span>
        </div>

        {/* Desktop Left: Sidebar Trigger */}
        <div className="hidden md:flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
        </div>

        <div className="relative ml-4 hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search invoices, products, parties…"
            className="h-10 rounded-xl border-transparent bg-secondary pl-9 focus-visible:bg-card"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* New Invoice Button (Desktop Only) */}
          <Button
            size="sm"
            className="hidden h-10 rounded-xl px-4 md:inline-flex"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            New Invoice
          </Button>

          {/* Bell Icon */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full bg-destructive p-0 px-1 text-[10px]">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-0.5">
                <span className="text-xs font-semibold">Payment received</span>
                <span className="text-[11px] text-muted-foreground">Anil Sweets paid ₹24,500</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-0.5">
                <span className="text-xs font-semibold">Low stock alert</span>
                <span className="text-[11px] text-muted-foreground">Atta 10kg has only 8 units left</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-0.5">
                <span className="text-xs font-semibold">Reminder sent</span>
                <span className="text-[11px] text-muted-foreground">Patel Stores · ₹36,200 due</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Desktop: Profile Dropdown */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl border bg-card px-2 py-1.5 transition-colors hover:bg-secondary">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-semibold">{user?.name ?? "Guest User"}</p>
                    <p className="text-[10px] text-muted-foreground">{user?.business ?? "—"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user?.name ?? "Guest User"}</span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    {user?.phone ? `+91 ${user.phone}` : "Not signed in"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings"><User className="mr-2 h-4 w-4" /> Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings"><SettingsIcon className="mr-2 h-4 w-4" /> Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile: Hamburger Menu (Replacing Profile) */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl md:hidden text-foreground"
            onClick={toggleSidebar}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

        </div>
      </header>

      <NewInvoiceDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
