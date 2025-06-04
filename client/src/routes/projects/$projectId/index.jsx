import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../../../api/projectApi";
import PaginatedBacklog from "../../../components/backlog/PaginatedBacklog";
import AddTaskForm from "../../../components/tasks/AddTaskForm";
import { useState } from "react";

function ProjectDetailComponent() {
  const { projectId } = Route.useParams();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Convert projectId to number for API calls
  const numericProjectId = parseInt(projectId, 10);

  // Fetch the projects data to find the active project
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Find the active project from the projects list
  const activeProject = projectsData?.data?.find(
    (project) => project.id === numericProjectId
  );

  const projectName = activeProject?.ProjectName || "Project Not Found";

  // Only show status if we have an active project
  const isActive = activeProject?.isActive;
  const statusText = activeProject
    ? isActive
      ? "Active Project"
      : "Inactive Project"
    : "Project not found";

  const handleAddTaskClick = () => {
    setIsTaskModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
  };

  if (!activeProject && projectsData?.data) {
    return (
      <div className="project-not-found">
        <header className="header">
          <div className="header__project">
            <h1 className="header__title">Project Not Found</h1>
            <span className="header__subtitle">
              The requested project could not be found
            </span>
          </div>
        </header>
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <div className="header__project">
          <h1 className="header__title">{projectName}</h1>
          <span className="header__subtitle">{statusText}</span>
        </div>
        <div className="header__actions">
          <div className="header__view-toggle">
            <button
              className="view-toggle__button view-toggle__button--active"
              data-view="backlog"
            >
              Backlog
            </button>
            <button className="view-toggle__button" data-view="kanban">
              Kanban
            </button>
          </div>
          <button
            className="button button--primary"
            onClick={handleAddTaskClick}
            disabled={!activeProject}
          >
            <span className="icon">
              <img src="/styles/images/icons/plus.svg" alt="Add" />
            </span>
            Add Task
          </button>
        </div>
      </header>

      <PaginatedBacklog projectId={numericProjectId} />

      {isTaskModalOpen && (
        <AddTaskForm
          onClose={handleCloseModal}
          currentProjectId={numericProjectId}
          projects={projectsData?.data || []}
        />
      )}

      {/* Kanban View (hidden by default) */}
      <section className="kanban" style={{ display: "none" }}>
        {/* Kanban content would go here */}
      </section>
    </>
  );
}

export const Route = createFileRoute("/projects/$projectId/")({
  component: ProjectDetailComponent,
});
