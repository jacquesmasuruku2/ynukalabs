import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/team_members")({
  component: () => <ResourceTable resource="team_members" />,
});
