import { API_URL, API_TOKEN } from "../constants/constants";

export const fetchAssignees = async () => {
  try {
    const response = await fetch(`${API_URL}/team-members?populate=*`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch assignees: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching assignees:", error);
    throw error;
  }
};

export const createAssignee = async (assigneeData) => {
  try {
    const response = await fetch(`${API_URL}/team-members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(assigneeData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create assignee: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating assignee:", error);
    throw error;
  }
};

export const updateAssignee = async (assigneeData, updatedData) => {
  try {
    const identifier = assigneeData.documentId;
    
    if (!identifier) {
      throw new Error('Invalid assignee data provided. Expected assignee object with documentId');
    }

    const response = await fetch(`${API_URL}/team-members/${identifier}`, {
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
      throw new Error(`Failed to update assignee: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating assignee:", error);
    throw error;
  }
};

export const deleteAssignee = async (assigneeData) => {
  try {
    const identifier = assigneeData.documentId;
    
    if (!identifier) {
      throw new Error('Invalid assignee data provided. Expected assignee object with documentId');
    }

    const response = await fetch(`${API_URL}/team-members/${identifier}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete assignee: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting assignee:", error);
    throw error;
  }
};
