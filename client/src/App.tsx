import React from 'react';
import { Route, Switch } from 'wouter';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Simple UpdatesPage component
const UpdatesPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-primary-600 mb-4">FloHub Updates</h1>
      <p className="text-lg mb-6">Check back soon for the latest updates about FloHub.</p>
      <a href="/" className="text-primary-600 hover:underline">Return to Home</a>
    </div>
  );
};

// Create simple NotFound component
const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-primary-600 mb-4">404</h1>
      <h2 className="text-2xl mb-6">Page Not Found</h2>
      <a href="/" className="text-primary-600 hover:underline">Return to Home</a>
    </div>
  );
};

export default function App() {
  return (
    <div className="app-container">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/updates" component={UpdatesPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}