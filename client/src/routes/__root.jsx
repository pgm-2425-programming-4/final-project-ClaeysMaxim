import { createRootRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchProjects, deleteProject, updateProjectStatus } from "../api/projectApi";
import AddProjectForm from "../components/projects/AddProjectForm";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ToggleSlider from "../components/ui/ToggleSlider";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

function ProjectSidebar({ isMobileMenuOpen, onMobileMenuClose, onAddProject, onDeleteProject, confirmDialog, onConfirmDelete, onCancelDelete }) {
  const navigate = useNavigate();
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
      await refetchProjects();
      onCancelDelete();
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      onCancelDelete();
    },
  });

  const updateProjectStatusMutation = useMutation({
    mutationFn: ({ project, isActive }) => updateProjectStatus(project, isActive),
    onSuccess: () => {
      refetchProjects();
    },
    onError: (error) => {
      console.error("Status update failed:", error);
    },
  });

  const handleAddProjectClick = () => {
    onAddProject();
    onMobileMenuClose(); // Close mobile menu when opening project modal
  };

  const handleDeleteProject = (projectId, projectName) => {
    onDeleteProject(projectId, projectName);
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.projectId) {
      deleteProjectMutation.mutate(confirmDialog.projectId);
    }
  };

  const handleManageAssigneesClick = () => {
    navigate({ to: '/assignees' });
    onMobileMenuClose(); // Close mobile menu when navigating to assignees
  };

  const handleManageLabelsClick = () => {
    navigate({ to: '/labels' });
    onMobileMenuClose(); // Close mobile menu when navigating to labels
  };

  const handleToggleProjectStatus = async (project, newStatus) => {
    updateProjectStatusMutation.mutate({ project, isActive: newStatus });
  };

  const handleProjectLinkClick = () => {
    onMobileMenuClose();
  };

  const handleHomeLinkClick = () => {
    onMobileMenuClose();
  };

  const handleAboutLinkClick = () => {
    onMobileMenuClose();
  };

  if (isLoading)
    return <div className="sidebar__loading">Loading projects...</div>;
  if (error)
    return <div className="sidebar__error">Error loading projects</div>;

  return (
    <>
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'mobile-overlay--open' : ''}`}
        onClick={onMobileMenuClose}
      />
      <aside className={`sidebar ${isMobileMenuOpen ? 'sidebar--mobile-open' : ''}`}>
        <div className="sidebar__header">
          <Link to="/" onClick={handleHomeLinkClick}>
            <h1 className="sidebar__title">TaskFlow</h1>
          </Link>
        </div>
        <nav className="sidebar__nav">
          <Link
            to="/"
            className="sidebar__home-link"
            activeProps={{
              className: "sidebar__home-link sidebar__home-link--active",
            }}
            onClick={handleHomeLinkClick}
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
                      onClick={handleProjectLinkClick}
                    >
                      <span className="project-list__icon">
                        <img
                          src="/styles/images/icons/laptop-code.svg"
                          alt="Project"
                        />
                      </span>
                      <div className="project-list__content">
                        <span className="project-list__name">{projectName}</span>
                      </div>
                    </Link>
                    <div className="project-list__actions">
                      <ToggleSlider
                        checked={project.isActive !== false}
                        onChange={(newStatus) => handleToggleProjectStatus(project, newStatus)}
                        disabled={updateProjectStatusMutation.isPending}
                      />
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
                    </div>
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
              onClick={handleAboutLinkClick}
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
            
            <button
              className="button button--secondary sidebar__manage-button"
              onClick={handleManageLabelsClick}
            >
              <span className="icon">
                <img src="/styles/images/icons/label.svg" alt="Labels" />
              </span>
              Manage Labels
            </button>
            
            <button
              className="button button--secondary sidebar__manage-button"
              onClick={handleManageAssigneesClick}
            >
              <span className="icon">
                <img src="/styles/images/icons/team.svg" alt="Team" />
              </span>
              Manage Assignees
            </button>
          </div>
        </nav>

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title="Delete Project"
          message={`Are you sure you want to delete "${confirmDialog.projectName}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={onCancelDelete}
        />
      </aside>
    </>
  );
}

function RootComponent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAddProject = () => {
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (projectId, projectName) => {
    setConfirmDialog({
      isOpen: true,
      projectId,
      projectName,
    });
  };

  const handleConfirmDelete = () => {
    // This will be handled by the mutation in ProjectSidebar
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, projectId: null, projectName: "" });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <button 
          className={`hamburger-menu ${isMobileMenuOpen ? 'hamburger-menu--open' : ''}`}
          onClick={toggleMobileMenu}
        >
          <div className="hamburger-menu__icon">
            <span className="hamburger-menu__line"></span>
            <span className="hamburger-menu__line"></span>
            <span className="hamburger-menu__line"></span>
          </div>
        </button>
        
        <ProjectSidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          onMobileMenuClose={closeMobileMenu}
          onAddProject={handleAddProject}
          onDeleteProject={handleDeleteProject}
          confirmDialog={confirmDialog}
          onConfirmDelete={handleConfirmDelete}
          onCancelDelete={handleCancelDelete}
        />
        <main className="main">
          <Outlet />
        </main>

        {/* Modal is now rendered at the root level */}
        {isProjectModalOpen && (
          <AddProjectForm onClose={handleCloseProjectModal} />
        )}
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
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

