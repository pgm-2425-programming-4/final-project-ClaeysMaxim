import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import TaskForm from "../tasks/TaskForm";
import ConfirmDialog from "../ui/ConfirmDialog";
import { deleteTask } from "../../api/taskApi";

const Backlog = ({ tasks, project, projectId }) => {
  const queryClient = useQueryClient();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
        queryClient.invalidateQueries(["tasks"]);
        setIsDeleteDialogOpen(false);
        setTaskToDelete(null);
      } catch (error) {
        console.error("Error deleting task:", error);
        alert(`Error deleting task: ${error.message}`);
      }
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
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

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.attributes?.Title || taskToDelete?.Title}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      
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
            const title = task.Title || "No title";
            const description = task.Description || "No description";
            const dueDate = task.dueDate;

            // Get status and priority names - direct access
            const statusName = task.taskStatus?.name || "Not set";
            const priorityName = task.priority?.priorityLevel || "Not set";

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
                  <button
                    onClick={() => handleDeleteClick(task)}
                    className="button button--small button--danger"
                  >
                    Delete
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
