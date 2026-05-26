import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/user_roles")({
  component: () => <ResourceTable resource="user_roles" />,
});
