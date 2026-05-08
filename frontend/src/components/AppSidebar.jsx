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
  Calculator,
  ShieldCheck,
  UserCog,
  LogOut,
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
import { useMockAuth, mockAuth } from "@/lib/auth-store";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import logo from "../public/udaan-logo-removebg-preview.png";

const main = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Billing", url: "/billing", icon: ReceiptText },
  { title: "Inventory", url: "/inventory", icon: Boxes },
  { title: "Parties", url: "/parties", icon: Users },
  { title: "Expenses", url: "/expenses", icon: Wallet },
  { title: "Accounting", url: "/accounting", icon: Calculator },
  { title: "GST & Tax", url: "/gst", icon: ShieldCheck },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

const adminItems = [
  { title: "Staff Management", url: "/admin/users", icon: UserCog },
  { title: "Settings", url: "/settings", icon: Settings }
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user } = useMockAuth();
  
  // Use actual user role from auth store, default to Staff if missing
  const userRole = user?.role || "Staff"; 
  const isAdmin = userRole === "Admin";

  // Filter sections based on permissions
  const staffAllowed = ["Dashboard", "Billing", "Inventory", "Parties", "Expenses", "Accounting"];
  const filteredMain = main.filter(item => {
    if (isAdmin) return true;
    if (userRole === "Staff") return staffAllowed.includes(item.title);
    return false; // Viewer only has read access, but we hide other things or they can see but not edit. Let's just follow same for Viewer for now, or just limit to Dashboard. We'll stick to Staff for now.
  });

  const isActive = (url) => (url === "/" ? path === "/" : path.startsWith(url));
  const navigate = useNavigate();

  const handleLogout = () => {
    mockAuth.signOut();
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <img src={logo} alt="Udaan" className="h-9 w-9 rounded-xl object-cover shadow-[var(--shadow-glow)]" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold leading-tight">Udaan</span>
            <span className="text-[11px] text-muted-foreground leading-tight">Business Accounting</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Business Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMain.map((item) => (
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

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
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
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem className="mb-2 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-3 rounded-xl bg-primary-soft p-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-xs font-semibold">Pro Plan Active</p>
                <p className="text-[11px] text-muted-foreground">All features unlocked</p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
              tooltip="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
