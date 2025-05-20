import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CalendarSettings from '@/components/calendar/CalendarSettings';
import { User, Settings as SettingsIcon, Bell, Key, Shield, Layout, Calendar } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6 max-w-6xl">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your FloHub experience and manage your integrations
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4">
            <Card className="sticky top-6">
              <CardContent className="p-4">
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  orientation="vertical" 
                  className="w-full"
                >
                  <TabsList className="flex flex-col h-auto items-stretch bg-transparent space-y-1">
                    <TabsTrigger 
                      value="profile" 
                      className="justify-start py-2"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger 
                      value="calendar" 
                      className="justify-start py-2"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Calendar
                    </TabsTrigger>
                    <TabsTrigger 
                      value="appearance" 
                      className="justify-start py-2"
                    >
                      <Layout className="h-4 w-4 mr-2" />
                      Appearance
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notifications" 
                      className="justify-start py-2"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </TabsTrigger>
                    <TabsTrigger 
                      value="security" 
                      className="justify-start py-2"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Security
                    </TabsTrigger>
                    <TabsTrigger 
                      value="api" 
                      className="justify-start py-2"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      API
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-3/4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="profile" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Manage your account information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-12">
                      Profile settings will be available in a future update.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar" className="mt-0">
                <CalendarSettings />
              </TabsContent>

              <TabsContent value="appearance" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize how FloHub looks and feels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-12">
                      Appearance settings will be available in a future update.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Manage how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-12">
                      Notification settings will be available in a future update.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your security preferences and connected devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-12">
                      Security settings will be available in a future update.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>API Settings</CardTitle>
                    <CardDescription>
                      Manage API keys and integrations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center py-12">
                      API settings will be available in a future update.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;