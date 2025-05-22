// client/src/hooks/useAuth.ts
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string | number;
  email: string;
  username?: string;
  name?: string;
}

export function useAuth() {
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const userId = storedUser ? JSON.parse(storedUser).id : null;

        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${userId}`
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error('Authentication failed');
        }
        
        return response.json();
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
    retry: 0,
    refetchOnWindowFocus: true
  });

  return {
    user,
    session: user ? { user } : null,
    isLoading,
    isError,
    isAuthenticated: !!user,
    refetch
  };
}