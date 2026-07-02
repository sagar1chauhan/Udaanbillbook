import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppTopbar } from "@/components/AppTopbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Toaster } from "@/components/ui/sonner";
import { useMockAuth } from "@/lib/auth-store";

const PUBLIC_ROUTES = ["/login", "/register", "/verify-otp", "/admin/login", "/user/login", "/vendor", "/staff"];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, hydrated } = useMockAuth();
  const isPublic = PUBLIC_ROUTES.some((p) => {
    if (p === "/vendor" || p === "/staff") {
      return location.pathname === p;
    }
    return location.pathname.startsWith(p);
  });

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

  const isImpersonating = !!localStorage.getItem("Udaan.admin_auth");

  const handleStopImpersonating = () => {
    const adminAuth = localStorage.getItem("Udaan.admin_auth");
    if (adminAuth) {
      localStorage.setItem("Udaan.auth", adminAuth);
      localStorage.removeItem("Udaan.admin_auth");
      window.location.href = "/admin";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        {isImpersonating && (
          <div className="bg-amber-600 text-white text-xs font-semibold py-2.5 px-4 flex justify-between items-center z-50 shadow-md">
            <span>⚠️ Impersonation Mode: You are viewing the app as a vendor.</span>
            <button 
              onClick={handleStopImpersonating} 
              className="bg-white text-amber-950 px-3 py-1 rounded-lg hover:bg-white/90 transition-all font-bold shadow-sm"
            >
              Stop Impersonating
            </button>
          </div>
        )}
        <div className="flex flex-1 w-full">
          <AppSidebar />
          <SidebarInset className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
            <AppTopbar />
            <main className="flex-1 p-4 md:p-6 lg:p-8">
              <Outlet />
            </main>
            <MobileBottomNav />
          </SidebarInset>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
