import { API_URL, API_TOKEN } from "../constants/constants";

export const fetchLabels = async () => {
  try {
    const response = await fetch(`${API_URL}/labels`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch labels: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching labels:", error);
    throw error;
  }
};

export const createLabel = async (labelData) => {
  try {
    const response = await fetch(`${API_URL}/labels`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(labelData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create label: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating label:", error);
    throw error;
  }
};

export const deleteLabel = async (labelData) => {
  try {
    const identifier = labelData.documentId;
    
    if (!identifier) {
      throw new Error('Invalid label data provided. Expected label object with documentId');
    }

    const response = await fetch(`${API_URL}/labels/${identifier}`, {
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
      throw new Error(`Failed to delete label: ${response.status} - ${errorText}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting label:", error);
    throw error;
  }
};

