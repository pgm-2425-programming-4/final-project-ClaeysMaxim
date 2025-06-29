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

export const deleteProject = async (projectId) => {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      let errorText = "Unknown error";
      try {
        errorText = await response.text();
      } catch (e) {}

      throw new Error(`Failed to delete project: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};

export const updateProjectStatus = async (project, isActive) => {
  try {
    const identifier = project.documentId;
    
    if (!identifier) {
      throw new Error('Invalid project data provided. Expected project object with documentId');
    }

    const response = await fetch(`${API_URL}/projects/${identifier}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        data: { isActive }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update project status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
};
