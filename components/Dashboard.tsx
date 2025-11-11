import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, EmotionEntry } from '../types';
import { getEmotionEntries } from '../services/storageService';
import { getAnalyticsSummary } from '../services/geminiService';
import AnalyticsChart from './AnalyticsChart';
import { BrainCircuit, RotateCw } from 'lucide-react';
import Spinner from './common/Spinner';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [emotionEntries, setEmotionEntries] = useState<EmotionEntry[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const lastSummaryTimeRef = useRef<number>(0);

  const refreshChart = useCallback(() => {
    const entries = getEmotionEntries();
    setEmotionEntries(entries);
  }, []);

  const generateSummary = useCallback(async (entries: EmotionEntry[]) => {
    setIsLoadingSummary(true);
    try {
      const result = await getAnalyticsSummary(entries);
      setSummary(result);
      lastSummaryTimeRef.current = Date.now();
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  const handleRefreshSummary = useCallback(async () => {
    const entries = getEmotionEntries();
    if (entries.length > 0) {
      await generateSummary(entries.slice(0, 10));
    }
  }, [generateSummary]);

  useEffect(() => {
    refreshChart();
    const entries = getEmotionEntries();
    if (entries.length > 0) {
      generateSummary(entries.slice(0, 10));
    } else {
      setSummary("Start chatting with the AI assistant to see your wellness summary here.");
    }

    // Poll chart every 5 seconds, but only refresh summary every 5 minutes
    const chartInterval = setInterval(refreshChart, 5000);
    const summaryInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastSummaryTimeRef.current >= 5 * 60 * 1000) { // 5 minutes
        const entries = getEmotionEntries();
        if (entries.length > 0) {
          generateSummary(entries.slice(0, 10));
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearInterval(chartInterval);
      clearInterval(summaryInterval);
    };
  }, [generateSummary, refreshChart]);

  // Helper function to format summary with markdown-like syntax
  const formatSummary = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      
      // Handle bold text (**text**)
      let formatted = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      
      // Handle bullet points (lines starting with *)
      if (formatted.startsWith('*')) {
        formatted = formatted.substring(1).trim();
        return (
          <li key={idx} className="flex items-start mb-2">
            <span className="text-primary-500 mr-3 font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatted }} />
          </li>
        );
      }
      
      return (
        <p 
          key={idx} 
          className="mb-2"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };
  
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
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <BrainCircuit className="text-primary-500 mr-3" size={24} />
                  <h2 className="text-xl font-semibold">AI Wellness Summary</h2>
                </div>
                <button
                  onClick={handleRefreshSummary}
                  disabled={isLoadingSummary}
                  className="p-2 rounded-lg text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors disabled:opacity-50"
                  title="Refresh summary (updates every 5 minutes)"
                >
                  <RotateCw size={20} className={isLoadingSummary ? 'animate-spin' : ''} />
                </button>
              </div>
              {isLoadingSummary ? (
                <div className="flex justify-center items-center h-20">
                  <Spinner />
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-300 space-y-2">
                  {summary.includes('*') || summary.includes('**') ? (
                    <ul className="list-none">
                      {formatSummary(summary)}
                    </ul>
                  ) : (
                    <p className="italic">{summary}</p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-4">Last updated: {new Date(lastSummaryTimeRef.current).toLocaleTimeString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;