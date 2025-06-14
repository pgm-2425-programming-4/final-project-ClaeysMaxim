import { API_URL, API_TOKEN } from "../constants/constants";

export const fetchStatuses = async () => {
  try {
    const response = await fetch(`${API_URL}/statuses?sort=order:asc`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch statuses: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching statuses:", error);
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

    return response.json();
  } catch (error) {
    console.error("Error fetching priorities:", error);
    throw error;
  }
};

export const fetchTeamMembers = async () => {
  try {
    const response = await fetch(`${API_URL}/team-members?populate[0]=avatar`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch team members: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
};

export default {
  fetchStatuses,
  fetchPriorities,
  fetchTeamMembers,
};
