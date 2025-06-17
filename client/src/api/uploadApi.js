import { API_URL, API_TOKEN } from "../constants/constants";

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.status}`);
    }

    const result = await response.json();
    return result[0]; // Strapi returns array, we need first item
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const deleteFile = async (fileId) => {
  try {
    const response = await fetch(`${API_URL}/upload/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};
