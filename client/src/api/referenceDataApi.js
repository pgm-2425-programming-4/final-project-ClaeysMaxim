import { API_URL, API_TOKEN } from "../constants/constants";

export const fetchStatuses = async () => {
  try {
    const response = await fetch(`${API_URL}/statuses?sort=order`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch statuses: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchPriorities = async () => {
  try {
    const response = await fetch(`${API_URL}/priorities`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch priorities: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchTeamMembers = async () => {
  try {
    const response = await fetch(`${API_URL}/team-members`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch team members: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
