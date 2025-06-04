import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createTask } from "../../api/taskApi";
import { fetchStatuses, fetchPriorities } from "../../api/referenceDataApi";

// Hernoem de component
function TaskForm({ onClose, currentProjectId, projects }) {
  const queryClient = useQueryClient();

  // Form state with default values
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    dueDate: "",
    dueTime: "12:00",
    project: currentProjectId || "",
    taskStatus: "",
    priority: "",
  });

  const [error, setError] = useState("");

  // Query for statuses and priorities
  const { data: statusesData } = useQuery({
    queryKey: ["statuses"],
    queryFn: fetchStatuses,
  });
  const { data: prioritiesData } = useQuery({
    queryKey: ["priorities"],
    queryFn: fetchPriorities,
  });

  // Set default status and priority once data is loaded
  useEffect(() => {
    if (statusesData?.data?.length > 0) {
      setFormData((prev) => ({
        ...prev,
        taskStatus: statusesData.data[0].id.toString(),
      }));
    }

    if (prioritiesData?.data?.length > 0) {
      setFormData((prev) => ({
        ...prev,
        priority: prioritiesData.data[0].id.toString(),
      }));
    }
  }, [statusesData, prioritiesData]);

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Refresh task list after successful creation
      queryClient.invalidateQueries(["tasks", formData.project]);
      onClose();
    },
    onError: (err) => {
      setError("Error creating task. Please try again.");
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Only validate required fields
    if (!formData.Title.trim()) {
      setError("Title is required");
      return;
    }

    // Format the date and time for Strapi
    let fullDueDate = null;
    if (formData.dueDate) {
      fullDueDate = `${formData.dueDate}T${formData.dueTime}:00.000Z`;
    }

    // Prepare data for submission
    const submitData = {
      data: {
        Title: formData.Title,
        Description: formData.Description,
        dueDate: fullDueDate,
        project: parseInt(formData.project),
        taskStatus: formData.taskStatus
          ? parseInt(formData.taskStatus)
          : undefined,
        priority: formData.priority ? parseInt(formData.priority) : undefined,
      },
    };

    createTaskMutation.mutate(submitData);
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
          <h2 className="add-task__title">Add New Task</h2>
          <button className="add-task__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="add-task__body">
          {error && <div className="add-task-form__error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="add-task-form__group">
              <label className="add-task-form__label" htmlFor="Title">
                Title *
              </label>
              <input
                className="add-task-form__control"
                type="text"
                id="Title"
                name="Title"
                value={formData.Title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="add-task-form__group">
              <label className="add-task-form__label" htmlFor="Description">
                Description
              </label>
              <textarea
                className="add-task-form__control add-task-form__control--textarea"
                id="Description"
                name="Description"
                value={formData.Description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="add-task-form__row">
              <div className="add-task-form__group add-task-form__group--half">
                <label className="add-task-form__label" htmlFor="dueDate">
                  Due Date
                </label>
                <input
                  className="add-task-form__control"
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>

              <div className="add-task-form__group add-task-form__group--half">
                <label className="add-task-form__label" htmlFor="dueTime">
                  Time
                </label>
                <input
                  className="add-task-form__control"
                  type="time"
                  id="dueTime"
                  name="dueTime"
                  value={formData.dueTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="add-task-form__row">
              <div className="add-task-form__group add-task-form__group--half">
                <label className="add-task-form__label" htmlFor="taskStatus">
                  Status
                </label>
                <select
                  className="add-task-form__control"
                  id="taskStatus"
                  name="taskStatus"
                  value={formData.taskStatus}
                  onChange={handleChange}
                >
                  {!statusesData?.data ? (
                    <option>Loading...</option>
                  ) : (
                    statusesData.data.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.attributes.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="add-task-form__group add-task-form__group--half">
                <label className="add-task-form__label" htmlFor="priority">
                  Priority
                </label>
                <select
                  className="add-task-form__control"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {!prioritiesData?.data ? (
                    <option>Loading...</option>
                  ) : (
                    prioritiesData.data.map((priority) => (
                      <option key={priority.id} value={priority.id}>
                        {priority.attributes.priorityLevel}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="add-task-form__group">
              <label className="add-task-form__label" htmlFor="project">
                Project *
              </label>
              <select
                className="add-task-form__control"
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.ProjectName || `Project ${project.id}`}
                  </option>
                ))}
              </select>
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
                disabled={createTaskMutation.isPending}
                className="button button--primary"
              >
                {createTaskMutation.isPending ? "Saving..." : "Save Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Hernoem de export
export default TaskForm;
