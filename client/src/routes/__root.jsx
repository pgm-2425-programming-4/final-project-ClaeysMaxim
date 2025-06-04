import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchProjects, deleteProject } from "../api/projectApi";
import AddProjectForm from "../components/projects/AddProjectForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

function ProjectSidebar() {
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
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      // Force immediate refetch to ensure fresh data
      await refetchProjects();

      // Reset dialog
      setConfirmDialog({ isOpen: false, projectId: null, projectName: "" });
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      setConfirmDialog({ isOpen: false, projectId: null, projectName: "" });
    },
  });

  const handleAddProjectClick = () => {
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
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
        <Link
          to="/"
          className="sidebar__home-link"
          activeProps={{
            className: "sidebar__home-link sidebar__home-link--active",
          }}
        >
          Home
        </Link>

        <h2 className="sidebar__subtitle">Projects</h2>
        <ul className="project-list">
          {Array.isArray(projectsData?.data) && projectsData.data.length > 0 ? (
            projectsData.data.map((project) => {
              // Skip any projects without ID
              if (!project || !project.id) return null;

              const projectName =
                project.ProjectName || `Project ${project.id}`;

              return (
                <li key={project.id} className="project-list__item">
                  <Link
                    to="/projects/$projectId"
                    params={{ projectId: project.id.toString() }}
                    className="project-list__link"
                    activeProps={{
                      className:
                        "project-list__link project-list__link--active",
                    }}
                  >
                    <span className="project-list__icon">
                      <img
                        src="/styles/images/icons/laptop-code.svg"
                        alt="Project"
                      />
                    </span>
                    <span>{projectName}</span>
                  </Link>
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

        <div className="sidebar__info">
          <h2 className="sidebar__subtitle">Info</h2>
          <Link
            to="/about"
            className="sidebar__about-link"
            activeProps={{
              className: "sidebar__about-link sidebar__about-link--active",
            }}
          >
            About
          </Link>
        </div>

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

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <ProjectSidebar />
        <main className="main">
          <Outlet />
        </main>
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  // Toevoegen van een error component om onverwachte fouten op te vangen
  errorComponent: () => (
    <div className="error-page">
      <h1>Oops! Something went wrong</h1>
      <p>An error occurred while loading the application.</p>
      <Link to="/" className="button button--primary">
        Go Home
      </Link>
    </div>
  ),
});
