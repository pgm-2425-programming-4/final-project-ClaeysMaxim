import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "../../../api/projectApi";
import { fetchLabels } from "../../../api/labelApi";
import KanbanBoard from "../../../components/kanban/KanbanBoard";
import AddTaskForm from "../../../components/tasks/AddTaskForm";
import { useState } from "react";

function ProjectDetailComponent() {
  const { projectId } = Route.useParams();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [showLabelOptions, setShowLabelOptions] = useState(false);

  // Convert projectId to number for API calls
  const numericProjectId = parseInt(projectId, 10);

  // Fetch the projects data to find the active project
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Fetch labels for filter
  const { data: labelsData } = useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels,
  });

  // Find the active project from the projects list
  const activeProject = projectsData?.data?.find(
    (project) => project.id === numericProjectId,
  );

  // Handle both formats: project.attributes.ProjectName and project.ProjectName
  const projectName = activeProject?.attributes?.ProjectName || activeProject?.ProjectName || "Loading...";

  // Handle both formats for isActive
  const isActive = activeProject?.attributes?.isActive ?? activeProject?.isActive;
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

  const handleLabelToggle = (labelDocumentId) => {
    setSelectedLabels(prev => {
      const isSelected = prev.includes(labelDocumentId);
      if (isSelected) {
        return prev.filter(id => id !== labelDocumentId);
      } else {
        return [...prev, labelDocumentId];
      }
    });
  };

  const getFilterButtonText = () => {
    if (selectedLabels.length === 0) {
      return "Filter labels";
    } else if (selectedLabels.length === 1) {
      const label = labelsData?.data?.find(l => l.documentId === selectedLabels[0]);
      return label?.name || "1 label";
    } else {
      return `${selectedLabels.length} labels`;
    }
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
          <div className="label-filter">
            <button
              type="button"
              className="label-filter__button"
              onClick={() => setShowLabelOptions(prev => !prev)}
            >
              {getFilterButtonText()}
            </button>

            {showLabelOptions && (
              <div className="label-filter__options">
                {labelsData?.data?.map((label) => (
                  <label
                    key={label.documentId}
                    className="label-filter__option"
                  >
                    <input
                      type="checkbox"
                      className="label-filter__checkbox"
                      checked={selectedLabels.includes(label.documentId)}
                      onChange={() => handleLabelToggle(label.documentId)}
                    />
                    {label.name}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="header__view-toggle">
            <Link
              to="/projects/$projectId"
              params={{ projectId }}
              className="view-toggle__button view-toggle__button--active"
            >
              Kanban
            </Link>
            <Link
              to="/projects/$projectId/backlog"
              params={{ projectId }}
              className="view-toggle__button"
            >
              Backlog
            </Link>
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

      <KanbanBoard projectId={numericProjectId} labelFilter={selectedLabels} />

      {isTaskModalOpen && (
        <AddTaskForm
          onClose={handleCloseModal}
          currentProjectId={numericProjectId}
          projects={projectsData?.data || []}
        />
      )}
    </>
  );
}

export const Route = createFileRoute("/projects/$projectId/")({
  component: ProjectDetailComponent,
});
