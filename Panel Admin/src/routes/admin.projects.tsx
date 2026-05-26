import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/projects")({
  component: () => <ResourceTable resource="projects" />,
});
