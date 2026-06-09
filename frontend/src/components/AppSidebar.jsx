import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Lock,
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
import { useSubscription, PLANS } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";
const logo = "/udaan-logo-removebg-preview.png";

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
  const location = useLocation();
  const path = location.pathname;
  const { user } = useMockAuth();
  const { currentPlan, isFree, canAccessFeature } = useSubscription();
  const { setOpenMobile, isMobile } = useSidebar();
  
  // Use actual user role from auth store, default to Staff if missing
  const userRole = user?.role || "Staff"; 
  const isAdmin = userRole === "Admin";

  const closeSidebar = () => {
    if (isMobile) setOpenMobile(false);
  };

  // Filter sections based on permissions
  const staffAllowed = ["Dashboard", "Billing", "Inventory", "Parties", "Expenses", "Accounting"];
  const filteredMain = main.filter(item => {
    if (isAdmin) return true;
    if (userRole === "Staff" || userRole === "Viewer") return staffAllowed.includes(item.title);
    return false;
  });

  const isActive = (url) => (url === "/" ? path === "/" : path.startsWith(url));
  const navigate = useNavigate();

  const handleLogout = () => {
    mockAuth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <img src={logo} alt="Udaan" className="h-9 w-9 rounded-xl object-cover shadow-[var(--shadow-glow)]" />
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold leading-tight">udaan BillBook</span>
            <span className="text-[11px] text-muted-foreground leading-tight">Business Accounting</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Business Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMain.map((item) => {
                // To determine the feature name from the URL (e.g., /billing -> billing)
                const featureKey = item.url === "/" ? "dashboard" : item.url.replace("/", "");
                const hasAccess = canAccessFeature(featureKey);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive(item.url)} 
                      tooltip={item.title} 
                      onClick={closeSidebar}
                      className={!hasAccess ? "opacity-50 hover:opacity-100" : ""}
                    >
                      <Link to={hasAccess ? item.url : "/pricing"}>
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {!hasAccess && <Lock className="h-3 w-3 text-muted-foreground ml-auto" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} onClick={closeSidebar}>
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
            {isFree ? (
              <div className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3 border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-background rounded-md shadow-sm">
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">Free Plan</p>
                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Limited features</p>
                  </div>
                </div>
                <Link to="/pricing" onClick={closeSidebar}>
                  <button className="w-full text-[11px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 rounded-lg transition-colors">
                    Upgrade to Premium
                  </button>
                </Link>
              </div>
            ) : (
              <Link to="/settings" onClick={closeSidebar}>
                <div className="flex items-center gap-3 rounded-xl bg-primary-soft p-3 hover:bg-primary/10 transition-colors cursor-pointer border border-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold">{currentPlan} Plan</p>
                    <p className="text-[11px] text-muted-foreground">All features unlocked</p>
                  </div>
                </div>
              </Link>
            )}
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
