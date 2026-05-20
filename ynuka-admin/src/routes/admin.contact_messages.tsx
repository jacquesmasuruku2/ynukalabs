import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/contact_messages")({
  component: () => <ResourceTable resource="contact_messages" />,
});
