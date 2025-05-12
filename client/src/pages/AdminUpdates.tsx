import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Define the schema for updates
const updateFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  sentBy: z.string().min(2, 'Sender name required'),
  selectAll: z.boolean().optional(),
  recipientIds: z.array(z.string()).optional(),
});

type UpdateFormValues = z.infer<typeof updateFormSchema>;

export default function AdminUpdates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch all registrations
  const { data: registrations, isLoading: loadingRegistrations } = useQuery({
    queryKey: ['/api/registrations'],
    queryFn: async () => {
      const response = await fetch('/api/registrations');
      if (!response.ok) throw new Error('Failed to fetch registrations');
      return await response.json();
    }
  });

  // Fetch all updates
  const { data: updates, isLoading: loadingUpdates } = useQuery({
    queryKey: ['/api/updates'],
    queryFn: async () => {
      const response = await fetch('/api/updates');
      if (!response.ok) throw new Error('Failed to fetch updates');
      return await response.json();
    }
  });

  // Form setup
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      title: '',
      content: '',
      sentBy: 'FloHub Team',
      selectAll: false,
      recipientIds: [],
    }
  });

  // Handle select all change
  useEffect(() => {
    if (selectAll && registrations) {
      setSelectedRecipients(registrations.map((r: any) => r.id.toString()));
    } else if (!selectAll) {
      setSelectedRecipients([]);
    }
  }, [selectAll, registrations]);

  // Update form when selected recipients change
  useEffect(() => {
    setValue('recipientIds', selectedRecipients);
  }, [selectedRecipients, setValue]);

  // Create update mutation
  const createUpdate = useMutation({
    mutationFn: async (data: UpdateFormValues) => {
      const payload = {
        title: data.title,
        content: data.content,
        sentBy: data.sentBy,
        recipientIds: data.recipientIds,
      };
      
      return await apiRequest('/api/updates', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: 'Update sent!',
        description: 'Your update was successfully sent to the selected recipients.',
      });
      reset();
      setSelectedRecipients([]);
      setSelectAll(false);
      queryClient.invalidateQueries({ queryKey: ['/api/updates'] });
    },
    onError: (error) => {
      toast({
        title: 'Error sending update',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    }
  });

  // Form submission handler
  const onSubmit = async (data: UpdateFormValues) => {
    if (selectedRecipients.length === 0) {
      toast({
        title: 'No recipients selected',
        description: 'Please select at least one recipient',
        variant: 'destructive',
      });
      return;
    }
    
    createUpdate.mutate(data);
  };

  // Toggle recipient selection
  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev => 
      prev.includes(id)
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-teal-600">Flo</span>
            <span className="text-orange-500">Hub</span>
            <span className="ml-2 text-gray-700">Admin Updates</span>
          </h1>
          <p className="text-gray-600">Send updates to your registered users</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left column: Send updates form */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Send New Update</CardTitle>
                <CardDescription>
                  Create an update to send to your registered users. The update will be sent as an email and saved for reference.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Email Subject</Label>
                    <Input
                      id="title"
                      placeholder="Enter the email subject line"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Email Content</Label>
                    <div className="text-sm text-gray-500 mb-2">
                      You can use HTML for formatting (e.g., &lt;b&gt;bold&lt;/b&gt;, &lt;i&gt;italic&lt;/i&gt;, &lt;a href="..."&gt;link&lt;/a&gt;)
                    </div>
                    <Textarea
                      id="content"
                      placeholder="Enter the email content with HTML formatting"
                      rows={10}
                      {...register('content')}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-500">{errors.content.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sentBy">Sender Name</Label>
                    <Input
                      id="sentBy"
                      placeholder="Who is sending this update?"
                      {...register('sentBy')}
                    />
                    {errors.sentBy && (
                      <p className="text-sm text-red-500">{errors.sentBy.message}</p>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Select Recipients</h3>
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="selectAll"
                        checked={selectAll}
                        onCheckedChange={(checked) => {
                          setSelectAll(checked as boolean);
                        }}
                      />
                      <Label htmlFor="selectAll">Select All ({registrations?.length || 0} users)</Label>
                    </div>

                    {loadingRegistrations ? (
                      <p>Loading recipients...</p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-4">
                        {registrations?.map((registration: any) => (
                          <div key={registration.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`recipient-${registration.id}`}
                              checked={selectedRecipients.includes(registration.id.toString())}
                              onCheckedChange={() => toggleRecipient(registration.id.toString())}
                            />
                            <Label htmlFor={`recipient-${registration.id}`} className="flex-1 cursor-pointer">
                              {registration.firstName} ({registration.email})
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedRecipients.length > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        {selectedRecipients.length} recipients selected
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={createUpdate.isPending}
                  >
                    {createUpdate.isPending ? 'Sending...' : 'Send Update'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Previous updates */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Previous Updates</CardTitle>
                <CardDescription>
                  A record of all updates sent to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUpdates ? (
                  <p>Loading updates...</p>
                ) : updates && updates.length > 0 ? (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                    {updates.map((update: any) => (
                      <Card key={update.id} className="border-gray-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{update.title}</CardTitle>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Sent by: {update.sentBy}</span>
                            <span className="text-xs">
                              {new Date(update.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: update.content }} />
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0 text-xs text-gray-500">
                          Sent to {update.recipientCount} recipients
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No updates have been sent yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}