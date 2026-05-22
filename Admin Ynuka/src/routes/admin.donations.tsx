import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/donations")({
  component: () => <ResourceTable resource="donations" />,
});
