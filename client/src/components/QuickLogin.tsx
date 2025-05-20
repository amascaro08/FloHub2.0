import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function QuickLogin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    const storedUserId = localStorage.getItem('floHubUserId');
    if (storedUserId) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
    }
  }, []);

  const handleDirectLogin = async () => {
    setIsLoading(true);
    try {
      // Create direct login bypass
      const mockUserId = '3'; // ID of our test user
      localStorage.setItem('floHubUserId', mockUserId);
      setIsLoggedIn(true);
      setUserId(mockUserId);
      
      toast({
        title: "Login successful",
        description: "You're now logged in as Test User",
      });
      
      // Force refresh to apply login
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Could not log in automatically",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('floHubUserId');
      setIsLoggedIn(false);
      setUserId(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      // Force refresh to apply logout
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      {isLoggedIn ? (
        <>
          <div className="text-sm text-gray-600">
            Logged in as: Test User (ID: {userId})
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : "Log out"}
          </Button>
        </>
      ) : (
        <Button 
          onClick={handleDirectLogin}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Quick Login (Test User)"}
        </Button>
      )}
    </div>
  );
}