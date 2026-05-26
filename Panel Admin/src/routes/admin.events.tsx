import { createFileRoute } from "@tanstack/react-router";
import { EventForm } from "@/components/EventForm";

export const Route = createFileRoute("/admin/events")({
  component: () => <EventForm />,
});
