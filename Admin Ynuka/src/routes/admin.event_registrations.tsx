import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/event_registrations")({
  component: () => <ResourceTable resource="event_registrations" />,
});
