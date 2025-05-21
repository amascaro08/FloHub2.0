import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface JournalInsightsProps {
  selectedDate?: string;
  refreshTrigger?: number;
}

interface InsightData {
  title: string;
  description: string;
  type: 'pattern' | 'suggestion' | 'analysis';
  icon: string;
}

const JournalInsights: React.FC<JournalInsightsProps> = ({ 
  selectedDate, 
  refreshTrigger = 0 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [expanded, setExpanded] = useState(false);

  // Fetch insights data
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      
      try {
        // Try to fetch insights from the API if authenticated
        if (isAuthenticated) {
          const response = await fetch('/api/journal/insights');
          
          if (response.ok) {
            const data = await response.json();
            setInsights(data);
            setLoading(false);
            return;
          }
        }
        
        // If API fetch fails or user is not authenticated, generate some local insights
        generateLocalInsights();
      } catch (error) {
        console.error("Error fetching FloCat insights:", error);
        // Fallback to generating local insights
        generateLocalInsights();
      }
    };
    
    fetchInsights();
  }, [isAuthenticated, selectedDate, refreshTrigger]);
  
  // Generate local insights based on localStorage data (as fallback)
  const generateLocalInsights = () => {
    const insights: InsightData[] = [];
    
    // Get all mood entries from localStorage
    const moodEntries: { [date: string]: any } = {};
    const activityEntries: { [date: string]: string[] } = {};
    const sleepEntries: { [date: string]: any } = {};
    
    // Iterate through localStorage to find mood, activity, and sleep entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      if (key?.startsWith('mood_')) {
        const date = key.replace('mood_', '');
        try {
          moodEntries[date] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {
          console.error('Error parsing mood entry:', e);
        }
      } else if (key?.startsWith('activities_')) {
        const date = key.replace('activities_', '');
        try {
          const activities = JSON.parse(localStorage.getItem(key) || '{}');
          activityEntries[date] = Object.keys(activities);
        } catch (e) {
          console.error('Error parsing activities entry:', e);
        }
      } else if (key?.startsWith('sleep_')) {
        const date = key.replace('sleep_', '');
        try {
          sleepEntries[date] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {
          console.error('Error parsing sleep entry:', e);
        }
      }
    }
    
    // Generate sleep insights
    if (Object.keys(sleepEntries).length > 0) {
      const sleepQualitySum = Object.values(sleepEntries).reduce(
        (sum, entry: any) => sum + (entry.quality || 0), 
        0
      );
      const avgSleepQuality = sleepQualitySum / Object.keys(sleepEntries).length;
      
      if (avgSleepQuality > 3.5) {
        insights.push({
          title: "You have been sleeping well!",
          description: "Your average sleep quality is above average. Keep up the good habits!",
          type: "analysis",
          icon: "😴"
        });
      } else if (avgSleepQuality < 2.5) {
        insights.push({
          title: "Sleep quality needs attention",
          description: "Your average sleep quality is below average. Consider reviewing your sleep schedule.",
          type: "suggestion",
          icon: "⚠️"
        });
      }
    }
    
    // Generate mood insights
    if (Object.keys(moodEntries).length > 0) {
      const moodCounts: {[mood: string]: number} = {};
      
      Object.values(moodEntries).forEach((entry: any) => {
        const mood = entry.label;
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
      
      const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
      
      insights.push({
        title: "Mood Patterns",
        description: `Your most common mood recently has been "${mostCommonMood}"`,
        type: "analysis",
        icon: moodEntries[Object.keys(moodEntries)[0]]?.emoji || "🙂"
      });
    }
    
    // Generate activity insights
    if (Object.keys(activityEntries).length > 0) {
      const activityCounts: {[activity: string]: number} = {};
      
      Object.values(activityEntries).forEach(activities => {
        activities.forEach(activity => {
          activityCounts[activity] = (activityCounts[activity] || 0) + 1;
        });
      });
      
      const sortedActivities = Object.entries(activityCounts).sort((a, b) => b[1] - a[1]);
      
      if (sortedActivities.length > 0) {
        insights.push({
          title: "Activity Patterns",
          description: `Your most frequent activity is "${sortedActivities[0][0]}"`,
          type: "analysis",
          icon: "📊"
        });
      }
      
      // Check for correlations between activities and moods
      const datesWithExercise = Object.keys(activityEntries).filter(
        date => activityEntries[date].includes('exercise')
      );
      
      if (datesWithExercise.length > 0) {
        const exerciseMoods = datesWithExercise
          .filter(date => moodEntries[date])
          .map(date => moodEntries[date]?.label);
        
        const goodMoodsWithExercise = exerciseMoods.filter(
          mood => mood === 'Amazing' || mood === 'Good'
        ).length;
        
        if (exerciseMoods.length > 0 && goodMoodsWithExercise / exerciseMoods.length > 0.7) {
          insights.push({
            title: "Exercise Benefits Your Mood",
            description: "On days when you exercise, you tend to have a better mood",
            type: "pattern",
            icon: "🏃‍♂️"
          });
        }
      }
    }
    
    // Add FloCat's default insights if we don't have enough data
    if (insights.length < 2) {
      insights.push({
        title: "Welcome to Journal Insights",
        description: "FloCat will analyze your journal entries, mood, and activities to provide personalized insights",
        type: "suggestion",
        icon: "🐱"
      });
      
      insights.push({
        title: "Track Your Patterns",
        description: "The more consistently you journal, the better insights FloCat can provide about your wellbeing",
        type: "suggestion",
        icon: "📝"
      });
    }
    
    setInsights(insights);
    setLoading(false);
  };

  // Render different card styles based on insight type
  const renderInsight = (insight: InsightData, index: number) => {
    const cardClasses = {
      pattern: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
      suggestion: 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-800',
      analysis: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800'
    }[insight.type];
    
    return (
      <div key={index} className={`p-4 rounded-lg border mb-3 ${cardClasses}`}>
        <div className="flex items-start">
          <div className="text-2xl mr-3">{insight.icon}</div>
          <div>
            <h3 className="font-medium text-gray-800 dark:text-white">{insight.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{insight.description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">🐱</span> FloCat Insights
          </h2>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        </div>
        
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-8 h-8 border-t-2 border-teal-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div>
            {insights.slice(0, expanded ? insights.length : 2).map(renderInsight)}
            
            {insights.length === 0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p>Not enough data to generate insights yet.</p>
                <p className="text-sm mt-2">Keep journaling to see patterns emerge!</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalInsights;