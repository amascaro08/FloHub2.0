import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface CalendarSource {
  id: string;
  name: string;
  type: 'google' | 'o365' | 'url';
  isEnabled: boolean;
  tags: string[];
}

export default function CalendarIntegrationSettings() {
  const { toast } = useToast();
  const [calendarSources, setCalendarSources] = useState<CalendarSource[]>([
    {
      id: '1',
      name: 'Personal Google Calendar',
      type: 'google',
      isEnabled: true,
      tags: ['personal']
    },
    {
      id: '2',
      name: 'Work Office 365',
      type: 'o365',
      isEnabled: true,
      tags: ['work']
    }
  ]);
  const [powerAutomateUrl, setPowerAutomateUrl] = useState('');

  // For new calendar sources
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarTags, setNewCalendarTags] = useState('');

  const handleConnectGoogle = () => {
    // In a real implementation, this would redirect to Google OAuth
    toast({
      title: "Google Authentication",
      description: "Redirecting to Google for authentication...",
    });
    
    // Simulating a successful connection
    setTimeout(() => {
      const newSource: CalendarSource = {
        id: `google-${Date.now()}`,
        name: newCalendarName || 'My Google Calendar',
        type: 'google',
        isEnabled: true,
        tags: newCalendarTags.split(',').map(tag => tag.trim())
      };
      
      setCalendarSources([...calendarSources, newSource]);
      setNewCalendarName('');
      setNewCalendarTags('');
      
      toast({
        title: "Calendar Connected",
        description: `Successfully connected to ${newSource.name}`,
      });
    }, 1500);
  };

  const handleConnectOffice365 = () => {
    // In a real implementation, this would redirect to Microsoft OAuth
    toast({
      title: "Microsoft Authentication",
      description: "Redirecting to Microsoft for authentication...",
    });
    
    // Simulating a successful connection
    setTimeout(() => {
      const newSource: CalendarSource = {
        id: `o365-${Date.now()}`,
        name: newCalendarName || 'My Office 365 Calendar',
        type: 'o365',
        isEnabled: true,
        tags: newCalendarTags.split(',').map(tag => tag.trim())
      };
      
      setCalendarSources([...calendarSources, newSource]);
      setNewCalendarName('');
      setNewCalendarTags('');
      
      toast({
        title: "Calendar Connected",
        description: `Successfully connected to ${newSource.name}`,
      });
    }, 1500);
  };

  const handleAddPowerAutomateUrl = () => {
    if (!powerAutomateUrl) {
      toast({
        title: "Error",
        description: "Please enter a valid Power Automate URL",
        variant: "destructive",
      });
      return;
    }
    
    const newSource: CalendarSource = {
      id: `url-${Date.now()}`,
      name: newCalendarName || 'Power Automate Calendar',
      type: 'url',
      isEnabled: true,
      tags: newCalendarTags.split(',').map(tag => tag.trim())
    };
    
    setCalendarSources([...calendarSources, newSource]);
    setNewCalendarName('');
    setNewCalendarTags('');
    setPowerAutomateUrl('');
    
    toast({
      title: "Calendar Connected",
      description: `Power Automate URL calendar added successfully`,
    });
  };

  const toggleCalendarEnabled = (id: string) => {
    setCalendarSources(sources => 
      sources.map(source => 
        source.id === id ? { ...source, isEnabled: !source.isEnabled } : source
      )
    );
  };

  const removeCalendarSource = (id: string) => {
    setCalendarSources(sources => sources.filter(source => source.id !== id));
    toast({
      title: "Calendar Removed",
      description: "Calendar source has been removed successfully",
    });
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
                             source.type === 'o365' ? 'Office 365' : 'Power Automate URL'}
                          </span>
                          {source.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {source.tags.map(tag => (
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
                              onCheckedChange={() => toggleCalendarEnabled(source.id)}
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