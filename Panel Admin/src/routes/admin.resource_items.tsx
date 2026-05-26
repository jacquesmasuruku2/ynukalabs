import { createFileRoute } from "@tanstack/react-router";
import { ResourceItemForm } from "@/components/ResourceItemForm";

export const Route = createFileRoute("/admin/resource_items")({
  component: () => <ResourceItemForm />,
});
