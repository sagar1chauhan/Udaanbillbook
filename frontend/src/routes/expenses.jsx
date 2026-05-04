import { createFileRoute } from "@tanstack/react-router";
import { ExpensesDashboard } from "@/modules/expenses/ExpensesDashboard";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — Udaan" },
      { name: "description", content: "Log and categorize business expenses with ease." },
    ],
  }),
  component: ExpensesDashboard,
});
