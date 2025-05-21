import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar, Plus, Trash2, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Simple icon components
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" stroke="none"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" stroke="none"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" stroke="none"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" stroke="none"/>
  </svg>
);

const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="1" y="1" width="10" height="10" fill="#F25022" stroke="none" />
    <rect x="13" y="1" width="10" height="10" fill="#7FBA00" stroke="none" />
    <rect x="1" y="13" width="10" height="10" fill="#00A4EF" stroke="none" />
    <rect x="13" y="13" width="10" height="10" fill="#FFB900" stroke="none" />
  </svg>
);

interface CalendarSource {
  id: number;
  name: string;
  type: 'google' | 'o365' | 'url' | 'ical';
  sourceId: string;
  connectionData?: string;
  isEnabled: boolean;
  tags: string[];
  userId: string;
}

interface CalendarAccount {
  id: string;
  type: 'google' | 'o365';
  accountName: string;
}

interface UserSettings {
  id: number;
  userId: string;
  defaultView: string;
  activeWidgets: string[];
  globalTags: string[];
  selectedCals: string[];
  calendarSources?: CalendarSource[];
}

const DirectCalendarSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('accounts');
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [addingSource, setAddingSource] = useState<{
    name: string;
    type: 'url';
    sourceId: string;
    isEnabled: boolean;
    tags: string[];
  }>({
    name: '',
    type: 'url',
    sourceId: '',
    isEnabled: true,
    tags: []
  });

  // Fetch user settings
  const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/user-settings'],
    retry: 1
  });
  
  // Ensure we have an array of calendar sources
  const calendarSources = userSettings?.calendarSources || [];

  // Mutation to update user settings (including calendar sources)
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<UserSettings>) => 
      fetch('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update settings');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully."
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: "Error updating settings",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Add new calendar source
  const addCalendarSource = () => {
    if (!addingSource.name || !addingSource.sourceId) {
      toast({
        title: "Missing information",
        description: "Please provide a name and URL for your calendar source.",
        variant: "destructive"
      });
      return;
    }

    const updatedSources = [
      ...calendarSources,
      {
        ...addingSource,
        id: Date.now(), // Generate temporary ID
      }
    ];

    updateSettingsMutation.mutate({
      calendarSources: updatedSources
    });

    setAddingSource({
      name: '',
      type: 'url',
      sourceId: '',
      isEnabled: true,
      tags: []
    });
    setIsAddSourceModalOpen(false);
  };

  // Toggle calendar source enabled/disabled
  const toggleCalendarSource = (id: number, isEnabled: boolean) => {
    try {
      const updatedSources = calendarSources.map((source: any) => {
        if (source.id === id) {
          return { ...source, isEnabled };
        }
        return source;
      });

      updateSettingsMutation.mutate({
        calendarSources: updatedSources
      });
    } catch (error) {
      console.error('Toggle calendar enabled error:', error);
      toast({
        title: "Error toggling calendar",
        description: "Failed to toggle calendar source. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete calendar source
  const deleteCalendarSource = (id: number) => {
    try {
      const updatedSources = calendarSources.filter((source: any) => source.id !== id);

      updateSettingsMutation.mutate({
        calendarSources: updatedSources
      });

      setConfirmDeleteId(null); // Close confirmation dialog
    } catch (error) {
      console.error('Remove calendar source error:', error);
      toast({
        title: "Error removing calendar",
        description: "Failed to remove calendar source. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Settings</CardTitle>
          <CardDescription>
            Manage your calendar accounts and sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sources" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="sources">Calendar Sources</TabsTrigger>
              <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
            </TabsList>

            {/* Calendar Sources Tab */}
            <TabsContent value="sources" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Connected Calendar Sources</h3>
                <Button onClick={() => setIsAddSourceModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Power Automate URL
                </Button>
              </div>

              {calendarSources.length === 0 ? (
                <div className="p-4 border rounded-md text-center">
                  <p className="text-muted-foreground">No calendar sources connected. Add a calendar source to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {calendarSources.map((source: any) => (
                    <div key={source.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex-1">
                        <h4 className="font-medium">{source.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {source.type === 'url' ? 'Power Automate URL' : source.type === 'google' ? 'Google Calendar' : 'Office 365 Calendar'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={source.isEnabled} 
                          onCheckedChange={(checked) => toggleCalendarSource(source.id, checked)}
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setConfirmDeleteId(source.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Calendar Accounts Tab */}
            <TabsContent value="accounts" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Connected Calendar Accounts</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Calendar */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <div className="mr-2">
                        <GoogleIcon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">Google Calendar</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Connect your Google Calendar to import events
                        </p>
                      </div>
                      <Button size="sm">
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Microsoft Calendar */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center">
                      <div className="mr-2">
                        <MicrosoftIcon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">Office 365 Calendar</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Connect your Microsoft calendar to import events
                        </p>
                      </div>
                      <Button size="sm">
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connect from Calendar Widget</AlertTitle>
                <AlertDescription>
                  You can also connect accounts directly from the calendar widget on your dashboard.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Source Dialog */}
      <Dialog open={isAddSourceModalOpen} onOpenChange={setIsAddSourceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Calendar Source</DialogTitle>
            <DialogDescription>
              Add a Power Automate URL to import events from external calendars
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="source-name">Name</Label>
              <Input 
                id="source-name" 
                placeholder="Work Calendar" 
                value={addingSource.name}
                onChange={(e) => setAddingSource(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source-url">Power Automate URL</Label>
              <Input 
                id="source-url" 
                placeholder="https://prod-xx.logic.azure.com/..." 
                value={addingSource.sourceId}
                onChange={(e) => setAddingSource(prev => ({ ...prev, sourceId: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Enter the HTTP trigger URL from your Power Automate flow
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSourceModalOpen(false)}>Cancel</Button>
            <Button onClick={addCalendarSource}>Add Calendar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteId !== null} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this calendar source? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => confirmDeleteId && deleteCalendarSource(confirmDeleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DirectCalendarSettings;