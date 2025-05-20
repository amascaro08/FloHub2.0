import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import AdminUpdates from "@/pages/AdminUpdates";
import Updates from "@/pages/Updates";
import Dashboard from "@/pages/Dashboard";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Login from "@/pages/Login";
import AuthRegister from "@/pages/AuthRegister";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/auth/register" component={AuthRegister} />
      <Route path="/admin/updates" component={AdminUpdates} />
      <Route path="/updates" component={Updates} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
