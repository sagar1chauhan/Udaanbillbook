import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { SuperAdminSidebar } from "../components/SuperAdminSidebar";
import { SuperAdminTopbar } from "../components/SuperAdminTopbar";
import { Toaster } from "@/components/ui/sonner";

export function SuperAdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: "oklch(0.12 0.025 257)" }}>
      {/* Sidebar */}
      <SuperAdminSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Area — offset by sidebar width dynamically */}
      <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? "ml-[68px]" : "ml-[260px]"}`}>
        <SuperAdminTopbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toaster richColors position="top-right" theme="dark" />
    </div>
  );
}
