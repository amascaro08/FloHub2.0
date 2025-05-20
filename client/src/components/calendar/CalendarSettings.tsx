import React, { useState, useEffect } from 'react';
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
// Use the query client we just created
import { apiRequest, queryClient } from '../../lib/queryClient';

interface CalendarSource {
  id: string;
  name: string;
  type: 'google' | 'o365' | 'other';
  sourceId: string;
  isEnabled: boolean;
  tags?: string[];
  lastSync?: string;
}

interface CalendarAccount {
  id: string;
  provider: 'google' | 'microsoft' | 'other';
  email: string;
  name: string;
  isConnected: boolean;
  lastSync?: string;
}

const CalendarSettings = () => {
  const queryClient = useQueryClient();
  const [addingSource, setAddingSource] = useState(false);
  const [newSource, setNewSource] = useState<Partial<CalendarSource>>({
    name: '',
    type: 'google',
    sourceId: '',
    isEnabled: true,
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [selectedTab, setSelectedTab] = useState('accounts');
  const [powerAutomateUrl, setPowerAutomateUrl] = useState('');
  const [isPowerAutomateDialogOpen, setIsPowerAutomateDialogOpen] = useState(false);

  // Fetch calendar accounts (Google, Microsoft)
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['/api/calendar/accounts'],
    retry: 1
  });

  // Fetch user settings (includes calendar sources)
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/userSettings'],
    retry: 1,
    // Provide a default value for settings to avoid type errors
    placeholderData: {
      selectedCals: [],
      defaultView: 'month',
      customRange: {
        start: new Date().toISOString().slice(0, 10),
        end: new Date().toISOString().slice(0, 10),
      },
      globalTags: [],
      activeWidgets: ["tasks", "calendar", "ataglance", "quicknote"],
      calendarSources: []
    }
  });

  // Mutations for calendar actions
  const saveSettingsMutation = useMutation({
    mutationFn: (newSettings: any) => apiRequest('/api/userSettings', 'POST', newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/userSettings'] });
    }
  });

  const syncCalendarsMutation = useMutation({
    mutationFn: (accountIds: string[]) => apiRequest('/api/calendar/sync', 'POST', { accountIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/accounts'] });
    }
  });

  const savePowerAutomateMutation = useMutation({
    mutationFn: (data: { url: string, name: string }) => 
      apiRequest('/api/calendar/powerautomate', 'POST', data),
    onSuccess: (data) => {
      if (data?.calendarSource && settings?.calendarSources) {
        const updatedSettings = {
          ...settings,
          calendarSources: [...settings.calendarSources, data.calendarSource]
        };
        saveSettingsMutation.mutate(updatedSettings);
      }
      setIsPowerAutomateDialogOpen(false);
    }
  });

  // Handle adding a new calendar source
  const handleAddSource = () => {
    if (!newSource.name || !newSource.type) return;

    const sourceWithId = {
      ...newSource,
      id: `${newSource.type}-${Date.now()}`
    } as CalendarSource;

    if (settings?.calendarSources) {
      const updatedSettings = {
        ...settings,
        calendarSources: [...settings.calendarSources, sourceWithId]
      };
      saveSettingsMutation.mutate(updatedSettings);
    }

    setNewSource({
      name: '',
      type: 'google',
      sourceId: '',
      isEnabled: true,
      tags: []
    });
    setAddingSource(false);
  };

  // Handle removing a calendar source
  const handleRemoveSource = (sourceId: string) => {
    if (settings?.calendarSources) {
      const updatedSources = settings.calendarSources.filter(
        (source: CalendarSource) => source.id !== sourceId
      );
      
      const updatedSettings = {
        ...settings,
        calendarSources: updatedSources
      };
      
      saveSettingsMutation.mutate(updatedSettings);
    }
  };

  // Handle toggling a calendar source
  const handleToggleSource = (sourceId: string, enabled: boolean) => {
    if (settings?.calendarSources) {
      const updatedSources = settings.calendarSources.map((source: CalendarSource) => {
        if (source.id === sourceId) {
          return { ...source, isEnabled: enabled };
        }
        return source;
      });
      
      const updatedSettings = {
        ...settings,
        calendarSources: updatedSources
      };
      
      saveSettingsMutation.mutate(updatedSettings);
    }
  };

  // Handle adding a tag to new source
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setNewSource(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    setNewTag('');
  };

  // Handle removing a tag from new source
  const handleRemoveTag = (tag: string) => {
    setNewSource(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };

  // Handle connecting Google Calendar
  const handleConnectGoogle = async (accountLabel: string = 'Primary') => {
    try {
      const response = await fetch(`/api/calendar/auth/google?accountLabel=${encodeURIComponent(accountLabel)}`);
      const data = await response.json();
      
      if (data.configured && data.url) {
        window.location.href = data.url;
      } else {
        alert('Google Calendar integration is not properly configured. Please contact support.');
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      alert('Failed to connect to Google Calendar. Please try again later.');
    }
  };

  // Handle connecting Microsoft Calendar
  const handleConnectMicrosoft = async () => {
    try {
      const response = await fetch('/api/calendar/auth/microsoft');
      const data = await response.json();
      
      if (data.configured && data.url) {
        window.location.href = data.url;
      } else {
        alert('Microsoft Calendar integration is not properly configured. Please contact support.');
      }
    } catch (error) {
      console.error('Error connecting to Microsoft Calendar:', error);
      alert('Failed to connect to Microsoft Calendar. Please try again later.');
    }
  };

  // Handle connecting Power Automate
  const handleConnectPowerAutomate = () => {
    if (!powerAutomateUrl.trim()) {
      alert('Please enter a valid Power Automate URL');
      return;
    }
    
    savePowerAutomateMutation.mutate({
      url: powerAutomateUrl,
      name: 'Office 365 (Power Automate)'
    });
  };

  // Handle syncing calendars
  const handleSyncCalendars = () => {
    if (accounts && accounts.length > 0) {
      const accountIds = accounts.map((account: CalendarAccount) => account.id);
      syncCalendarsMutation.mutate(accountIds);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar Settings</h2>
        <Button 
          variant="outline" 
          onClick={handleSyncCalendars}
          disabled={syncCalendarsMutation.isPending || !accounts || accounts.length === 0}
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
              ) : accounts && accounts.length > 0 ? (
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
                          <p className="font-medium">{account.name}</p>
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
                          onClick={() => {
                            const accountIds = [account.id];
                            syncCalendarsMutation.mutate(accountIds);
                          }}
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
                    onClick={() => handleConnectGoogle('Personal')}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-red-500" />
                    Connect Google Calendar
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleConnectGoogle('Work')}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-red-500" />
                    Connect Work Google Calendar
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
              {isLoadingSettings ? (
                <div className="flex justify-center items-center h-40">
                  <p>Loading calendar sources...</p>
                </div>
              ) : settings?.calendarSources && settings.calendarSources.length > 0 ? (
                <div className="space-y-4">
                  {settings.calendarSources.map((source: CalendarSource) => (
                    <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          source.type === 'google' ? 'bg-red-100' : 
                          source.type === 'o365' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Calendar className={`h-5 w-5 ${
                            source.type === 'google' ? 'text-red-600' : 
                            source.type === 'o365' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {source.tags && source.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
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
                          <Trash className="h-4 w-4 text-destructive" />
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
            </CardContent>
            <CardFooter className="justify-between border-t pt-6">
              {!addingSource && (
                <Button onClick={() => setAddingSource(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Calendar Source
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {addingSource && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Add New Calendar Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source-name">Calendar Name</Label>
                    <Input
                      id="source-name"
                      placeholder="Work Calendar"
                      value={newSource.name || ''}
                      onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source-type">Calendar Type</Label>
                    <Select
                      value={newSource.type}
                      onValueChange={(value: 'google' | 'o365' | 'other') => 
                        setNewSource(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="source-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google Calendar</SelectItem>
                        <SelectItem value="o365">Office 365</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="source-id">Calendar ID</Label>
                  <Input
                    id="source-id"
                    placeholder="primary or calendar ID"
                    value={newSource.sourceId || ''}
                    onChange={(e) => setNewSource(prev => ({ ...prev, sourceId: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="source-tags">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newSource.tags && newSource.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 p-0"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="source-tags"
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag}>Add</Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newSource.isEnabled}
                    onCheckedChange={(checked) => 
                      setNewSource(prev => ({ ...prev, isEnabled: checked }))}
                  />
                  <Label htmlFor="source-enabled">Enable this calendar source</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setAddingSource(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSource}>
                  Add Calendar Source
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Power Automate Dialog */}
      <Dialog 
        open={isPowerAutomateDialogOpen} 
        onOpenChange={setIsPowerAutomateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Office 365 with Power Automate</DialogTitle>
            <DialogDescription>
              Enter your Power Automate URL to synchronize your Office 365 calendar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="power-automate-url">Power Automate URL</Label>
              <Input
                id="power-automate-url"
                placeholder="https://prod-xx.westus.logic.azure.com/..."
                value={powerAutomateUrl}
                onChange={(e) => setPowerAutomateUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can find this URL in your Power Automate flow's HTTP trigger
              </p>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Make sure your Power Automate flow is configured to accept requests from this application
                and has the necessary permissions to access your calendar.
              </AlertDescription>
            </Alert>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPowerAutomateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConnectPowerAutomate}
              disabled={!powerAutomateUrl.trim() || savePowerAutomateMutation.isPending}
            >
              {savePowerAutomateMutation.isPending ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarSettings;