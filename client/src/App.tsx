import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import AdminUpdates from "@/pages/AdminUpdates";
import Updates from "@/pages/Updates";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/admin/updates" component={AdminUpdates} />
      <Route path="/updates" component={Updates} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
