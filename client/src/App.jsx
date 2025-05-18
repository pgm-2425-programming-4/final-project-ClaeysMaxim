import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PaginatedBacklog from "./components/backlog/PaginatedBacklog";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar__header">
            <h1 className="sidebar__title">TaskFlow</h1>
          </div>
          <nav className="sidebar__nav">
            <h2 className="sidebar__subtitle">Projects</h2>
            <ul className="project-list">
              <li className="project-list__item project-list__item--active">
                <a href="#" className="project-list__link">
                  <span className="icon project-list__icon">
                    <img
                      src="/styles/images/icons/laptop-code.svg"
                      alt="Website"
                    />
                  </span>
                  <span>Website Redesign</span>
                </a>
              </li>
              <li className="project-list__item">
                <a href="#" className="project-list__link">
                  <span className="icon project-list__icon">
                    <img src="/styles/images/icons/mobile.svg" alt="Mobile" />
                  </span>
                  <span>Mobile App Development</span>
                </a>
              </li>
              <li className="project-list__item">
                <a href="#" className="project-list__link">
                  <span className="icon project-list__icon">
                    <img
                      src="/styles/images/icons/database.svg"
                      alt="Database"
                    />
                  </span>
                  <span>Database Migration</span>
                </a>
              </li>
            </ul>
            <div className="sidebar__actions">
              <button className="button button--secondary">
                <span className="icon">
                  <img src="/styles/images/icons/plus.svg" alt="Add" />
                </span>
                New Project
              </button>
            </div>
          </nav>
        </aside>

        <main className="main">
          <header className="header">
            <div className="header__project">
              <h1 className="header__title">Website Redesign</h1>
              <span className="header__subtitle">Active Project</span>
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
              <button className="button button--primary">
                <span className="icon">
                  <img src="/styles/images/icons/plus.svg" alt="Add" />
                </span>
                Add Task
              </button>
            </div>
          </header>

          <PaginatedBacklog />

          {/* Kanban View (hidden by default) */}
          <section className="kanban" style={{ display: "none" }}>
            {/* Kanban content would go here */}
          </section>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
