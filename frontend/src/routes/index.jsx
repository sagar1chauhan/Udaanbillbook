import { createFileRoute } from "@tanstack/react-router";
import { MainDashboard } from "@/modules/dashboard/MainDashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Udaan" },
      { name: "description", content: "Live KPIs, sales trends, top products and pending payments at a glance." },
    ],
  }),
  component: MainDashboard,
});
