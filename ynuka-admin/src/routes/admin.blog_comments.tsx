import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/blog_comments")({
  component: () => <ResourceTable resource="blog_comments" />,
});
