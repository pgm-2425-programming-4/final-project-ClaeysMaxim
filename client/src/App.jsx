import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import PaginatedBacklog from "./components/backlog/PaginatedBacklog";
import { fetchProjects, deleteProject } from "./api/projectApi";
import { useState } from "react";
import AddTaskForm from "./components/tasks/AddTaskForm";
import AddProjectForm from "./components/projects/AddProjectForm";
import ConfirmDialog from "./components/ui/ConfirmDialog";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

function ProjectSidebar({ activeProjectId, onProjectSelect }) {
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
  });
  const queryClient = useQueryClient();

  const {
    data: projectsData,
    isLoading,
    error,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    onSuccess: (data) => {
      if (!activeProjectId && data?.data?.length > 0) {
        onProjectSelect(data.data[0].id);
      }
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async (result) => {
      const deletedProjectId = confirmDialog.projectId;

      console.log(`✅ Project ${deletedProjectId} deleted successfully`);

      // Force immediate refetch to ensure fresh data
      await refetchProjects();

      // Reset active project if it was deleted
      if (deletedProjectId === activeProjectId) {
        onProjectSelect(null);
      }

      // Reset dialog
      setConfirmDialog({ isOpen: false, projectId: null, projectName: "" });
    },
    onError: (error) => {
      console.error("❌ Delete failed:", error);
      setConfirmDialog({ isOpen: false, projectId: null, projectName: "" });
    },
  });

  // Handle project selection
  const handleProjectClick = (projectId) => {
    onProjectSelect(projectId);
  };

  const handleAddProjectClick = () => {
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    // Refetch projects when modal closes to show new projects
    refetchProjects();
  };

  const handleDeleteProject = (projectId, projectName) => {
    setConfirmDialog({
      isOpen: true,
      projectId,
      projectName,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.projectId) {
      deleteProjectMutation.mutate(confirmDialog.projectId);
    }
    // Don't reset the dialog here - let the mutation handle it
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, projectId: null, projectName: "" });
  };

  if (isLoading)
    return <div className="sidebar__loading">Loading projects...</div>;
  if (error)
    return <div className="sidebar__error">Error loading projects</div>;

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">TaskFlow</h1>
      </div>
      <nav className="sidebar__nav">
        <h2 className="sidebar__subtitle">Projects</h2>
        <ul className="project-list">
          {Array.isArray(projectsData?.data) && projectsData.data.length > 0 ? (
            projectsData.data.map((project) => {
              // Skip any projects without ID
              if (!project || !project.id) return null;

              // The data doesn't have an 'attributes' object - it's directly on the project
              const projectName =
                project.ProjectName || `Project ${project.id}`;

              return (
                <li
                  key={project.id}
                  className={`project-list__item ${
                    activeProjectId === project.id
                      ? "project-list__item--active"
                      : ""
                  }`}
                >
                  <a
                    href="#"
                    className="project-list__link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleProjectClick(project.id);
                    }}
                  >
                    <span className="project-list__icon">
                      <img
                        src="/styles/images/icons/laptop-code.svg"
                        alt="Project"
                      />
                    </span>
                    <span>{projectName}</span>
                  </a>
                  <button
                    className="project-list__delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id, projectName);
                    }}
                    disabled={deleteProjectMutation.isPending}
                    title="Delete project"
                  >
                    ×
                  </button>
                </li>
              );
            })
          ) : (
            <li className="project-list__item">
              <span>No projects available</span>
            </li>
          )}
        </ul>

        <div className="sidebar__actions">
          <button
            className="button button--secondary"
            onClick={handleAddProjectClick}
          >
            <span className="icon">
              <img src="/styles/images/icons/plus.svg" alt="Add" />
            </span>
            New Project
          </button>
        </div>
      </nav>

      {isProjectModalOpen && (
        <AddProjectForm onClose={handleCloseProjectModal} />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${confirmDialog.projectName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </aside>
  );
}

function MainContent({ activeProjectId }) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Fetch the projects data to find the active project
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // Find the active project from the projects list
  const activeProject = projectsData?.data?.find(
    (project) => project.id === activeProjectId
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
    <main className="main">
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
          >
            <span className="icon">
              <img src="/styles/images/icons/plus.svg" alt="Add" />
            </span>
            Add Task
          </button>
        </div>
      </header>

      <PaginatedBacklog projectId={activeProjectId} />

      {isTaskModalOpen && (
        <AddTaskForm
          onClose={handleCloseModal}
          currentProjectId={activeProjectId}
          projects={projectsData?.data || []}
        />
      )}

      {/* Kanban View (hidden by default) */}
      <section className="kanban" style={{ display: "none" }}>
        {/* Kanban content would go here */}
      </section>
    </main>
  );
}

function App() {
  const [activeProjectId, setActiveProjectId] = useState(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <ProjectSidebar
          activeProjectId={activeProjectId}
          onProjectSelect={setActiveProjectId}
        />
        <MainContent activeProjectId={activeProjectId} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
