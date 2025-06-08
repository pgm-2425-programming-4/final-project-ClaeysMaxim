import { API_URL, API_TOKEN } from "../constants/constants";

export const fetchTasks = async (page = 1, pageSize = 10, projectId = null) => {
  try {
    let url = `${API_URL}/tasks?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    
    if (projectId) {
      url += `&filters[project][id][$eq]=${projectId}`;
    }
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (taskData, updatedData) => {
  try {
    const identifier = taskData.documentId;
    
    if (!identifier) {
      throw new Error('Invalid task data provided. Expected task object with documentId');
    }

    const response = await fetch(`${API_URL}/tasks/${identifier}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        data: updatedData
      }),
    });
    
    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
        console.error('Error response:', errorData);
      } catch (e) {
        errorText = await response.text();
      }
      
      throw new Error(`Failed to update task: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error(`Error updating task:`, error);
    throw error;
  }
};

// Convenience function for status updates (used by KanbanBoard)
export const updateTaskStatus = async (taskId, statusId) => {
  return updateTask(taskId, { taskStatus: statusId });
};

export const deleteTask = async (taskData) => {
  try {
    const identifier = taskData.documentId;
    
    if (!identifier) {
      throw new Error('Invalid task data provided. Expected task object with documentId');
    }

    const response = await fetch(`${API_URL}/tasks/${identifier}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = JSON.stringify(errorData);
        console.error('Error response:', errorData);
      } catch (e) {
        errorText = await response.text();
      }
      
      throw new Error(`Failed to delete task: ${response.status} - ${errorText}`);
    }

    return { success: true };
    
  } catch (error) {
    console.error(`Error deleting task:`, error);
    throw error;
  }
};