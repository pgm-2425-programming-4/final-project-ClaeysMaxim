import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createTask } from "../../api/taskApi";
import { fetchStatuses, fetchPriorities } from "../../api/referenceDataApi";
import { fetchLabels } from "../../api/labelApi";

function TaskForm({ onClose, currentProjectId, projects }) {
  const queryClient = useQueryClient();
  const [showLabelOptions, setShowLabelOptions] = useState(false);

  // Form state with default values
  const [formData, setFormData] = useState({
    Title: "",
    Description: "",
    dueDate: "",
    dueTime: "12:00",
    project: currentProjectId || "",
    taskStatus: "",
    priority: "",
    assignee: "",
    labels: [],
  });

  const [error, setError] = useState("");

  // Query for statuses, priorities, labels, and team members
  const { data: statusesData, isLoading: statusesLoading } = useQuery({
    queryKey: ["statuses"],
    queryFn: fetchStatuses,
  });
  
  const { data: prioritiesData, isLoading: prioritiesLoading } = useQuery({
    queryKey: ["priorities"],
    queryFn: fetchPriorities,
  });

  const { data: labelsData, isLoading: labelsLoading } = useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels,
  });

  const { data: teamMembersData, isLoading: teamMembersLoading } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: fetchTeamMembers,
  });

  // Set default status and priority once data is loaded
  useEffect(() => {
    // Only update if we have valid data and the current values are empty
    if (statusesData?.data?.length > 0 && !formData.taskStatus) {
      // Sort statuses by order field (lowest first)
      const sortedStatuses = [...statusesData.data].sort((a, b) => {
        return (a.order || 0) - (b.order || 0);
      });
      
      // Use the first status (which should be the lowest order after sorting)
      const defaultStatus = sortedStatuses[0];
      
      if (defaultStatus) {
        setFormData(prev => ({
          ...prev,
          taskStatus: defaultStatus.id
        }));
      }
    }

    if (prioritiesData?.data?.length > 0 && !formData.priority) {
      // Find the "Low" priority if it exists
      const lowPriority = prioritiesData.data.find(
        priority => priority.priorityLevel?.toLowerCase() === "low"
      );
      
      // Set the first priority as default if "Low" doesn't exist
      const defaultPriority = lowPriority || prioritiesData.data[0];
      
      if (defaultPriority) {
        setFormData(prev => ({
          ...prev,
          priority: defaultPriority.id
        }));
      }
    }
  }, [statusesData, prioritiesData, formData.taskStatus, formData.priority]);

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

  const handleLabelToggle = (labelId) => {
    setFormData(prev => {
      const current = prev.labels;
      const isSelected = current.includes(labelId);

      if (isSelected) {
        return {
          ...prev,
          labels: current.filter(id => id !== labelId)
        };
      } else if (current.length < 2) {
        return {
          ...prev,
          labels: [...current, labelId]
        };
      }

      return prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Only validate required fields
    if (!formData.Title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.project) {
      setError("Project is required");
      return;
    }

    // Format the date and time for Strapi
    let fullDueDate = null;
    if (formData.dueDate) {
      fullDueDate = `${formData.dueDate}T${formData.dueTime}:00.000Z`;
    }

    // Prepare data for submission - ensure all relation IDs are numbers
    const submitData = {
      data: {
        Title: formData.Title,
        Description: formData.Description,
        dueDate: fullDueDate,
        project: parseInt(formData.project),
        taskStatus: formData.taskStatus ? parseInt(formData.taskStatus) : undefined,
        priority: formData.priority ? parseInt(formData.priority) : undefined,
        labels: formData.labels.length > 0 ? formData.labels : undefined,
        assignee: formData.assignee ? parseInt(formData.assignee) : undefined,
      },
    };

    createTaskMutation.mutate(submitData);
  };

  return (
    <div className="add-task-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="add-task">
        <div className="add-task__header">
          <h2 className="add-task__title">Add New Task</h2>
          <button className="add-task__close" onClick={onClose}>×</button>
        </div>

        <div className="add-task__body">
          {error && <div className="add-task-form__error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Title and Description fields */}
            <div className="add-task-form__group">
              <label className="add-task-form__label" htmlFor="Title">Title *</label>
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
              <label className="add-task-form__label" htmlFor="Description">Description</label>
              <textarea
                className="add-task-form__control add-task-form__control--textarea"
                id="Description"
                name="Description"
                value={formData.Description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Date and time fields */}
            <div className="add-task-form__row">
              <div className="add-task-form__group add-task-form__group--half">
                <label className="add-task-form__label" htmlFor="dueDate">Due Date</label>
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
                <label className="add-task-form__label" htmlFor="dueTime">Time</label>
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

            {/* Status and priority fields */}
            <div className="add-task-form__row">
              <div className="add-task-form__group add-task-form__group--half">
                <label className="add-task-form__label" htmlFor="taskStatus">Status</label>
                <select
                  className="add-task-form__control"
                  id="taskStatus"
                  name="taskStatus"
                  value={formData.taskStatus}
                  onChange={handleChange}
                >
                  {statusesLoading ? (
                    <option value="">Loading statuses...</option>
                  ) : !statusesData?.data?.length ? (
                    <option value="">No statuses available</option>
                  ) : (
                    [...statusesData.data]
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name || `Status ${status.id}`}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div className="add-task-form__group add-task-form__group--half">
                <label className="add-task-form__label" htmlFor="priority">Priority</label>
                <select
                  className="add-task-form__control"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  {prioritiesLoading ? (
                    <option value="">Loading priorities...</option>
                  ) : !prioritiesData?.data?.length ? (
                    <option value="">No priorities available</option>
                  ) : (
                    prioritiesData.data.map((priority) => (
                      <option key={priority.id} value={priority.id}>
                        {priority.priorityLevel || `Priority ${priority.id}`}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Project selection */}
            <div className="add-task-form__group">
              <label className="add-task-form__label" htmlFor="project">Project *</label>
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

            {/* Labels selection */}
            <div className="add-task-form__group">
              <label className="add-task-form__label">Labels (max 2)</label>
              <button
                type="button"
                className="button button--small"
                onClick={() => setShowLabelOptions(prev => !prev)}
                style={{ marginBottom: "0.5rem" }}
              >
                {showLabelOptions ? "Verberg labels" : "Kies labels"}
              </button>

              {showLabelOptions && (
                <div style={{ paddingLeft: "0.5rem" }}>
                  {labelsData?.data?.map((label) => {
                    const isSelected = formData.labels.includes(label.id);
                    const isDisabled = !isSelected && formData.labels.length >= 2;

                    return (
                      <label
                        key={label.id}
                        style={{
                          display: "block",
                          marginBottom: "0.25rem",
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? "not-allowed" : "pointer"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleLabelToggle(label.id)}
                          disabled={isDisabled}
                          style={{ marginRight: "0.5rem" }}
                        />
                        {label.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add assignee field */}
            <div className="add-task-form__group">
              <label className="add-task-form__label" htmlFor="assignee">Assignee</label>
              <select
                className="add-task-form__control"
                id="assignee"
                name="assignee"
                value={formData.assignee}
                onChange={handleChange}
              >
                <option value="">-- Unassigned --</option>
                {teamMembersData?.data?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName || `Member ${member.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Form buttons */}
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

export default TaskForm;
