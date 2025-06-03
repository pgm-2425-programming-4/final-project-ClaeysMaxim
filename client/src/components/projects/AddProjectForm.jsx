import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject } from "../../api/projectApi";

function ProjectFormModal({ onClose }) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    ProjectName: "",
    description: "",
    isActive: true,
  });

  const [error, setError] = useState("");

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
      onClose();
    },
    onError: (err) => {
      setError("Error creating project. Please try again.");
      console.error(err);
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.ProjectName.trim()) {
      setError("Project name is required");
      return;
    }

    const submitData = {
      data: {
        ProjectName: formData.ProjectName,
        description: formData.description || null,
        isActive: formData.isActive,
      },
    };

    createProjectMutation.mutate(submitData);
  };

  return (
    <div
      className="add-task-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="add-task">
        <div className="add-task__header">
          <h2 className="add-task__title">Add New Project</h2>
          <button className="add-task__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="add-task__body">
          {error && <div className="add-task-form__error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="add-task-form__group">
              <label className="add-task-form__label" htmlFor="ProjectName">
                Project Name *
              </label>
              <input
                className="add-task-form__control"
                type="text"
                id="ProjectName"
                name="ProjectName"
                value={formData.ProjectName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-task-form__group">
              <label className="add-task-form__label" htmlFor="description">
                Description
              </label>
              <textarea
                className="add-task-form__control add-task-form__control--textarea"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="add-task-form__group">
              <label className="add-task-form__label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  style={{ marginRight: "8px" }}
                />
                Active Project
              </label>
            </div>

            <div className="add-task__footer">
              <button
                type="button"
                onClick={onClose}
                className="button button--secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProjectMutation.isPending}
                className="button button--primary"
              >
                {createProjectMutation.isPending ? "Saving..." : "Save Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProjectFormModal;
