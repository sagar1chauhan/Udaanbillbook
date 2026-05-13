import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";

// Dashboard Pages
import { MainDashboard } from "./modules/dashboard/MainDashboard";
import { AccountingDashboard } from "./modules/accounting/AccountingDashboard";
import { UserManagement } from "./modules/admin/UserManagement";
import { BillingDashboard } from "./modules/billing/BillingDashboard";
import { ExpensesDashboard } from "./modules/expenses/ExpensesDashboard";
import { GstDashboard } from "./modules/gst/GstDashboard";
import { InventoryDashboard } from "./modules/inventory/InventoryDashboard";
import { PartiesDashboard } from "./modules/parties/PartiesDashboard";
import { ReportsDashboard } from "./modules/reports/ReportsDashboard";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import { useSubscription } from "./hooks/useSubscription";

function SubscriptionGuard({ children, feature }) {
  const { canAccessFeature, hydrated } = useSubscription();
  
  if (!hydrated) {
    return null; // Wait for auth store to hydrate from localStorage
  }
  
  if (!canAccessFeature(feature)) {
    return <Navigate to="/pricing" replace />;
  }
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
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />

          {/* Protected Routes */}
          <Route path="/" element={<MainDashboard />} />
          <Route path="/accounting" element={<SubscriptionGuard feature="accounting"><AccountingDashboard /></SubscriptionGuard>} />
          <Route path="/admin/users" element={<SubscriptionGuard feature="admin"><UserManagement /></SubscriptionGuard>} />
          <Route path="/billing" element={<BillingDashboard />} />
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
      </Routes>
    </BrowserRouter>
  );
}
