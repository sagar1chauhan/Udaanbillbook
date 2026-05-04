import { createFileRoute } from "@tanstack/react-router";
import { GstDashboard } from "@/modules/gst/GstDashboard";

export const Route = createFileRoute("/gst")({
  component: GstDashboard,
});
