import { createFileRoute } from "@tanstack/react-router";
import { TeamMemberForm } from "@/components/TeamMemberForm";

export const Route = createFileRoute("/admin/team_members")({
  component: () => <TeamMemberForm />,
});
