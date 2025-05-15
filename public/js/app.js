/**
 * Task Manager Application JavaScript
 * Handles view toggling and interactive functionality
 */

// View toggling functionality
document.querySelectorAll(".view-toggle__button").forEach((button) => {
  button.addEventListener("click", function () {
    const view = this.dataset.view;

    // Toggle active button
    document.querySelectorAll(".view-toggle__button").forEach((btn) => {
      btn.classList.remove("view-toggle__button--active");
    });
    this.classList.add("view-toggle__button--active");

    // Toggle view display
    if (view === "backlog") {
      document.querySelector(".backlog").style.display = "block";
      document.querySelector(".kanban").style.display = "none";
    } else {
      document.querySelector(".backlog").style.display = "none";
      document.querySelector(".kanban").style.display = "block";
    }
  });
});

// Initialize with default view when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Get the active button's view
  const activeButton = document.querySelector(".view-toggle__button--active");
  if (activeButton) {
    const defaultView = activeButton.dataset.view;

    // Set initial view
    if (defaultView === "backlog") {
      document.querySelector(".backlog").style.display = "block";
      document.querySelector(".kanban").style.display = "none";
    } else {
      document.querySelector(".backlog").style.display = "none";
      document.querySelector(".kanban").style.display = "block";
    }
  }
});
