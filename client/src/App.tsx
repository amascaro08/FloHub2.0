import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import AdminUpdates from "@/pages/AdminUpdates";
import Updates from "@/pages/Updates";
import DashboardDefault from "@/pages/Dashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

// Import dashboard pages
import DashboardIndex from "@/pages/dashboard/index";
import DashboardJournal from "@/pages/dashboard/journal";
import DashboardMeetings from "@/pages/dashboard/meetings";
import DashboardNotes from "@/pages/dashboard/notes";
import DashboardSettings from "@/pages/dashboard/settings";
import DashboardTasks from "@/pages/dashboard/tasks";

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
      <Route path="/dashboard" component={DashboardDefault} />
      <Route path="/dashboard/home" component={DashboardIndex} />
      <Route path="/dashboard/journal" component={DashboardJournal} />
      <Route path="/dashboard/meetings" component={DashboardMeetings} />
      <Route path="/dashboard/notes" component={DashboardNotes} />
      <Route path="/dashboard/settings" component={DashboardSettings} />
      <Route path="/dashboard/tasks" component={DashboardTasks} />
      
      {/* 404 Page */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
