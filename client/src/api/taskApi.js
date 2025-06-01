import { API_URL, API_TOKEN } from "../constants/constants";

export const fetchTasks = async (page = 1, pageSize = 10, projectId = null) => {
  try {
    if (!projectId) {
      return {
        data: [],
        meta: { pagination: { page, pageSize, pageCount: 0, total: 0 } },
      };
    }

    const url = `${API_URL}/tasks?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*&filters[project][id][$eq]=${projectId}`;

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
    return {
      data: [],
      meta: { pagination: { page, pageSize, pageCount: 0, total: 0 } },
    };
  }
};
