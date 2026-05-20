import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/resource_items")({
  component: () => <ResourceTable resource="resource_items" />,
});
