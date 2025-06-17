import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateTask } from "../../api/taskApi";
import { fetchStatuses, fetchPriorities, fetchTeamMembers } from "../../api/referenceDataApi";
import { fetchLabels } from "../../api/labelApi";

function TaskForm({ task, projectId, onClose }) {
  const queryClient = useQueryClient();
  
  const taskProjectId = task?.project?.id || projectId;
  const taskData = task;
  const statusId = taskData?.taskStatus?.id;
  const priorityId = taskData?.priority?.id;

  const initialTask = {
    Title: taskData?.Title || "",
    Description: taskData?.Description || "",
    dueDate: taskData?.dueDate ? taskData.dueDate.substring(0, 10) : "",
    dueTime: taskData?.dueDate ? taskData.dueDate.substring(11, 16) : "12:00",
    taskStatus: statusId || "",
    priority: priorityId || "",
    assignee: taskData?.assignee?.id || "",
    project: taskProjectId,
    labels: taskData?.labels?.map(label => label.id) || [],
  };

  const [formData, setFormData] = useState(initialTask);
  const [error, setError] = useState("");
  const [showLabelOptions, setShowLabelOptions] = useState(false);

  const { data: statusesData, isLoading: statusesLoading } = useQuery({
    queryKey: ["statuses"],
    queryFn: fetchStatuses,
  });

  const { data: prioritiesData, isLoading: prioritiesLoading } = useQuery({
    queryKey: ["priorities"],
    queryFn: fetchPriorities,
  });

  const { data: teamMembersData, isLoading: teamMembersLoading } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: fetchTeamMembers
  });

  const { data: labelsData, isLoading: labelsLoading } = useQuery({
    queryKey: ["labels"],
    queryFn: fetchLabels
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskData, updateData }) => updateTask(taskData, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      onClose();
    },
    onError: (err) => {
      setError(`Error updating task: ${err.message}`);
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    if (!formData.Title.trim()) {
      setError("Task title is required");
      return;
    }

    let fullDueDate = null;
    if (formData.dueDate) {
      fullDueDate = `${formData.dueDate}T${formData.dueTime || '12:00'}:00.000Z`;
    }

    const submitData = {
      Title: formData.Title,
      Description: formData.Description || "",
      dueDate: fullDueDate,
      project: formData.project ? parseInt(formData.project, 10) : null,
    };

    if (formData.taskStatus) submitData.taskStatus = parseInt(formData.taskStatus, 10);
    if (formData.priority) submitData.priority = parseInt(formData.priority, 10);
    if (formData.assignee) submitData.assignee = parseInt(formData.assignee, 10);
    if (formData.labels.length > 0) submitData.labels = formData.labels;

    updateTaskMutation.mutate({
      taskData: task,
      updateData: submitData
    });
  };

  if (statusesLoading || prioritiesLoading || teamMembersLoading || labelsLoading) {
    return (
      <div className="add-task">
        <div className="add-task__header">
          <h2 className="add-task__title">Edit Task</h2>
          <button className="add-task__close" onClick={onClose}>×</button>
        </div>
        <div className="add-task__body">
          <p>Loading reference data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-task">
      <div className="add-task__header">
        <h2 className="add-task__title">Edit Task</h2>
        <button className="add-task__close" onClick={onClose}>×</button>
      </div>

      <div className="add-task__body">
        {error && <div className="add-task-form__error">{error}</div>}

        <form onSubmit={handleSubmit}>
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
              value={formData.Description || ""}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="add-task-form__row">
            <div className="add-task-form__group add-task-form__group--half">
              <label className="add-task-form__label" htmlFor="dueDate">Due Date</label>
              <input
                className="add-task-form__control"
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate || ""}
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
                value={formData.dueTime || "12:00"}
                onChange={handleChange}
              />
            </div>
          </div>

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
                <option value="">-- Select Status --</option>
                {statusesData?.data?.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name || `Status ${status.id}`}
                  </option>
                ))}
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
                <option value="">-- Select Priority --</option>
                {prioritiesData?.data?.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.priorityLevel || `Priority ${priority.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

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

          {/* LABELS DROPDOWN-STYLE MULTISELECT */}
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
              disabled={updateTaskMutation.isPending}
              className="button button--primary"
            >
              {updateTaskMutation.isPending ? "Saving..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
