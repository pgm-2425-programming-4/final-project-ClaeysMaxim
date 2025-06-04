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
            <strong>Email:</strong> maxim.claeys@student.artevelde.be
          </p>
          <p>
            <strong>LinkedIn:</strong>{" "}
            <a href="#" target="_blank" rel="noopener noreferrer">
              linkedin.com/in/maxim-claeys
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
