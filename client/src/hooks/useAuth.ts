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
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      return response.json();
    },
    retry: false
  });

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    refetch
  };
}