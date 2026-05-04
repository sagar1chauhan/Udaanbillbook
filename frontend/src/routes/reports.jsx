import { createFileRoute } from "@tanstack/react-router";
import { ReportsDashboard } from "@/modules/reports/ReportsDashboard";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Udaan" },
      { name: "description", content: "Sales, profit/loss and GST reports with export." },
    ],
  }),
  component: ReportsDashboard,
});
