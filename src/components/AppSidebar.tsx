import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ReceiptText,
  Boxes,
  Users,
  Wallet,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const main = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Billing", url: "/billing", icon: ReceiptText },
  { title: "Inventory", url: "/inventory", icon: Boxes },
  { title: "Parties", url: "/parties", icon: Users },
  { title: "Expenses", url: "/expenses", icon: Wallet },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const secondary = [{ title: "Settings", url: "/settings", icon: Settings }];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) => (url === "/" ? path === "/" : path.startsWith(url));

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
            <span className="text-base font-bold">L</span>
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold leading-tight">LedgerLite</span>
            <span className="text-[11px] text-muted-foreground leading-tight">Billing & GST</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center gap-3 rounded-xl bg-primary-soft p-3 group-data-[collapsible=icon]:hidden">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-xs font-semibold">Upgrade to Pro</p>
            <p className="text-[11px] text-muted-foreground">Unlimited invoices</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
