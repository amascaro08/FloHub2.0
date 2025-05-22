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
      'Accept': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export async function fetchTasks() {
  // Ensure the user is logged in first
  await ensureAuthenticated();
  
  const response = await fetch('/api/tasks', {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include'
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Try to refresh authentication
      const refreshed = await refreshAuthentication();
      if (refreshed) {
        return fetchTasks(); // Retry after refreshing auth
      }
    }
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

// Helper function to ensure user is authenticated
async function ensureAuthenticated() {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    // Try to log in with test credentials
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      });
      
      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        return true;
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Not authenticated');
    }
  }
  
  return isAuthenticated;
}

// Helper function to refresh authentication if needed
async function refreshAuthentication() {
  try {
    // Clear existing auth
    localStorage.removeItem('isAuthenticated');
    
    // Try to log in again
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to refresh authentication:', error);
    return false;
  }
}