import { createFileRoute, Outlet } from "@tanstack/react-router";

function ProjectLayoutComponent() {
  return <Outlet />;
}

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectLayoutComponent,
});
