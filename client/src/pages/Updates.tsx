import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import './updates.css';

export default function Updates() {
  // Fetch all updates
  const { data: updates, isLoading, error } = useQuery({
    queryKey: ['/api/updates'],
    queryFn: async () => {
      const response = await fetch('/api/updates');
      if (!response.ok) throw new Error('Failed to fetch updates');
      return await response.json();
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="text-teal-600">Flo</span>
            <span className="text-orange-500">Hub</span>
            <span className="ml-2 text-gray-700">Updates</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay informed about the latest developments, features, and news from the FloHub team
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Loading updates...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">Error loading updates. Please try again later.</p>
          </div>
        ) : updates && updates.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-8">
            {updates.map((update: any) => (
              <Card key={update.id} className="shadow-md overflow-hidden border-gray-200">
                <CardHeader className="bg-white pb-0">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100 px-3 py-1">
                      Update
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(update.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <CardTitle className="text-2xl mt-4 text-gray-900">{update.title}</CardTitle>
                  <CardDescription className="text-gray-500">
                    From: {update.sentBy}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-teal max-w-none update-content">
                    <div dangerouslySetInnerHTML={{ __html: update.content }} />
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="bg-gray-50 py-4 text-sm text-gray-500">
                  Sent to {update.recipientCount} {update.recipientCount === 1 ? 'user' : 'users'}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Updates Yet</h3>
            <p className="text-gray-500">
              Check back soon! Updates about FloHub development and features will appear here.
            </p>
          </div>
        )}
      </div>

      <footer className="bg-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">
                <span className="text-teal-600">Flo</span>
                <span className="text-orange-500">Hub</span>
              </h2>
              <p className="text-gray-600 text-sm">Your all-in-one purrfect LifeOS</p>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} FloHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}