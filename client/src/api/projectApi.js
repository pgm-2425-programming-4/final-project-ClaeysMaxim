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

export const createProject = async (projectData) => {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to create project: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};
