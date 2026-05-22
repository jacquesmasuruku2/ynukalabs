import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/blog_posts")({
  component: () => <ResourceTable resource="blog_posts" />,
});
