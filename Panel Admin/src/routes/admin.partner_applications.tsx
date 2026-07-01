import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/partner_applications")({
  component: () => <ResourceTable resource="partner_applications" hideCreateButton={true} maxColumns={12} />,
});
