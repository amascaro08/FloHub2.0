import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import AdminUpdates from "@/pages/AdminUpdates";
import Updates from "@/pages/Updates";
import Dashboard from "@/pages/Dashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

// Dashboard Application Pages
import Journal from "@/pages/dashboard/Journal";
import Tasks from "@/pages/dashboard/Tasks";
import Notes from "@/pages/dashboard/Notes";
import Meetings from "@/pages/dashboard/Meetings";
import Settings from "@/pages/dashboard/Settings";

function App() {
  return (
    <Switch>
      {/* Marketing/Landing Pages */}
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/admin/updates" component={AdminUpdates} />
      <Route path="/updates" component={Updates} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      
      {/* Dashboard/Application Pages */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/journal" component={Journal} />
      <Route path="/dashboard/tasks" component={Tasks} />
      <Route path="/dashboard/notes" component={Notes} />
      <Route path="/dashboard/meetings" component={Meetings} />
      <Route path="/dashboard/settings" component={Settings} />
      
      {/* 404 Page */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
