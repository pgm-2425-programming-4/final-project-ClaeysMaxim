import { createFileRoute, Link } from "@tanstack/react-router";

function HomeComponent() {
  return (
    <div className="home-page">
      <div className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__title">Welcome to TaskFlow</h1>
          <p className="home__subtitle">
            Your modern project management solution
          </p>
        </div>
      </div>

      <div className="home-content">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <img src="/styles/images/icons/laptop-code.svg" alt="Projects" />
            </div>
            <h2>Manage Projects</h2>
            <p>Create, organize, and track all your projects in one place.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img src="/styles/images/icons/task-list.svg" alt="Tasks" />
            </div>
            <h2>Task Management</h2>
            <p>
              Break down your work into manageable tasks with priorities and
              deadlines.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img src="/styles/images/icons/kanban.svg" alt="Kanban" />
            </div>
            <h2>Kanban Board</h2>
            <p>
              Visualize your workflow with an intuitive kanban board interface.
            </p>
          </div>
        </div>

        <div className="get-started">
          <h2>Get Started</h2>
          <p>
            Choose a project from the sidebar or create a new project to begin
            organizing your tasks.
          </p>
          <div className="home-actions">
            <Link to="/about" className="button button--secondary">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: HomeComponent,
});
