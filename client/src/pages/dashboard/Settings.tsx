import React, { useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Settings Dashboard Component
export default function SettingsPage() {
  // User Profile State
  const [profile, setProfile] = useState({
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: '',
    title: 'Product Manager',
    bio: 'Experienced product manager focused on creating intuitive user experiences.',
    timezone: 'America/New_York',
    theme: 'system'
  });

  // Notification Settings State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    meetingReminders: true,
    taskReminders: true,
    systemUpdates: false,
    notifyBeforeDue: 1
  });

  // Application Settings State
  const [appSettings, setAppSettings] = useState({
    defaultView: 'dashboard',
    language: 'en',
    startDayOfWeek: 'monday',
    calendarDefaultView: 'week',
    taskCompletionSound: true,
    autoArchiveCompleted: true
  });

  // Integration Settings State
  const [integrations, setIntegrations] = useState({
    googleCalendar: false,
    outlook: false,
    slack: false,
    zoom: false,
    github: false,
    notion: false
  });

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'app' | 'integrations' | 'account'>('profile');

  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to the server
    alert('Profile settings saved successfully!');
  };

  // Handle notifications form submission
  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to the server
    alert('Notification settings saved successfully!');
  };

  // Handle app settings form submission
  const handleAppSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to the server
    alert('Application settings saved successfully!');
  };

  // Handle integration form submission
  const handleIntegrationsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to the server
    alert('Integration settings saved successfully!');
  };

  // Handle connect external service
  const handleConnectService = (service: string) => {
    // In a real app, this would redirect to OAuth flow
    alert(`Connecting to ${service}...`);
    setIntegrations({
      ...integrations,
      [service]: true
    });
  };

  // Handle disconnect external service
  const handleDisconnectService = (service: string) => {
    // In a real app, this would revoke access tokens
    alert(`Disconnecting from ${service}...`);
    setIntegrations({
      ...integrations,
      [service]: false
    });
  };

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'profile' 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'notifications' 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('app')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'app' 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Application Settings
                </button>
                <button
                  onClick={() => setActiveTab('integrations')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'integrations' 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Integrations
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'account' 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Account
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-6">Profile Settings</h2>
                  <form onSubmit={handleProfileSubmit}>
                    <div className="space-y-6">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl">
                            {profile.avatar ? (
                              <img 
                                src={profile.avatar} 
                                alt={profile.name} 
                                className="h-20 w-20 rounded-full object-cover"
                              />
                            ) : (
                              profile.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profile Picture
                          </label>
                          <input
                            type="file"
                            className="text-sm text-gray-500"
                            accept="image/*"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            JPG, PNG or GIF. Maximum size 2MB.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Title
                        </label>
                        <input
                          type="text"
                          value={profile.title}
                          onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bio
                        </label>
                        <textarea
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time Zone
                        </label>
                        <select
                          value={profile.timezone}
                          onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                          <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                          <option value="Europe/Paris">Central European Time (CET)</option>
                        </select>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-6">Notification Settings</h2>
                  <form onSubmit={handleNotificationsSubmit}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              Receive email notifications
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications.emailNotifications}
                                onChange={() => setNotifications({
                                  ...notifications,
                                  emailNotifications: !notifications.emailNotifications
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Push Notifications</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              Enable browser push notifications
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications.pushNotifications}
                                onChange={() => setNotifications({
                                  ...notifications,
                                  pushNotifications: !notifications.pushNotifications
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Reminders</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              Meeting reminders
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications.meetingReminders}
                                onChange={() => setNotifications({
                                  ...notifications,
                                  meetingReminders: !notifications.meetingReminders
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              Task reminders
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications.taskReminders}
                                onChange={() => setNotifications({
                                  ...notifications,
                                  taskReminders: !notifications.taskReminders
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              System updates and announcements
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications.systemUpdates}
                                onChange={() => setNotifications({
                                  ...notifications,
                                  systemUpdates: !notifications.systemUpdates
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Reminder Timing</h3>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-700 mr-3">
                            Notify me
                          </span>
                          <select
                            value={notifications.notifyBeforeDue}
                            onChange={(e) => setNotifications({
                              ...notifications,
                              notifyBeforeDue: parseInt(e.target.value)
                            })}
                            className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          >
                            <option value={0}>At the time due</option>
                            <option value={5}>5 minutes before</option>
                            <option value={10}>10 minutes before</option>
                            <option value={15}>15 minutes before</option>
                            <option value={30}>30 minutes before</option>
                            <option value={60}>1 hour before</option>
                            <option value={120}>2 hours before</option>
                            <option value={1440}>1 day before</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Application Settings */}
              {activeTab === 'app' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-6">Application Settings</h2>
                  <form onSubmit={handleAppSettingsSubmit}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Interface</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Default View
                            </label>
                            <select
                              value={appSettings.defaultView}
                              onChange={(e) => setAppSettings({
                                ...appSettings,
                                defaultView: e.target.value
                              })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            >
                              <option value="dashboard">Dashboard</option>
                              <option value="tasks">Tasks</option>
                              <option value="calendar">Calendar</option>
                              <option value="notes">Notes</option>
                              <option value="journal">Journal</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Language
                            </label>
                            <select
                              value={appSettings.language}
                              onChange={(e) => setAppSettings({
                                ...appSettings,
                                language: e.target.value
                              })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                              <option value="de">German</option>
                              <option value="ja">Japanese</option>
                              <option value="zh">Chinese</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Theme</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div
                            className={`p-4 border rounded-md cursor-pointer ${profile.theme === 'light' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}
                            onClick={() => setProfile({ ...profile, theme: 'light' })}
                          >
                            <div className="h-20 bg-white border border-gray-200 mb-2 rounded"></div>
                            <div className="text-center text-sm font-medium">Light</div>
                          </div>
                          <div
                            className={`p-4 border rounded-md cursor-pointer ${profile.theme === 'dark' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}
                            onClick={() => setProfile({ ...profile, theme: 'dark' })}
                          >
                            <div className="h-20 bg-gray-800 border border-gray-700 mb-2 rounded"></div>
                            <div className="text-center text-sm font-medium">Dark</div>
                          </div>
                          <div
                            className={`p-4 border rounded-md cursor-pointer ${profile.theme === 'system' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:bg-gray-50'}`}
                            onClick={() => setProfile({ ...profile, theme: 'system' })}
                          >
                            <div className="h-20 bg-gradient-to-r from-white to-gray-800 mb-2 rounded"></div>
                            <div className="text-center text-sm font-medium">System</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Calendar Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Start Day of Week
                            </label>
                            <select
                              value={appSettings.startDayOfWeek}
                              onChange={(e) => setAppSettings({
                                ...appSettings,
                                startDayOfWeek: e.target.value
                              })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            >
                              <option value="sunday">Sunday</option>
                              <option value="monday">Monday</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-700 mb-1">
                              Default Calendar View
                            </label>
                            <select
                              value={appSettings.calendarDefaultView}
                              onChange={(e) => setAppSettings({
                                ...appSettings,
                                calendarDefaultView: e.target.value
                              })}
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                            >
                              <option value="day">Day</option>
                              <option value="week">Week</option>
                              <option value="month">Month</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Task Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              Play sound when task is completed
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={appSettings.taskCompletionSound}
                                onChange={() => setAppSettings({
                                  ...appSettings,
                                  taskCompletionSound: !appSettings.taskCompletionSound
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">
                              Auto-archive completed tasks after 7 days
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={appSettings.autoArchiveCompleted}
                                onChange={() => setAppSettings({
                                  ...appSettings,
                                  autoArchiveCompleted: !appSettings.autoArchiveCompleted
                                })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Integrations */}
              {activeTab === 'integrations' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-6">Integrations</h2>
                  <form onSubmit={handleIntegrationsSubmit}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Calendar Services</h3>
                        <div className="space-y-4">
                          <div className="border rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="h-10 w-10 mr-3 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                  G
                                </div>
                                <div>
                                  <h4 className="font-medium">Google Calendar</h4>
                                  <p className="text-sm text-gray-500">
                                    Sync your Google Calendar events
                                  </p>
                                </div>
                              </div>
                              {integrations.googleCalendar ? (
                                <button
                                  type="button"
                                  onClick={() => handleDisconnectService('googleCalendar')}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                >
                                  Disconnect
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleConnectService('googleCalendar')}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="border rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="h-10 w-10 mr-3 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                  O
                                </div>
                                <div>
                                  <h4 className="font-medium">Outlook Calendar</h4>
                                  <p className="text-sm text-gray-500">
                                    Sync your Outlook Calendar events
                                  </p>
                                </div>
                              </div>
                              {integrations.outlook ? (
                                <button
                                  type="button"
                                  onClick={() => handleDisconnectService('outlook')}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                >
                                  Disconnect
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleConnectService('outlook')}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Communication</h3>
                        <div className="space-y-4">
                          <div className="border rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="h-10 w-10 mr-3 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
                                  S
                                </div>
                                <div>
                                  <h4 className="font-medium">Slack</h4>
                                  <p className="text-sm text-gray-500">
                                    Receive notifications and updates in Slack
                                  </p>
                                </div>
                              </div>
                              {integrations.slack ? (
                                <button
                                  type="button"
                                  onClick={() => handleDisconnectService('slack')}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                >
                                  Disconnect
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleConnectService('slack')}
                                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="border rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="h-10 w-10 mr-3 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                  Z
                                </div>
                                <div>
                                  <h4 className="font-medium">Zoom</h4>
                                  <p className="text-sm text-gray-500">
                                    Create and join Zoom meetings easily
                                  </p>
                                </div>
                              </div>
                              {integrations.zoom ? (
                                <button
                                  type="button"
                                  onClick={() => handleDisconnectService('zoom')}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                >
                                  Disconnect
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleConnectService('zoom')}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Other Services</h3>
                        <div className="space-y-4">
                          <div className="border rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="h-10 w-10 mr-3 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                  G
                                </div>
                                <div>
                                  <h4 className="font-medium">GitHub</h4>
                                  <p className="text-sm text-gray-500">
                                    Connect your GitHub repositories
                                  </p>
                                </div>
                              </div>
                              {integrations.github ? (
                                <button
                                  type="button"
                                  onClick={() => handleDisconnectService('github')}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                >
                                  Disconnect
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleConnectService('github')}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="border rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="h-10 w-10 mr-3 flex items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                  N
                                </div>
                                <div>
                                  <h4 className="font-medium">Notion</h4>
                                  <p className="text-sm text-gray-500">
                                    Import and sync with Notion pages
                                  </p>
                                </div>
                              </div>
                              {integrations.notion ? (
                                <button
                                  type="button"
                                  onClick={() => handleDisconnectService('notion')}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                >
                                  Disconnect
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleConnectService('notion')}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                  Connect
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-lg font-medium text-gray-800 mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Subscription</h3>
                      <div className="bg-teal-50 p-4 rounded-md border border-teal-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-teal-800">Premium Plan</h4>
                            <p className="text-sm text-teal-600">
                              Your subscription renews on July 15, 2025
                            </p>
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1 bg-white text-teal-700 border border-teal-300 rounded-md hover:bg-teal-50"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <button
                            type="button"
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                          >
                            Update Password
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Export Data</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Download a copy of your data. This includes all your tasks, notes, meetings, and journal entries.
                      </p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        Export Data
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-red-600 mb-3">Danger Zone</h3>
                      <div className="border border-red-200 rounded-md p-4 bg-red-50">
                        <h4 className="font-medium text-red-700 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-600 mb-4">
                          This action is permanent and cannot be undone. All your data will be permanently deleted.
                        </p>
                        <button
                          type="button"
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}