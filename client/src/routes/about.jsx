import { createFileRoute, Link } from "@tanstack/react-router";

function AboutComponent() {
  return (
    <div className="about">
      <div className="about__hero">
        <div className="about__hero-content">
          <h1 className="about__title">About TaskFlow</h1>
          <p className="about__subtitle">
            A modern project management solution
          </p>
        </div>
      </div>

      <div className="about__content">
        <div className="about__section">
          <div className="about__card">
            <div className="about__card-icon">
              <img src="/styles/images/icons/laptop-code.svg" alt="Project" />
            </div>
            <h2 className="about__card-title">The Project</h2>
            <p className="about__card-text">
              TaskFlow is a modern Kanban board application built with React and
              TanStack Router. The application enables project management,
              task organization across different statuses, and provides a clear
              overview of all ongoing work activities.
            </p>
          </div>

          <div className="about__card">
            <div className="about__card-icon">
              <img src="/styles/images/icons/kanban.svg" alt="Features" />
            </div>
            <h2 className="about__card-title">Features</h2>
            <ul className="about__feature-list">
              <li>Interactive Kanban board</li>
              <li>Task backlog management</li>
              <li>Project overview</li>
              <li>Team member management</li>
              <li>Responsive design</li>
            </ul>
          </div>
        </div>

        <div className="about__contact">
          <div className="about__contact-card">
            <h2 className="about__contact-title">Contact</h2>
            <div className="about__contact-info">
              <div className="about__contact-item">
                <strong>Name:</strong> Maxim Claeys
              </div>
              <div className="about__contact-item">
                <strong>Education:</strong> PGM - Artevelde University of Applied Sciences
              </div>
              <div className="about__contact-item">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:maxim.claeys@student.arteveldehs.be"
                  className="about__contact-link" target="_blank"
                >
                  maxim.claeys@student.arteveldehs.be
                </a>
              </div>
              <div className="about__contact-item">
                <strong>LinkedIn:</strong>{" "}
                <a
                  href="https://www.linkedin.com/in/maxim-claeys-871404237/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about__contact-link"
                >
                  Maxim Claeys
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="about__actions">
          <Link to="/" className="button button--primary">
            <span className="icon">
              <img src="/styles/images/icons/laptop-code.svg" alt="Home" />
            </span>
            Back to TaskFlow
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/about")({
  component: AboutComponent,
});
