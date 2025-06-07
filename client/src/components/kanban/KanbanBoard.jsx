import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasks, updateTaskStatus } from "../../api/taskApi";
import { fetchStatuses } from "../../api/referenceDataApi";
import { API_URL, API_TOKEN } from "../../constants/constants";

const KanbanBoard = ({ projectId }) => {
  const queryClient = useQueryClient();
  const [columns, setColumns] = useState({});
  const [draggingTask, setDraggingTask] = useState(null);

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

  // Mutation for updating task status
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, statusId }) => {
      console.log(`Mutation: Update task ${taskId} to status ${statusId}`);
      
      // Direct API call to update task status - this should be more reliable
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            taskStatus: statusId
          }
        }),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", errorText);
        throw new Error(`Update failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    },
    onSuccess: (data) => {
      console.log("Task status updated successfully:", data);
      queryClient.invalidateQueries(["tasks", numericProjectId]);
    },
    onError: (error) => {
      console.error("Failed to update task status:", error);
      alert(`Error updating task: ${error.message}`);
    }
  });

  // Organize tasks into columns by status when data is available
  useEffect(() => {
    if (tasksData?.data && statusesData?.data) {
      const newColumns = {};
      
      // Create a column for each status
      statusesData.data.forEach(status => {
        if (status && status.id) {
          newColumns[status.id] = {
            id: status.id,
            name: status.attributes?.name || "Unnamed Status",
            tasks: [],
          };
        }
      });
      
      // Assign tasks to their status columns
      tasksData.data.forEach(task => {
        // Get the status ID from the task data
        const statusId = task?.attributes?.taskStatus?.data?.id;
                         
        if (statusId && newColumns[statusId]) {
          newColumns[statusId].tasks.push(task);
        } else {
          // If task has no status and there are statuses, put it in the first column
          const firstStatusId = statusesData.data[0]?.id;
          if (firstStatusId && newColumns[firstStatusId]) {
            newColumns[firstStatusId].tasks.push(task);
          }
        }
      });
      
      setColumns(newColumns);
    }
  }, [tasksData, statusesData]);

  // Handle drag start
  const handleDragStart = (e, task) => {
    console.log("Dragging task:", task);
    setDraggingTask(task);
    e.dataTransfer.setData("taskId", task.id);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingTask(null);
  };

  // Handle drop in a column
  const handleDrop = (e, statusId) => {
    e.preventDefault();
    
    // Get task ID directly from the drag data
    const taskId = e.dataTransfer.getData("taskId");
    
    if (!taskId) {
      console.error("No task ID in drag data");
      return;
    }
    
    console.log(`Dropping task ${taskId} into status ${statusId}`);
    
    // Update task status
    updateTaskMutation.mutate({ taskId, statusId });
  };

  // Handle drag over event
  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

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
      <div className="kanban__board">
        {Object.values(columns).map((column) => (
          <div 
            key={column.id} 
            className="kanban__column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="kanban__column-header">
              <h3 className="kanban__column-title">{column.name}</h3>
              <span className="kanban__column-count">{column.tasks.length}</span>
            </div>
            <div className="kanban__tasks">
              {column.tasks.map((task) => {
                // Get task data from attributes
                const taskData = task?.attributes;
                const taskId = task?.id;
                const taskTitle = taskData?.Title;
                const taskDescription = taskData?.Description;
                
                // Get priority data
                const priorityData = taskData?.priority?.data?.attributes;
                const priorityLevel = priorityData?.priorityLevel || "Medium";
                const priorityColor = priorityData?.color || "#888";
                
                // Get assignee data
                const assigneeData = taskData?.assignee?.data?.attributes;
                const assigneeName = assigneeData?.displayName;
                
                // Get due date
                const dueDate = taskData?.dueDate;
                const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString() : null;
                
                return (
                  <div 
                    key={taskId}
                    className="task-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="task-card__header">
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: priorityColor }}
                      >
                        {priorityLevel}
                      </span>
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
                            {assigneeName.substring(0, 2).toUpperCase()}
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