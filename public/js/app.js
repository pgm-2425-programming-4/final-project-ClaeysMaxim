
document.querySelectorAll(".view-toggle__button").forEach((button) => {
  button.addEventListener("click", function () {
    const view = this.dataset.view;

    document.querySelectorAll(".view-toggle__button").forEach((btn) => {
      btn.classList.remove("view-toggle__button--active");
    });
    this.classList.add("view-toggle__button--active");

    if (view === "backlog") {
      document.querySelector(".backlog").style.display = "block";
      document.querySelector(".kanban").style.display = "none";
    } else {
      document.querySelector(".backlog").style.display = "none";
      document.querySelector(".kanban").style.display = "block";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
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
