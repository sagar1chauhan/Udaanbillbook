import { createFileRoute } from "@tanstack/react-router";
import { AccountingDashboard } from "@/modules/accounting/AccountingDashboard";

export const Route = createFileRoute("/accounting")({
  component: AccountingDashboard,
});
