import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTasks } from "../../api/taskApi";
import { fetchStatuses } from "../../api/referenceDataApi";
import { API_URL } from "../../constants/constants";
import TaskForm from "../tasks/TaskForm";

const KanbanBoard = ({ projectId, labelFilter }) => {
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Convert project ID to number if it's a string
  const numericProjectId = typeof projectId === 'string' ? parseInt(projectId, 10) : projectId;

  // Fetch tasks for the project
  const { 
    data: tasksData, 
    isLoading: tasksLoading,
    error: tasksError
  } = useQuery({
    queryKey: ["tasks", numericProjectId],
    queryFn: () => fetchTasks(1, 100, numericProjectId), // Get all tasks for the project
    enabled: !!numericProjectId,
  });

  // Fetch statuses
  const { 
    data: statusesData,
    isLoading: statusesLoading,
    error: statusesError
  } = useQuery({
    queryKey: ["statuses"],
    queryFn: fetchStatuses,
  });

  // Handle task click
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

  // Organize tasks into columns by status when data is available
  useEffect(() => {
    if (tasksData?.data && statusesData?.data) {
      const newColumns = {};
      
      // Filter out "Backlog" status from kanban columns
      const kanbanStatuses = statusesData.data.filter(status => 
        status.name?.toLowerCase() !== 'backlog'
      );
      
      // Create a column for each non-backlog status
      kanbanStatuses.forEach(status => {
        if (status && status.id) {
          newColumns[status.id] = {
            id: status.id,
            name: status.name || "Unnamed Status",
            tasks: [],
          };
        }
      });
      
      // Assign tasks to their status columns (excluding backlog tasks)
      tasksData.data.forEach(task => {
        const statusId = task.taskStatus?.id;
        const statusName = task.taskStatus?.name;
        
        // Only add tasks that are not in backlog status
        if (statusId && newColumns[statusId] && statusName?.toLowerCase() !== 'backlog') {
          // Apply label filter if selected
          if (!labelFilter || labelFilter.length === 0) {
            // No filter applied, show all tasks
            newColumns[statusId].tasks.push(task);
          } else {
            // Check if task has any of the selected labels
            const hasSelectedLabel = task.labels?.some(label => 
              labelFilter.includes(label.documentId) || labelFilter.includes(label.id)
            );
            if (hasSelectedLabel) {
              newColumns[statusId].tasks.push(task);
            }
          }
        }
      });
      
      setColumns(newColumns);
    }
  }, [tasksData, statusesData, labelFilter]);

  if (tasksLoading || statusesLoading) {
    return <div className="loading">Loading kanban board...</div>;
  }

  if (tasksError || statusesError) {
    return <div className="error">Error loading kanban board. Please try again.</div>;
  }

  if (!statusesData?.data?.length || Object.keys(columns).length === 0) {
    return <div className="empty-message">No statuses found. Please create some statuses first.</div>;
  }

  return (
    <section className="kanban">
      {isFormOpen && selectedTask && (
        <div className="add-task-overlay">
          <TaskForm
            task={selectedTask}
            projectId={numericProjectId}
            onClose={handleCloseForm}
          />
        </div>
      )}

      <div className="kanban__board">
        {Object.values(columns).map((column) => (
          <div key={column.id} className="kanban__column">
            <div className="kanban__column-header">
              <h3 className="kanban__column-title">{column.name}</h3>
              <span className="kanban__column-count">{column.tasks.length}</span>
            </div>
            <div className="kanban__tasks">
              {column.tasks.map((task) => {
                // Get task data - direct access since it's not nested under attributes
                const taskId = task.id;
                const taskTitle = task.Title;
                const taskDescription = task.Description;
                
                // Get priority data
                const priorityLevel = task.priority?.priorityLevel || "Low";
                const priorityColor = task.priority?.color || "#888";
                
                // Get assignee data
                const assigneeName = task.assignee?.displayName;
                
                // Get due date
                const dueDate = task.dueDate;
                const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString() : null;
                
                return (
                  <div 
                    key={taskId}
                    className="task-card task-card--clickable"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="task-card__header">
                      <div className="task-card__header-left">
                        <span 
                          className={`priority-badge priority-badge--${priorityLevel.toLowerCase()}`}
                        >
                          {priorityLevel}
                        </span>
                      </div>
                      <div className="task-card__header-right">
                        <div className={`task-card__labels ${!task.labels?.length ? 'task-card__labels--empty' : ''}`}>
                          {task.labels && task.labels.map((label) => (
                            <span key={label.id} className="label-badge">
                              {label.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <h4 className="task-card__title">{taskTitle}</h4>
                    {taskDescription && (
                      <p className="task-card__description">
                        {taskDescription.length > 100
                          ? `${taskDescription.substring(0, 100)}...`
                          : taskDescription}
                      </p>
                    )}
                    <div className="task-card__footer">
                      {assigneeName && (
                        <div className="task-card__assignee">
                          <div className="task-card__avatar">
                            {task.assignee?.avatar?.url ? (
                              <img 
                                src={task.assignee.avatar.url.startsWith('http') ? 
                                  task.assignee.avatar.url : 
                                  `${API_URL.replace('/api', '')}${task.assignee.avatar.url}`
                                } 
                                alt={assigneeName}
                                className="task-card__avatar-image"
                              />
                            ) : (
                              assigneeName.substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <span>{assigneeName}</span>
                        </div>
                      )}
                      {formattedDate && (
                        <div className="task-card__due">{formattedDate}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KanbanBoard;