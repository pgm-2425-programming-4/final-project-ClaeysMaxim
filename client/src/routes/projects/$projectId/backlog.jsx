import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../../../api/projectApi";
import PaginatedBacklog from "../../../components/backlog/PaginatedBacklog";
import AddTaskForm from "../../../components/tasks/AddTaskForm";

function ProjectBacklogComponent() {
  const { projectId } = Route.useParams();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Fetch the projects data to find the active project
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Find the active project from the projects list
  const activeProject = projectsData?.data?.find(
    (project) => project.id === parseInt(projectId),
  );

  const projectName = activeProject?.ProjectName || "No Project Selected";

  // Only show status if we have an active project
  const isActive = activeProject?.isActive;
  const statusText = activeProject
    ? isActive
      ? "Active Project"
      : "Inactive Project"
    : "";

  const handleAddTaskClick = () => {
    setIsTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="header__project">
          <h1 className="header__title">{projectName}</h1>
          <span className="header__subtitle">{statusText}</span>
        </div>
        <div className="header__actions">
          <div className="header__view-toggle">
            <Link
              to="/projects/$projectId/backlog"
              params={{ projectId }}
              className="view-toggle__button"
              activeProps={{
                className: "view-toggle__button view-toggle__button--active",
              }}
            >
              Backlog
            </Link>
            <Link
              to="/projects/$projectId"
              params={{ projectId }}
              className="view-toggle__button"
            >
              Kanban
            </Link>
          </div>
          <button
            className="button button--primary"
            onClick={handleAddTaskClick}
          >
            <span className="icon">
              <img src="/styles/images/icons/plus.svg" alt="Add" />
            </span>
            Add Task
          </button>
        </div>
      </header>

      <PaginatedBacklog projectId={parseInt(projectId)} />

      {isTaskModalOpen && (
        <AddTaskForm
          onClose={handleCloseModal}
          currentProjectId={parseInt(projectId)}
          projects={projectsData?.data || []}
        />
      )}
    </>
  );
}

export const Route = createFileRoute("/projects/$projectId/backlog")({
  component: ProjectBacklogComponent,
});
