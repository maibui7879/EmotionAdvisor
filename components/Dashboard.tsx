import React, { useState, useEffect, useCallback } from 'react';
import { User, EmotionEntry } from '../types';
import { getEmotionEntries } from '../services/storageService';
import { getAnalyticsSummary } from '../services/geminiService';
import AnalyticsChart from './AnalyticsChart';
import { BrainCircuit } from 'lucide-react';
import Spinner from './common/Spinner';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [emotionEntries, setEmotionEntries] = useState<EmotionEntry[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const refreshDashboard = useCallback(() => {
    const entries = getEmotionEntries();
    setEmotionEntries(entries);
    if(entries.length > 0) {
      generateSummary(entries.slice(0, 10)); // Analyze last 10 entries for summary
    } else {
        setSummary("Start chatting with the AI assistant to see your wellness summary here.");
    }
  }, []);
  
  const generateSummary = useCallback(async (entries: EmotionEntry[]) => {
    setIsLoadingSummary(true);
    const result = await getAnalyticsSummary(entries);
    setSummary(result);
    setIsLoadingSummary(false);
  }, []);

  useEffect(() => {
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, [refreshDashboard]);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome, {user.name}!</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's a look at your emotional wellness journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="space-y-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Emotional Journey</h2>
            <div className="h-64">
              <AnalyticsChart data={emotionEntries} />
            </div>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
             <div className="flex items-center mb-4">
                <BrainCircuit className="text-primary-500 mr-3" size={24} />
                <h2 className="text-xl font-semibold">AI Wellness Summary</h2>
              </div>
              {isLoadingSummary ? (
                <div className="flex justify-center items-center h-20">
                  <Spinner />
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 italic">
                    {summary}
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;