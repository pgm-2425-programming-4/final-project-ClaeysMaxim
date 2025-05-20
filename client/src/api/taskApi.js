const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN;

export const fetchTasks = async (page = 1, pageSize = 10) => {
  try {
    const url = `${API_URL}/tasks?pagination[page]=${page}&pagination[pageSize]=${pageSize}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
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
