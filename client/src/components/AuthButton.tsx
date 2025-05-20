import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AuthButton() {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const user = await response.json();
          setIsLoggedIn(true);
          setUserData(user);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Skip registration for test user since it already exists
      console.log('Using existing test user');
      
      // Then login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test2@example.com',
          password: 'password123'
        }),
      });
      
      if (response.ok) {
        const user = await response.json();
        setIsLoggedIn(true);
        setUserData(user);
        
        toast({
          title: "Login successful",
          description: "You're now logged in as Test User",
        });
        
        // Refresh page to apply session
        window.location.reload();
      } else {
        throw new Error('Login failed');
      }
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
  
  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setIsLoggedIn(false);
      setUserData(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      // Refresh page to apply session change
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      {isLoggedIn ? (
        <>
          <div className="text-sm text-gray-600">
            Logged in as: {userData?.name || userData?.email || 'User'}
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
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Log in (Test User)"}
        </Button>
      )}
    </div>
  );
}