import { createFileRoute } from "@tanstack/react-router";
import { BillingDashboard } from "@/modules/billing/BillingDashboard";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Billing & Invoices — Udaan" },
      { name: "description", content: "Create GST invoices, share via WhatsApp and track payments in seconds." },
    ],
  }),
  component: BillingDashboard,
});
