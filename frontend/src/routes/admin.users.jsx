import { createFileRoute } from "@tanstack/react-router";
import { UserManagement } from "@/modules/admin/UserManagement";

export const Route = createFileRoute("/admin/users")({
  component: UserManagement,
});
