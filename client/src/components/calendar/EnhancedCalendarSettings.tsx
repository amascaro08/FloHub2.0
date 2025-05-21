import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, Check, Plus, Trash, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Types for our calendar entities
interface CalendarSource {
  id: number;
  name: string;
  type: 'google' | 'o365' | 'url' | 'ical';
  sourceId: string;
  isEnabled: boolean;
  userId: string;
  connectionData?: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface CalendarAccount {
  id: string;
  provider: string;
  email: string;
  displayName: string;
  isConnected: boolean;
  lastSync?: string;
}

interface UserSettings {
  userId: string;
  defaultView?: string;
  activeWidgets?: string[];
  globalTags?: string[];
  selectedCals?: string[];
  powerAutomateUrl?: string;
  calendarSources?: CalendarSource[];
  createdAt?: string;
  updatedAt?: string;
}

const EnhancedCalendarSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addingSource, setAddingSource] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'url' as const,
    sourceId: '',
    isEnabled: true,
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');
  const [selectedTab, setSelectedTab] = useState('accounts');
  const [powerAutomateUrl, setPowerAutomateUrl] = useState('');
  const [isPowerAutomateDialogOpen, setIsPowerAutomateDialogOpen] = useState(false);

  // Fetch calendar accounts
  const { data: accounts = [], isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['/api/calendar/accounts'],
    retry: 1
  });

  // Fetch user settings
  const { data: settings = { calendarSources: [], globalTags: [] }, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/user-settings'],
    retry: 1
  });

  // Fetch calendar sources directly
  const { data: calendarSources = [], isLoading: isLoadingCalendarSources, refetch: refetchSources } = useQuery({
    queryKey: ['/api/calendar/sources'],
    retry: 1
  });

  // Mutations for calendar actions
  const updateUserSettingsMutation = useMutation({
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
        description: "Your calendar settings have been saved.",
      });
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      toast({
        title: "Error updating settings",
        description: "Failed to update your settings. Please try again.",
        variant: "destructive"
      });
    }
  });

  const createCalendarSourceMutation = useMutation({
    mutationFn: (source: typeof newSource) => 
      fetch('/api/calendar/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create calendar source');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
      toast({
        title: "Calendar source added",
        description: "Your calendar source has been added successfully.",
      });
      setAddingSource(false);
      setNewSource({
        name: '',
        type: 'url' as const,
        sourceId: '',
        isEnabled: true,
        tags: []
      });
    },
    onError: (error) => {
      console.error('Error creating calendar source:', error);
      toast({
        title: "Error adding calendar source",
        description: "Failed to add calendar source. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateCalendarSourceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CalendarSource> }) => 
      fetch(`/api/calendar/sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => {
        if (!res.ok) throw new Error('Failed to update calendar source');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
      toast({
        title: "Calendar source updated",
        description: "Your calendar source has been updated successfully."
      });
    },
    onError: (error) => {
      console.error('Error updating calendar source:', error);
      toast({
        title: "Error updating calendar source",
        description: "Failed to update calendar source. Please try again.",
        variant: "destructive"
      });
    }
  });

  const deleteCalendarSourceMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/calendar/sources/${id}`, {
        method: 'DELETE'
      }).then(res => {
        if (!res.ok) throw new Error('Failed to delete calendar source');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/sources'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
      toast({
        title: "Calendar source removed",
        description: "Your calendar source has been removed successfully."
      });
    },
    onError: (error) => {
      console.error('Error removing calendar source:', error);
      toast({
        title: "Error removing calendar source",
        description: "Failed to remove calendar source. Please try again.",
        variant: "destructive"
      });
    }
  });

  const syncCalendarsMutation = useMutation({
    mutationFn: () => 
      fetch('/api/calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => {
        if (!res.ok) throw new Error('Failed to sync calendars');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/accounts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/sources'] });
      toast({
        title: "Calendars synced",
        description: "Your calendars have been synced successfully."
      });
    },
    onError: (error) => {
      console.error('Error syncing calendars:', error);
      toast({
        title: "Error syncing calendars",
        description: "Failed to sync calendars. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle adding a new calendar source
  const handleAddSource = () => {
    if (!newSource.name || !newSource.sourceId) {
      toast({
        title: "Missing information",
        description: "Please provide both a name and a source ID.",
        variant: "destructive"
      });
      return;
    }

    createCalendarSourceMutation.mutate(newSource);
  };

  // Handle removing a calendar source
  const handleRemoveSource = (id: number) => {
    deleteCalendarSourceMutation.mutate(id);
  };

  // Handle toggling a calendar source
  const handleToggleSource = (id: number, enabled: boolean) => {
    updateCalendarSourceMutation.mutate({ 
      id, 
      data: { isEnabled: enabled } 
    });
  };

  // Handle adding a tag to new source
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setNewSource(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  // Handle removing a tag from new source
  const handleRemoveTag = (tag: string) => {
    setNewSource(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle connecting Google Calendar
  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  // Handle connecting Microsoft Calendar
  const handleConnectMicrosoft = () => {
    window.location.href = '/api/auth/microsoft';
  };

  // Handle connecting Power Automate
  const handleConnectPowerAutomate = () => {
    if (!powerAutomateUrl.trim()) {
      toast({
        title: "Missing URL",
        description: "Please enter a valid Power Automate URL.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new calendar source with the Power Automate URL
    createCalendarSourceMutation.mutate({
      name: 'Office 365 (Power Automate)',
      type: 'url',
      sourceId: powerAutomateUrl,
      isEnabled: true,
      tags: ['office365', 'powerautomate']
    });
    
    setIsPowerAutomateDialogOpen(false);
    setPowerAutomateUrl('');
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar Settings</h2>
        <Button 
          variant="outline" 
          onClick={() => syncCalendarsMutation.mutate()}
          disabled={syncCalendarsMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncCalendarsMutation.isPending ? 'animate-spin' : ''}`} />
          Sync All Calendars
        </Button>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
          <TabsTrigger value="sources">Calendar Sources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Calendar Accounts</CardTitle>
              <CardDescription>
                Connect your Google and Microsoft accounts to import calendars
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingAccounts ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading accounts...</p>
                </div>
              ) : accounts.length > 0 ? (
                <div className="space-y-4">
                  {accounts.map((account: CalendarAccount) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          account.provider === 'google' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <Calendar className={`h-5 w-5 ${
                            account.provider === 'google' ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{account.displayName}</p>
                          <p className="text-sm text-muted-foreground">{account.email}</p>
                          {account.lastSync && (
                            <p className="text-xs text-muted-foreground">
                              Last synced: {new Date(account.lastSync).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => syncCalendarsMutation.mutate()}
                          disabled={syncCalendarsMutation.isPending}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${
                            syncCalendarsMutation.isPending ? 'animate-spin' : ''
                          }`} />
                          Sync
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-4">
                  <p className="text-muted-foreground">No calendar accounts connected yet</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Add a new calendar account</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleConnectGoogle}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-red-500" />
                    Connect Google Calendar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleConnectMicrosoft}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    Connect Microsoft Calendar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPowerAutomateDialogOpen(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                    Connect via Power Automate
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Sources</CardTitle>
              <CardDescription>
                Manage which calendars are displayed and customize their appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingCalendarSources ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading calendar sources...</p>
                </div>
              ) : calendarSources.length > 0 ? (
                <div className="space-y-4">
                  {calendarSources.map((source: CalendarSource) => (
                    <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          source.type === 'google' ? 'bg-red-100' : 
                          source.type === 'o365' ? 'bg-blue-100' : 
                          source.type === 'url' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                          <Calendar className={`h-5 w-5 ${
                            source.type === 'google' ? 'text-red-600' : 
                            source.type === 'o365' ? 'text-blue-600' : 
                            source.type === 'url' ? 'text-purple-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {source.tags && source.tags.map((tag, idx) => (
                              <Badge key={`${tag}-${idx}`} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={source.isEnabled}
                            onCheckedChange={(checked) => handleToggleSource(source.id, checked)}
                          />
                          <span className="text-sm">{source.isEnabled ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveSource(source.id)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-4">
                  <p className="text-muted-foreground">No calendar sources added yet</p>
                  <Button onClick={() => setAddingSource(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Calendar Source
                  </Button>
                </div>
              )}

              {calendarSources.length > 0 && !addingSource && (
                <Button onClick={() => setAddingSource(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Calendar Source
                </Button>
              )}

              {addingSource && (
                <div className="border rounded-lg p-4 mt-4">
                  <h3 className="font-medium mb-4">Add New Calendar Source</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="source-name">Calendar Name</Label>
                        <Input 
                          id="source-name" 
                          value={newSource.name}
                          onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Work Calendar"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="source-type">Calendar Type</Label>
                        <Select 
                          value={newSource.type} 
                          onValueChange={(value: 'google' | 'o365' | 'url' | 'ical') => 
                            setNewSource(prev => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger id="source-type">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="url">Power Automate URL</SelectItem>
                            <SelectItem value="ical">iCal URL</SelectItem>
                            <SelectItem value="google">Google Calendar</SelectItem>
                            <SelectItem value="o365">Office 365</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="source-id">
                        {newSource.type === 'url' || newSource.type === 'ical' 
                          ? 'Calendar URL' 
                          : 'Calendar ID'}
                      </Label>
                      <Input 
                        id="source-id" 
                        value={newSource.sourceId}
                        onChange={(e) => setNewSource(prev => ({ ...prev, sourceId: e.target.value }))}
                        placeholder={
                          newSource.type === 'url' 
                            ? 'https://prod-xx.logic.azure.com/...' 
                            : newSource.type === 'ical'
                            ? 'https://calendar.google.com/calendar/ical/...'
                            : 'primary'
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tags (optional)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleAddTag}
                          disabled={!newTag.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      
                      {newSource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {newSource.tags.map((tag, index) => (
                            <Badge 
                              key={`${tag}-${index}`} 
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 rounded-full hover:bg-gray-200 p-0.5"
                              >
                                <span className="sr-only">Remove</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  width="14"
                                  height="14"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2">
                      <Switch
                        id="source-enabled"
                        checked={newSource.isEnabled}
                        onCheckedChange={(checked) => 
                          setNewSource(prev => ({ ...prev, isEnabled: checked }))
                        }
                      />
                      <Label htmlFor="source-enabled">Enabled</Label>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAddingSource(false);
                          setNewSource({
                            name: '',
                            type: 'url' as const,
                            sourceId: '',
                            isEnabled: true,
                            tags: []
                          });
                          setNewTag('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleAddSource}
                        disabled={!newSource.name || !newSource.sourceId}
                      >
                        Add Calendar Source
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Power Automate Dialog */}
      <Dialog open={isPowerAutomateDialogOpen} onOpenChange={setIsPowerAutomateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Power Automate Calendar</DialogTitle>
            <DialogDescription>
              Enter your Power Automate URL to integrate Office 365 calendar events.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="power-automate-url">Power Automate URL</Label>
              <Input
                id="power-automate-url"
                value={powerAutomateUrl}
                onChange={(e) => setPowerAutomateUrl(e.target.value)}
                placeholder="https://prod-xx.logic.azure.com/..."
              />
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Where to find your Power Automate URL</AlertTitle>
              <AlertDescription>
                Create a Power Automate flow in your Microsoft account, add the "When a HTTP request is received" trigger, and copy the generated URL.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPowerAutomateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConnectPowerAutomate} disabled={!powerAutomateUrl.trim()}>
              Connect Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedCalendarSettings;