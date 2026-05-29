import { createFileRoute } from "@tanstack/react-router";
import { ProjectForm } from "@/components/ProjectForm";

export const Route = createFileRoute("/admin/projects")({
  component: () => <ProjectForm />,
});
