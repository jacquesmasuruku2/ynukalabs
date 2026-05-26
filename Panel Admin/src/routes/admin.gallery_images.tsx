import { createFileRoute } from "@tanstack/react-router";
import { GalleryImageFormRefactored } from "@/components/GalleryImageFormRefactored";

export const Route = createFileRoute("/admin/gallery_images")({
  component: () => <GalleryImageFormRefactored />,
});
