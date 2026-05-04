import { createFileRoute } from "@tanstack/react-router";
import { PartiesDashboard } from "@/modules/parties/PartiesDashboard";

export const Route = createFileRoute("/parties")({
  head: () => ({
    meta: [
      { title: "Parties — Udaan" },
      { name: "description", content: "Manage customers and suppliers with khata-style ledgers." },
    ],
  }),
  component: PartiesDashboard,
});
