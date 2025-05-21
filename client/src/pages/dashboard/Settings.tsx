import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import EnhancedCalendarSettings from "../../components/calendar/EnhancedCalendarSettings";
import DirectCalendarSettings from "../../components/calendar/DirectCalendarSettings";
import SimpleCalendarSettings from "../../components/calendar/SimpleCalendarSettings";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../../components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Calendar, RefreshCw, XCircle, Plus, Save, Loader2, Trash2, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

// Types
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

interface UserSettings {
  id?: number;
  userId: string;
  globalTags: string[];
  selectedCals: string[];
  defaultView: string;
  activeWidgets: string[];
  powerAutomateUrl?: string;
  calendarSources?: CalendarSource[];
  floCatPreferences?: {
    communicationStyle: 'professional' | 'friendly' | 'humorous' | 'sarcastic';
    focusAreas: string[];
    reminderIntensity: 'gentle' | 'moderate' | 'assertive';
    interactionFrequency: 'low' | 'medium' | 'high';
  };
}

interface CalendarAccount {
  id: string;
  provider: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isConnected: boolean;
}

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // State for new calendar source
  const [newSource, setNewSource] = useState<Partial<CalendarSource>>({
    name: '',
    type: 'google',
    sourceId: '',
    isEnabled: true,
    tags: []
  });
  
  // State for editing mode
  const [editingSourceId, setEditingSourceId] = useState<number | null>(null);
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const [powerAutomateUrl, setPowerAutomateUrl] = useState('');
  const [isPowerAutomateDialogOpen, setIsPowerAutomateDialogOpen] = useState(false);
  
  // State for widgets configuration
  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    'calendar', 'tasks', 'ataglance', 'quicknote'
  ]);
  
  // Default calendar view
  const [defaultView, setDefaultView] = useState('week');
  
  // FloCat preferences
  const [communicationStyle, setCommunicationStyle] = useState<'professional' | 'friendly' | 'humorous' | 'sarcastic'>('friendly');
  const [focusAreas, setFocusAreas] = useState<string[]>(['meetings', 'tasks', 'habits']);
  const [reminderIntensity, setReminderIntensity] = useState<'gentle' | 'moderate' | 'assertive'>('moderate');
  const [interactionFrequency, setInteractionFrequency] = useState<'low' | 'medium' | 'high'>('medium');
  const [newFocusArea, setNewFocusArea] = useState('');

  // Fetch calendar accounts (Google, Microsoft)
  const { data: accounts, isLoading: isLoadingAccounts } = useQuery({
    queryKey: ['/api/calendar/accounts'],
    retry: 1,
    enabled: isAuthenticated
  });

  // Fetch user settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery<UserSettings & { calendarSources?: CalendarSource[] }>({
    queryKey: ['/api/user-settings'],
    retry: 1,
    enabled: isAuthenticated
  });
  
  // Initialize state from settings when available
  useEffect(() => {
    if (settings) {
      setDefaultView(settings.defaultView || 'week');
      setActiveWidgets(settings.activeWidgets || ['calendar', 'tasks', 'ataglance', 'quicknote']);
      setPowerAutomateUrl(settings.powerAutomateUrl || '');
      
      // Initialize FloCat preferences if available
      if (settings.floCatPreferences) {
        setCommunicationStyle(settings.floCatPreferences.communicationStyle || 'friendly');
        setFocusAreas(settings.floCatPreferences.focusAreas || ['meetings', 'tasks', 'habits']);
        setReminderIntensity(settings.floCatPreferences.reminderIntensity || 'moderate');
        setInteractionFrequency(settings.floCatPreferences.interactionFrequency || 'medium');
      }
    }
  }, [settings]);

  // Calendar sources from settings
  const calendarSources: CalendarSource[] = settings?.calendarSources || [];
  const globalTags: string[] = settings?.globalTags || [];

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<UserSettings>) => 
      fetch('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
    }
  });

  const addSourceMutation = useMutation({
    mutationFn: (source: Partial<CalendarSource>) => 
      fetch('/api/calendar/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
      setNewSource({
        name: '',
        type: 'google',
        sourceId: '',
        isEnabled: true,
        tags: []
      });
    }
  });

  const updateSourceMutation = useMutation({
    mutationFn: ({ id, ...source }: Partial<CalendarSource> & { id: number }) => 
      fetch(`/api/calendar/sources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(source)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
      setEditingSourceId(null);
    }
  });

  const deleteSourceMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/calendar/sources/${id}`, {
        method: 'DELETE',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
    }
  });

  const syncCalendarsMutation = useMutation({
    mutationFn: () => 
      fetch('/api/calendar/sync', {
        method: 'POST',
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/calendar/events'] });
    }
  });

  // Handle connecting calendar providers
  const handleConnectGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  const handleConnectMicrosoft = () => {
    window.location.href = '/api/auth/microsoft';
  };

  const handleSyncCalendars = () => {
    syncCalendarsMutation.mutate();
  };

  // Handle form submission for general settings
  const handleSubmitGeneralSettings = () => {
    updateSettingsMutation.mutate({
      defaultView,
      activeWidgets,
    });
  };
  
  // Handle form submission for FloCat settings
  const handleSubmitFloCatSettings = () => {
    updateSettingsMutation.mutate({
      floCatPreferences: {
        communicationStyle,
        focusAreas,
        reminderIntensity,
        interactionFrequency
      }
    });
  };
  
  // Handle adding focus area
  const handleAddFocusArea = () => {
    if (!newFocusArea.trim()) return;
    if (!focusAreas.includes(newFocusArea.trim())) {
      setFocusAreas([...focusAreas, newFocusArea.trim()]);
    }
    setNewFocusArea('');
  };
  
  // Handle removing focus area
  const handleRemoveFocusArea = (areaToRemove: string) => {
    setFocusAreas(focusAreas.filter(area => area !== areaToRemove));
  };

  // Handle form submission for adding/updating calendar source
  const handleSubmitSource = () => {
    if (editingSourceId !== null) {
      // Update existing source
      updateSourceMutation.mutate({
        ...newSource,
        id: editingSourceId
      } as CalendarSource);
    } else {
      // Add new source
      addSourceMutation.mutate(newSource);
    }
  };

  // Handle adding tag to a calendar source
  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    setNewSource(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    
    setNewTag('');
  };

  // Handle removing tag from calendar source
  const handleRemoveTag = (tagToRemove: string) => {
    setNewSource(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle adding global tag
  const handleAddGlobalTag = () => {
    if (!newTag.trim()) return;
    
    const updatedTags = [...globalTags, newTag.trim()];
    
    updateSettingsMutation.mutate({
      globalTags: updatedTags
    });
    
    setNewTag('');
  };

  // Handle removing global tag
  const handleRemoveGlobalTag = (tagToRemove: string) => {
    const updatedTags = globalTags.filter(tag => tag !== tagToRemove);
    
    updateSettingsMutation.mutate({
      globalTags: updatedTags
    });
  };

  // Handle Power Automate URL setup
  const handleSavePowerAutomateUrl = () => {
    updateSettingsMutation.mutate({
      powerAutomateUrl
    });
    setIsPowerAutomateDialogOpen(false);
  };

  // Handle edit source
  const handleEditSource = (source: CalendarSource) => {
    setNewSource({
      name: source.name,
      type: source.type,
      sourceId: source.sourceId,
      connectionData: source.connectionData,
      isEnabled: source.isEnabled,
      tags: source.tags || []
    });
    setEditingSourceId(source.id);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="calendar">Calendar Settings</TabsTrigger>
            <TabsTrigger value="tags">Tags & Categories</TabsTrigger>
            <TabsTrigger value="flocat">FloCat Assistant</TabsTrigger>
          </TabsList>
          
          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>
                  Customize how FloHub works for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultView">Default Calendar View</Label>
                  <Select value={defaultView} onValueChange={setDefaultView}>
                    <SelectTrigger id="defaultView">
                      <SelectValue placeholder="Select default view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="agenda">Agenda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Active Widgets</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="calendar-widget" 
                        checked={activeWidgets.includes('calendar')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setActiveWidgets([...activeWidgets, 'calendar']);
                          } else {
                            setActiveWidgets(activeWidgets.filter(w => w !== 'calendar'));
                          }
                        }}
                      />
                      <Label htmlFor="calendar-widget">Calendar</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="tasks-widget" 
                        checked={activeWidgets.includes('tasks')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setActiveWidgets([...activeWidgets, 'tasks']);
                          } else {
                            setActiveWidgets(activeWidgets.filter(w => w !== 'tasks'));
                          }
                        }}
                      />
                      <Label htmlFor="tasks-widget">Tasks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="ataglance-widget" 
                        checked={activeWidgets.includes('ataglance')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setActiveWidgets([...activeWidgets, 'ataglance']);
                          } else {
                            setActiveWidgets(activeWidgets.filter(w => w !== 'ataglance'));
                          }
                        }}
                      />
                      <Label htmlFor="ataglance-widget">At a Glance</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="quicknote-widget" 
                        checked={activeWidgets.includes('quicknote')}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setActiveWidgets([...activeWidgets, 'quicknote']);
                          } else {
                            setActiveWidgets(activeWidgets.filter(w => w !== 'quicknote'));
                          }
                        }}
                      />
                      <Label htmlFor="quicknote-widget">Quick Note</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSubmitGeneralSettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Calendar Settings Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <SimpleCalendarSettings />
          </TabsContent>
          
          {/* FloCat Assistant Settings Tab */}
          <TabsContent value="flocat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>FloCat Assistant Preferences</CardTitle>
                <CardDescription>
                  Customize how FloCat interacts with you and what information it prioritizes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Communication Style Preference */}
                <div className="space-y-2">
                  <Label htmlFor="communicationStyle">Communication Style</Label>
                  <Select value={communicationStyle} onValueChange={(value: any) => setCommunicationStyle(value)}>
                    <SelectTrigger id="communicationStyle">
                      <SelectValue placeholder="Select communication style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="sarcastic">Sarcastic</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    {communicationStyle === 'professional' && "FloCat will communicate in a direct, professional manner"}
                    {communicationStyle === 'friendly' && "FloCat will be warm and supportive in its communications"}
                    {communicationStyle === 'humorous' && "FloCat will include light humor in its messages"}
                    {communicationStyle === 'sarcastic' && "FloCat will add a touch of sarcasm and wit to messages"}
                  </p>
                </div>
                
                {/* Reminder Intensity */}
                <div className="space-y-2">
                  <Label htmlFor="reminderIntensity">Reminder Intensity</Label>
                  <Select value={reminderIntensity} onValueChange={(value: any) => setReminderIntensity(value)}>
                    <SelectTrigger id="reminderIntensity">
                      <SelectValue placeholder="Select reminder intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gentle">Gentle</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="assertive">Assertive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    How strongly FloCat will remind you about upcoming events and uncompleted tasks
                  </p>
                </div>
                
                {/* Interaction Frequency */}
                <div className="space-y-2">
                  <Label htmlFor="interactionFrequency">Interaction Frequency</Label>
                  <Select value={interactionFrequency} onValueChange={(value: any) => setInteractionFrequency(value)}>
                    <SelectTrigger id="interactionFrequency">
                      <SelectValue placeholder="Select interaction frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Essential updates only)</SelectItem>
                      <SelectItem value="medium">Medium (Regular check-ins)</SelectItem>
                      <SelectItem value="high">High (Frequent updates)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    How often FloCat will provide updates and suggestions
                  </p>
                </div>
                
                {/* Focus Areas */}
                <div className="space-y-2">
                  <Label>Focus Areas</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Select which types of information FloCat should prioritize
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {focusAreas.map(area => (
                      <Badge key={area} variant="secondary" className="px-3 py-1 space-x-1">
                        <span>{area}</span>
                        <button 
                          onClick={() => handleRemoveFocusArea(area)}
                          className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add new focus area"
                      value={newFocusArea}
                      onChange={(e) => setNewFocusArea(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFocusArea()}
                      className="flex-1"
                    />
                    <Button onClick={handleAddFocusArea} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSubmitFloCatSettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save FloCat Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Hidden original calendar content */}
          <TabsContent value="hidden-calendar" className="hidden">
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
                            <p className="font-medium">{account.displayName || account.email}</p>
                            <p className="text-sm text-gray-500">{account.provider === 'google' ? 'Google Calendar' : 'Microsoft Calendar'}</p>
                          </div>
                        </div>
                        <Badge variant={account.isConnected ? "outline" : "destructive"} className={account.isConnected ? "bg-green-100 text-green-800" : ""}>
                          {account.isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No calendar accounts connected yet</p>
                    <p className="text-sm text-gray-400 mb-6">Connect your accounts to import your calendars</p>
                    <div className="flex flex-wrap gap-2 justify-center">
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
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPowerAutomateDialogOpen(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                    Power Automate URL
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleSyncCalendars}
                  disabled={syncCalendarsMutation.isPending || !accounts || accounts.length === 0}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncCalendarsMutation.isPending ? 'animate-spin' : ''}`} />
                  Sync All Calendars
                </Button>
              </CardFooter>
            </Card>
            
            {/* Calendar Sources */}
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
                ) : calendarSources && calendarSources.length > 0 ? (
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
                            <Label htmlFor={`enabled-${source.id}`} className="sr-only">Enabled</Label>
                            <Switch 
                              id={`enabled-${source.id}`} 
                              checked={source.isEnabled}
                              onCheckedChange={(checked) => {
                                updateSourceMutation.mutate({
                                  id: source.id,
                                  isEnabled: checked
                                });
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditSource(source)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive"
                              onClick={() => deleteSourceMutation.mutate(source.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No calendar sources configured yet</p>
                    <p className="text-sm text-gray-400 mb-6">Add your calendar sources to display events</p>
                  </div>
                )}
                
                {/* Add/Edit Calendar Source Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>{editingSourceId !== null ? 'Edit Calendar Source' : 'Add Calendar Source'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sourceName">Name</Label>
                      <Input 
                        id="sourceName" 
                        value={newSource.name || ''}
                        onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                        placeholder="Work Calendar, Personal Events, etc."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sourceType">Type</Label>
                      <Select 
                        value={newSource.type || 'google'} 
                        onValueChange={(value: 'google' | 'o365' | 'url' | 'ical') => setNewSource({...newSource, type: value})}
                      >
                        <SelectTrigger id="sourceType">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google Calendar</SelectItem>
                          <SelectItem value="o365">Microsoft 365</SelectItem>
                          <SelectItem value="url">Power Automate URL</SelectItem>
                          <SelectItem value="ical">iCalendar URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sourceId">Calendar ID / URL</Label>
                      <Input 
                        id="sourceId" 
                        value={newSource.sourceId || ''}
                        onChange={(e) => setNewSource({...newSource, sourceId: e.target.value})}
                        placeholder="Calendar ID, URL, or Power Automate endpoint"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sourceTags">Tags</Label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(newSource.tags || []).map(tag => (
                          <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <XCircle 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          id="sourceTags" 
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleAddTag}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="sourceEnabled" 
                        checked={newSource.isEnabled}
                        onCheckedChange={(checked) => setNewSource({...newSource, isEnabled: checked})}
                      />
                      <Label htmlFor="sourceEnabled">Enabled</Label>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setNewSource({
                          name: '',
                          type: 'google',
                          sourceId: '',
                          isEnabled: true,
                          tags: []
                        });
                        setEditingSourceId(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitSource}
                      disabled={!newSource.name || !newSource.sourceId || addSourceMutation.isPending || updateSourceMutation.isPending}
                    >
                      {(addSourceMutation.isPending || updateSourceMutation.isPending) && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingSourceId !== null ? 'Update' : 'Add'} Calendar Source
                    </Button>
                  </CardFooter>
                </Card>
              </CardContent>
            </Card>
            
            {/* Power Automate URL Dialog */}
            {isPowerAutomateDialogOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4">Power Automate URL</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Enter your Power Automate HTTP trigger URL to fetch events from Microsoft services.
                  </p>
                  <Input 
                    value={powerAutomateUrl}
                    onChange={(e) => setPowerAutomateUrl(e.target.value)}
                    placeholder="https://prod-00.example.com/workflows/..."
                    className="mb-4"
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsPowerAutomateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSavePowerAutomateUrl}>
                      Save URL
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Tags Tab */}
          <TabsContent value="tags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Tags</CardTitle>
                <CardDescription>
                  Manage tags that can be used across tasks, events, and notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {globalTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <XCircle 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveGlobalTag(tag)}
                      />
                    </Badge>
                  ))}
                  
                  {globalTags.length === 0 && (
                    <p className="text-sm text-gray-500">No global tags yet</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a new global tag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGlobalTag())}
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddGlobalTag}
                    disabled={!newTag.trim() || updateSettingsMutation.isPending}
                  >
                    {updateSettingsMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}