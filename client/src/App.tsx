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
import Meetings from "@/pages/dashboard/MeetingsBasic";
import Settings from "@/pages/dashboard/Settings";

// Protected route component
// Simplified authentication for demo purposes
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  // For the demo, we're creating a simplified authentication approach
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Store test user details in localStorage
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      username: 'testuser'
    }));
    
    // Simulate authentication check for demo
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>;
  }
  
  // Always render the component for this demo
  return <Component {...rest} />;


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
