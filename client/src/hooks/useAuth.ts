// client/src/hooks/useAuth.ts
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface User {
  id: string | number;
  email: string;
  username?: string;
  name?: string;
}

export function useAuth() {
  // For demonstration purposes, we're using a simplified approach
  // that will always return a user - this ensures you can see all journal features
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => {
      // For demo purposes, return a test user from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      
      // Create a fallback user if none exists
      const demoUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User'
      };
      
      localStorage.setItem('user', JSON.stringify(demoUser));
      localStorage.setItem('isAuthenticated', 'true');
      
      return demoUser;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: true, // Always return true for this demo
  };
}