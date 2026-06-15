import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppTopbar } from "@/components/AppTopbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Toaster } from "@/components/ui/sonner";
import { useMockAuth } from "@/lib/auth-store";

const PUBLIC_ROUTES = ["/login", "/register", "/verify-otp", "/admin/login", "/user/login"];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, hydrated } = useMockAuth();
  const isPublic = PUBLIC_ROUTES.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && !isPublic) {
      navigate("/login");
    }
  }, [hydrated, isAuthenticated, isPublic, navigate]);

  if (isPublic) {
    return (
      <>
        <Outlet />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  // Avoid flashing protected layout before redirect
  if (hydrated && !isAuthenticated) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
          <AppTopbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </main>
          <MobileBottomNav />
        </SidebarInset>
      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
