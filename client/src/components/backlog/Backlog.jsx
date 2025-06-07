import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TaskForm from "../tasks/TaskForm";

const Backlog = ({ tasks, project, projectId }) => {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setTimeout(() => {
      setSelectedTask(null);
      queryClient.invalidateQueries(["tasks"]);
    }, 300);
  };

  if (!tasks || tasks.length === 0) {
    return <p>No tasks found in the backlog.</p>;
  }

  // Get projectId from prop or extract from project object
  const resolvedProjectId = projectId || project?.id || project?.attributes?.id;

  return (
    <div className="backlog-container">
      {isFormOpen && selectedTask && (
        <div className="add-task-overlay">
          <TaskForm
            task={selectedTask}
            projectId={resolvedProjectId}
            onClose={handleCloseForm}
          />
        </div>
      )}
      
      <table className="task-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const id = task.id;
            const attributes = task.attributes || task;
            const title = attributes.Title || "No title";
            const description = attributes.Description || "No description";
            const dueDate = attributes.dueDate;

            // Get status and priority names
            let statusName = "Not set";
            let priorityName = "Not set";

            const statusData = attributes.taskStatus?.data || attributes.taskStatus;
            if (statusData) {
              statusName = statusData.attributes?.name || statusData.name || "Unnamed status";
            }

            const priorityData = attributes.priority?.data || attributes.priority;
            if (priorityData) {
              priorityName = 
                priorityData.attributes?.priorityLevel || 
                priorityData.priorityLevel || 
                "Unnamed priority";
            }

            return (
              <tr key={id} className="task-row">
                <td>{id}</td>
                <td>{title}</td>
                <td>
                  {description && description.length > 50
                    ? `${description.substring(0, 50)}...`
                    : description || "No description"}
                </td>
                <td>
                  {dueDate
                    ? new Date(dueDate).toLocaleDateString()
                    : "No deadline"}
                </td>
                <td>{statusName}</td>
                <td>{priorityName}</td>
                <td>
                  <button
                    onClick={() => handleTaskClick(task)}
                    className="button button--small button--primary"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Backlog;
