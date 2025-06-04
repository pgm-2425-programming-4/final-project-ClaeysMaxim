import { API_URL, API_TOKEN } from "../constants/constants";

export const fetchTasks = async (page = 1, pageSize = 10, projectId) => {
  try {
    let url = `${API_URL}/tasks?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`;

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
    // Return empty data on error
    return {
      data: [],
      meta: { pagination: { page, pageSize, pageCount: 0, total: 0 } },
    };
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to create task: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};
