import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/newsletter_subscribers")({
  component: () => <ResourceTable resource="newsletter_subscribers" />,
});
