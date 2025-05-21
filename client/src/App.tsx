import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import AdminUpdates from "@/pages/AdminUpdates";
import Updates from "@/pages/Updates";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

// Dashboard Application Pages
import Journal from "@/pages/dashboard/Journal";
import Tasks from "@/pages/dashboard/Tasks";
import Notes from "@/pages/dashboard/Notes";
import Meetings from "@/pages/dashboard/Meetings";
import Settings from "@/pages/dashboard/Settings";

// Protected route component
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated via API or localStorage
    const checkAuth = async () => {
      try {
        // First check localStorage for quick auth
        const isStoredAuth = localStorage.getItem('isAuthenticated') === 'true';
        if (isStoredAuth) {
          console.log('Found auth in localStorage, proceeding');
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
        
        // If not in localStorage, check via API
        const response = await fetch('/api/auth/me', {
          credentials: 'include', // Important: include cookies in the request
          headers: {
            'Cache-Control': 'no-cache', // Disable caching
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Auth successful, user data:', userData);
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('user', JSON.stringify(userData));
          setIsAuthenticated(true);
        } else {
          console.warn('Authentication failed, redirecting to login');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('user');
          window.location.href = '/login'; // Use direct navigation instead of wouter
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Use direct navigation instead of wouter
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);  // Remove setLocation dependency to prevent re-renders

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }

  return isAuthenticated ? <Component {...rest} /> : null;
};

function App() {
  return (
    <Switch>
      {/* Marketing/Landing Pages */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin/updates" component={AdminUpdates} />
      <Route path="/updates" component={Updates} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      
      {/* Dashboard/Application Pages */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/dashboard/journal">
        <ProtectedRoute component={Journal} />
      </Route>
      <Route path="/dashboard/tasks">
        <ProtectedRoute component={Tasks} />
      </Route>
      <Route path="/dashboard/notes">
        <ProtectedRoute component={Notes} />
      </Route>
      <Route path="/dashboard/meetings">
        <ProtectedRoute component={Meetings} />
      </Route>
      <Route path="/dashboard/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      
      {/* 404 Page */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
