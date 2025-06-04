import { createFileRoute } from "@tanstack/react-router";

function AboutComponent() {
  return (
    <div className="about-page">
      <h1>About This Project</h1>
      <div className="about-content">
        <p>
          Dit is een moderne Kanban board applicatie gebouwd met React en
          TanStack Router. De applicatie maakt het mogelijk om projecten te
          beheren, taken te organiseren in verschillende statussen, en een
          duidelijk overzicht te krijgen van alle lopende werkzaamheden. Het
          project gebruikt een moderne tech stack met React voor de frontend,
          TanStack Query voor state management, en een RESTful API voor data
          persistentie.
        </p>

        <div className="contact-info">
          <h2>Contact</h2>
          <p>
            <strong>Naam:</strong> Maxim Claeys
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a
              href="mailto:maxim.claeys@student.artevelde.be"
              target="_blank"
              rel="noopener noreferrer"
            >
              maxim.claeys@student.arteveldehs.be
            </a>
          </p>
          <p>
            <strong>LinkedIn:</strong>{" "}
            <a
              href="https://www.linkedin.com/in/maxim-claeys-871404237/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Maxim Claeys
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/about")({
  component: AboutComponent,
});
