import { createFileRoute, redirect } from "@tanstack/react-router";
import { getToken } from "@/lib/api";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && getToken()) {
      throw redirect({ to: "/admin" });
    }
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
