import { createFileRoute } from "@tanstack/react-router";
import { InventoryDashboard } from "@/modules/inventory/InventoryDashboard";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Udaan" },
      { name: "description", content: "Track stock, low-stock alerts and product categories." },
    ],
  }),
  component: InventoryDashboard,
});
