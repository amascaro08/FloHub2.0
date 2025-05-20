import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface CalendarSource {
  id: number;
  name: string;
  type: 'google' | 'o365' | 'microsoft' | 'url';
  isEnabled: boolean;
  tags: string[] | null;
  sourceId?: string;
  url?: string;
  lastSyncTime?: string | null;
}

export default function CalendarIntegrationSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState({
    fetching: false,
    google: false,
    microsoft: false,
    url: false,
    toggle: false,
    remove: false
  });
  
  // Fetch calendar sources from the backend
  const { data: calendarSources = [], isLoading: isLoadingSources, refetch: refetchSources } = useQuery({
    queryKey: ['/api/calendar/sources'],
    queryFn: async () => {
      setIsLoading(prev => ({ ...prev, fetching: true }));
      try {
        const response = await fetch('/api/calendar/sources');
        if (!response.ok) {
          throw new Error('Failed to fetch calendar sources');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching calendar sources:', error);
        return [];
      } finally {
        setIsLoading(prev => ({ ...prev, fetching: false }));
      }
    },
    refetchOnWindowFocus: false,
  });
  const [powerAutomateUrl, setPowerAutomateUrl] = useState('');

  // For new calendar sources
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarTags, setNewCalendarTags] = useState('');

  const handleConnectGoogle = async () => {
    // Prepare the OAuth redirect
    toast({
      title: "Google Authentication",
      description: "Redirecting to Google for authentication...",
    });
    
    try {
      // Get the OAuth URL from the server
      const response = await fetch('/api/calendar/google/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calendarName: newCalendarName || 'My Google Calendar',
          tags: newCalendarTags ? newCalendarTags.split(',').map(tag => tag.trim()) : []
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get authentication URL');
      }
      
      const data = await response.json();
      
      // Save current settings in localStorage before redirect
      const calSettings = {
        name: newCalendarName || 'My Google Calendar',
        tags: newCalendarTags ? newCalendarTags.split(',').map(tag => tag.trim()) : []
      };
      localStorage.setItem('calendarSettings', JSON.stringify(calSettings));
      
      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Could not connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
      console.error('Google auth error:', error);
    }
  };

  const handleConnectOffice365 = async () => {
    // Prepare the OAuth redirect
    toast({
      title: "Microsoft Authentication",
      description: "Redirecting to Microsoft for authentication...",
    });
    
    try {
      // Get the OAuth URL from the server
      const response = await fetch('/api/calendar/microsoft/auth-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calendarName: newCalendarName || 'My Office 365 Calendar',
          tags: newCalendarTags ? newCalendarTags.split(',').map(tag => tag.trim()) : []
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get authentication URL');
      }
      
      const data = await response.json();
      
      // Save current settings in localStorage before redirect
      const calSettings = {
        name: newCalendarName || 'My Office 365 Calendar',
        tags: newCalendarTags ? newCalendarTags.split(',').map(tag => tag.trim()) : []
      };
      localStorage.setItem('calendarSettings', JSON.stringify(calSettings));
      
      // Redirect to Microsoft OAuth
      window.location.href = data.authUrl;
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "Could not connect to Office 365 Calendar. Please try again.",
        variant: "destructive",
      });
      console.error('Microsoft auth error:', error);
    }
  };

  const handleAddPowerAutomateUrl = async () => {
    if (!powerAutomateUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid Power Automate URL",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(prev => ({ ...prev, url: true }));
      
      // Save the Power Automate URL to the backend
      const response = await fetch('/api/calendar/url-source', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCalendarName || 'Power Automate Calendar',
          url: powerAutomateUrl,
          tags: newCalendarTags ? newCalendarTags.split(',').map(tag => tag.trim()) : []
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save calendar source');
      }
      
      // Refresh sources list
      refetchSources();
      
      // Reset form fields
      setNewCalendarName('');
      setNewCalendarTags('');
      setPowerAutomateUrl('');
      
      toast({
        title: "Calendar Connected",
        description: `Power Automate URL calendar added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add Power Automate calendar. Please try again.",
        variant: "destructive",
      });
      console.error('Power Automate save error:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, url: false }));
    }
  };

  const toggleCalendarEnabled = async (id: string, currentlyEnabled: boolean) => {
    try {
      setIsLoading(prev => ({ ...prev, toggle: true }));
      
      const response = await fetch(`/api/calendar/sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isEnabled: !currentlyEnabled
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update calendar source');
      }
      
      // Refresh sources after update
      refetchSources();
      
      toast({
        title: "Calendar Source Updated",
        description: `Calendar source has been ${!currentlyEnabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      console.error('Toggle calendar enabled error:', error);
      toast({
        title: "Error",
        description: "Failed to update calendar source",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, toggle: false }));
    }
  };

  const removeCalendarSource = async (id: string) => {
    try {
      setIsLoading(prev => ({ ...prev, remove: true }));
      
      const response = await fetch(`/api/calendar/sources/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete calendar source');
      }
      
      // Refresh sources after deletion
      refetchSources();
      
      toast({
        title: "Calendar Removed",
        description: "Calendar source has been removed successfully",
      });
    } catch (error) {
      console.error('Remove calendar source error:', error);
      toast({
        title: "Error",
        description: "Failed to remove calendar source",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, remove: false }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Calendar Integration Settings</h2>
      
      <div className="grid gap-6">
        <Tabs defaultValue="current">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Connected Calendars</TabsTrigger>
            <TabsTrigger value="add">Add Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connected Calendar Sources</CardTitle>
                <CardDescription>
                  Manage your connected calendar sources and their settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calendarSources.length === 0 ? (
                  <p className="text-center py-6 text-muted-foreground">
                    No calendars connected yet. Add one to get started.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {calendarSources.map(source => (
                      <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex flex-col">
                          <span className="font-medium">{source.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {source.type === 'google' ? 'Google Calendar' : 
                             source.type === 'o365' || source.type === 'microsoft' ? 'Office 365' : 'Power Automate URL'}
                          </span>
                          {source.tags && source.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {source.tags.map((tag: string) => (
                                <span key={tag} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={source.isEnabled}
                              onCheckedChange={() => toggleCalendarEnabled(source.id, source.isEnabled)}
                            />
                            <span className="text-sm">{source.isEnabled ? 'Enabled' : 'Disabled'}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeCalendarSource(source.id)}
                            className="text-destructive"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add Calendar Source</CardTitle>
                <CardDescription>
                  Connect to Google Calendar, Office 365, or use a Power Automate URL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="google">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="google">Google Calendar</TabsTrigger>
                    <TabsTrigger value="o365">Office 365</TabsTrigger>
                    <TabsTrigger value="url">Power Automate URL</TabsTrigger>
                  </TabsList>
                  
                  {/* Common fields for all calendar types */}
                  <div className="space-y-4 mt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="calendar-name">Calendar Name</Label>
                      <Input
                        id="calendar-name"
                        placeholder="e.g., Work Calendar"
                        value={newCalendarName}
                        onChange={(e) => setNewCalendarName(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="calendar-tags">Tags (comma separated)</Label>
                      <Input
                        id="calendar-tags"
                        placeholder="e.g., work, meetings, important"
                        value={newCalendarTags}
                        onChange={(e) => setNewCalendarTags(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <TabsContent value="google" className="pt-4">
                    <p className="mb-4 text-sm text-muted-foreground">
                      Connect your Google Calendar to view and manage events within FloHub.
                      You'll be redirected to Google to authorize this connection.
                    </p>
                    <Button onClick={handleConnectGoogle}>Connect Google Calendar</Button>
                  </TabsContent>
                  
                  <TabsContent value="o365" className="pt-4">
                    <p className="mb-4 text-sm text-muted-foreground">
                      Connect your Office 365 Calendar to view and manage events within FloHub.
                      You'll be redirected to Microsoft to authorize this connection.
                    </p>
                    <Button onClick={handleConnectOffice365}>Connect Office 365 Calendar</Button>
                  </TabsContent>
                  
                  <TabsContent value="url" className="pt-4">
                    <p className="mb-4 text-sm text-muted-foreground">
                      Enter a Power Automate URL that returns calendar data in a compatible format.
                    </p>
                    <div className="grid gap-2 mb-4">
                      <Label htmlFor="power-automate-url">Power Automate URL</Label>
                      <Input
                        id="power-automate-url"
                        placeholder="https://..."
                        value={powerAutomateUrl}
                        onChange={(e) => setPowerAutomateUrl(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddPowerAutomateUrl}>Add URL Source</Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  All calendar integrations are secure and only accessed with your permission.
                  FloHub does not store your calendar data permanently.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}