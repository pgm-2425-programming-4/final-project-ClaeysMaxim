import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateTask } from "../../api/taskApi";
import { fetchStatuses, fetchPriorities, fetchTeamMembers } from "../../api/referenceDataApi";

function TaskForm({ task, projectId, onClose }) {
  const queryClient = useQueryClient();
  
  // Extract the project ID from the task if not provided as prop
  const taskProjectId = task?.project?.id || 
                       task?.attributes?.project?.data?.id || 
                       projectId;
                       
  // Extract task data - try to handle all possible formats
  const taskData = task?.attributes || task;
  
  // Extract status and priority IDs correctly
  let statusId = null;
  if (taskData?.taskStatus?.data?.id) {
    statusId = taskData.taskStatus.data.id;
  } else if (taskData?.taskStatus?.id) {
    statusId = taskData.taskStatus.id;
  } else if (typeof taskData?.taskStatus === 'number') {
    statusId = taskData.taskStatus;
  }

  let priorityId = null;
  if (taskData?.priority?.data?.id) {
    priorityId = taskData.priority.data.id;
  } else if (taskData?.priority?.id) {
    priorityId = taskData.priority.id;
  } else if (typeof taskData?.priority === 'number') {
    priorityId = taskData.priority;
  }
  
  // Initialize form data
  const initialTask = {
    Title: taskData.Title || "",
    Description: taskData.Description || "",
    dueDate: taskData.dueDate ? taskData.dueDate.substring(0, 10) : "",
    dueTime: taskData.dueDate ? taskData.dueDate.substring(11, 16) : "12:00",
    taskStatus: statusId || "",
    priority: priorityId || "",
    assignee: taskData.assignee?.data?.id || taskData.assignee?.id || "",
    project: taskProjectId
  };

  const [formData, setFormData] = useState(initialTask);
  const [error, setError] = useState("");

  // Query for statuses using same pattern as AddTaskForm
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

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskData, updateData }) => {
      return updateTask(taskData, updateData);
    },
    onSuccess: (result) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.Title.trim()) {
      setError("Task title is required");
      return;
    }

    // Format date and time for Strapi
    let fullDueDate = null;
    if (formData.dueDate) {
      fullDueDate = `${formData.dueDate}T${formData.dueTime || '12:00'}:00.000Z`;
    }

    // Create the update data using EXACTLY the structure from KanbanBoard
    const submitData = {
      Title: formData.Title,
      Description: formData.Description || "",
      dueDate: fullDueDate,
      project: formData.project ? parseInt(formData.project, 10) : null,
    };

    // Add relations if they are set - using the same pattern as KanbanBoard
    if (formData.taskStatus) {
      submitData.taskStatus = parseInt(formData.taskStatus, 10);
    }
    
    if (formData.priority) {
      submitData.priority = parseInt(formData.priority, 10);
    }
    
    if (formData.assignee) {
      submitData.assignee = parseInt(formData.assignee, 10);
    }

    updateTaskMutation.mutate({ 
      taskData: task,  // Pass the entire task object
      updateData: submitData 
    });
  };

  if (statusesLoading || prioritiesLoading || teamMembersLoading) {
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
          {/* Title field */}
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

          {/* Description field */}
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

          {/* Date and time fields */}
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

          {/* Status selection - COPY FROM ADDTASKFORM */}
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
                {statusesLoading ? (
                  <option value="">Loading statuses...</option>
                ) : !statusesData?.data?.length ? (
                  <option value="">No statuses available</option>
                ) : (
                  [...statusesData.data]
                    .sort((a, b) => (a.attributes?.order || 0) - (b.attributes?.order || 0))
                    .map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.attributes?.name || status.name || `Status ${status.id}`}
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
                <option value="">-- Select Priority --</option>
                {prioritiesLoading ? (
                  <option value="">Loading priorities...</option>
                ) : !prioritiesData?.data?.length ? (
                  <option value="">No priorities available</option>
                ) : (
                  prioritiesData.data.map((priority) => (
                    <option key={priority.id} value={priority.id}>
                      {priority.attributes?.priorityLevel || priority.priorityLevel || `Priority ${priority.id}`}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Assignee selection */}
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
              {teamMembersData?.data && teamMembersData.data.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.attributes?.displayName || member.displayName || `Member ${member.id}`}
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
