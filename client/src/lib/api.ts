/**
 * Utility function for making API requests to our backend
 */
export const apiRequest = async (
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
) => {
  const options: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export async function fetchTasks() {
  // Get stored user ID for auth
  const user = localStorage.getItem('user');
  const userId = user ? JSON.parse(user).id : null;

  const response = await fetch('/api/tasks', {
    headers: {
      'Authorization': `Bearer ${userId}`,
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}