import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import { InvoiceProvider } from "./contexts/InvoiceContext";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";

// Dashboard Pages
import { MainDashboard } from "./modules/dashboard/MainDashboard";
import { AccountingDashboard } from "./modules/accounting/AccountingDashboard";
import { UserManagement } from "./modules/admin/UserManagement";
import { BillingDashboard } from "./modules/billing/BillingDashboard";
import NewSale from "./modules/billing/NewSale";
import NewPurchase from "./modules/billing/NewPurchase";
import { ExpensesDashboard } from "./modules/expenses/ExpensesDashboard";
import { GstDashboard } from "./modules/gst/GstDashboard";
import { InventoryDashboard } from "./modules/inventory/InventoryDashboard";
import { PartiesDashboard } from "./modules/parties/PartiesDashboard";
import { ReportsDashboard } from "./modules/reports/ReportsDashboard";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import { useSubscription } from "./hooks/useSubscription";
import { useMockAuth } from "./lib/auth-store";

// SuperAdmin imports
import { SuperAdminLayout } from "./modules/superadmin/layouts/SuperAdminLayout";
import { SADashboard } from "./modules/superadmin/pages/SADashboard";
import { BusinessManagement } from "./modules/superadmin/pages/BusinessManagement";
import { SubscriptionManager } from "./modules/superadmin/pages/SubscriptionManager";
import { RevenueTransactions } from "./modules/superadmin/pages/RevenueTransactions";
import { SecurityCenter } from "./modules/superadmin/pages/SecurityCenter";
import { PlatformAnalytics } from "./modules/superadmin/pages/PlatformAnalytics";
import { UserManagementSA } from "./modules/superadmin/pages/UserManagementSA";
import { SupportTickets } from "./modules/superadmin/pages/SupportTickets";
import { ActivityLog } from "./modules/superadmin/pages/ActivityLog";
import { SASettings } from "./modules/superadmin/pages/SASettings";

function SubscriptionGuard({ children, feature }) {
  const { canAccessFeature, hydrated } = useSubscription();
  if (!hydrated) return null;
  if (!canAccessFeature(feature)) return <Navigate to="/pricing" replace />;
  return children;
}

function SuperAdminGuard({ children }) {
  const { user, hydrated } = useMockAuth();
  if (!hydrated) return null;
  if (!user || user.role?.toLowerCase() !== "admin") return <Navigate to="/login" replace />;
  return children;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <InvoiceProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/login" element={<Login role="staff" />} />
          <Route path="/user/login" element={<Login role="staff" />} />
          <Route path="/admin/login" element={<Login role="admin" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Protected Business Routes */}
          <Route path="/" element={<MainDashboard />} />
          <Route path="/accounting" element={<SubscriptionGuard feature="accounting"><AccountingDashboard /></SubscriptionGuard>} />
          <Route path="/admin/users" element={<SubscriptionGuard feature="admin"><UserManagement /></SubscriptionGuard>} />
          <Route path="/billing" element={<BillingDashboard />} />
          <Route path="/sale/new" element={<NewSale />} />
          <Route path="/purchase/new" element={<NewPurchase />} />
          <Route path="/expenses" element={<SubscriptionGuard feature="expenses"><ExpensesDashboard /></SubscriptionGuard>} />
          <Route path="/gst" element={<SubscriptionGuard feature="gst"><GstDashboard /></SubscriptionGuard>} />
          <Route path="/inventory" element={<SubscriptionGuard feature="inventory"><InventoryDashboard /></SubscriptionGuard>} />
          <Route path="/parties" element={<PartiesDashboard />} />
          <Route path="/reports" element={<SubscriptionGuard feature="reports"><ReportsDashboard /></SubscriptionGuard>} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ====== SuperAdmin Routes (completely separate layout) ====== */}
        <Route element={<SuperAdminGuard><SuperAdminLayout /></SuperAdminGuard>}>
          <Route path="/superadmin" element={<SADashboard />} />
          <Route path="/superadmin/analytics" element={<PlatformAnalytics />} />
          <Route path="/superadmin/businesses" element={<BusinessManagement />} />
          <Route path="/superadmin/subscriptions" element={<SubscriptionManager />} />
          <Route path="/superadmin/revenue" element={<RevenueTransactions />} />
          <Route path="/superadmin/users" element={<UserManagementSA />} />
          <Route path="/superadmin/security" element={<SecurityCenter />} />
          <Route path="/superadmin/tickets" element={<SupportTickets />} />
          <Route path="/superadmin/activity" element={<ActivityLog />} />
          <Route path="/superadmin/settings" element={<SASettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </InvoiceProvider>
  );
}
