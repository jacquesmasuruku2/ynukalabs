import { createFileRoute } from "@tanstack/react-router";
import { ResourceTable } from "@/components/ResourceTable";

export const Route = createFileRoute("/admin/gallery_images")({
  component: () => <ResourceTable resource="gallery_images" />,
});
