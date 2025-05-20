// client/src/hooks/useAuth.ts
import { useQuery } from "@tanstack/react-query";

interface User {
  id: string | number;
  email: string;
  username?: string;
  name?: string;
}

export function useAuth() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => fetch("/api/auth/me").then(res => {
      if (!res.ok) throw new Error("Not authenticated");
      return res.json();
    }),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
  };
}