import { createFileRoute } from "@tanstack/react-router";
import { GalleryBlockForm } from "@/components/GalleryBlockForm";

export const Route = createFileRoute("/admin/gallery_images")({
  component: () => <GalleryBlockForm />,
});
