import { API_URL, API_TOKEN } from "../constants/constants";

export const fetchProjects = async () => {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};
