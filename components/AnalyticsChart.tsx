

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EmotionEntry, Mood } from '../types';
import { MOOD_DETAILS } from '../constants';

interface AnalyticsChartProps {
  data: EmotionEntry[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  // Color mapping for each mood
  const moodColors: Record<Mood, string> = {
    [Mood.Happy]: '#fbbf24',      // amber
    [Mood.Sad]: '#3b82f6',        // blue
    [Mood.Anxious]: '#a855f7',    // purple
    [Mood.Stressed]: '#ef4444',   // red
    [Mood.Tired]: '#6b7280',      // gray
    [Mood.Peaceful]: '#10b981',   // emerald
    [Mood.Angry]: '#dc2626',      // dark red
    [Mood.Excited]: '#ec4899',    // pink
    [Mood.Neutral]: '#8b5cf6',    // violet
  };

  // Transform data: group by 3-minute intervals
  const chartDataMap = new Map<string, any>();
  
  data.slice().reverse().forEach(entry => {
    const date = new Date(entry.timestamp);
    const minutes = date.getMinutes();
    const interval = Math.floor(minutes / 3) * 3; // Round down to nearest 3-minute interval
    
    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(interval).padStart(2, '0')}`;
    const dateStr = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const key = `${dateStr} ${timeStr}`;
    
    if (!chartDataMap.has(key)) {
      chartDataMap.set(key, { name: key });
    }
    
    const dataPoint = chartDataMap.get(key);
    dataPoint[entry.mood] = entry.intensity;
  });

  const chartData = Array.from(chartDataMap.values()).slice(0, 50); // Limit to last 50 intervals for readability

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Log your first mood to see your chart.
      </div>
    );
  }

  // Get unique moods from data
  const uniqueMoods = Array.from(new Set(data.map(entry => entry.mood))) as Mood[];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey="name" tick={{ fill: 'rgb(107 114 128)' }} />
        <YAxis domain={[0, 10]} tick={{ fill: 'rgb(107 114 128)' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(31, 41, 55, 0.9)',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '12px',
          }}
          labelStyle={{ color: '#fff', marginBottom: '8px' }}
          formatter={(value: any, name: string) => {
            if (value === undefined || value === null) return null;
            return [value, `${name} (${MOOD_DETAILS[name as Mood]?.icon || ''})`];
          }}
          wrapperStyle={{
            outline: 'none',
          }}
        />
        <Legend 
          wrapperStyle={{
            paddingTop: '20px',
          }}
          formatter={(value: string) => `${MOOD_DETAILS[value as Mood]?.icon} ${value}`}
        />
        
        {/* Create a Line for each mood */}
        {uniqueMoods.map((mood) => (
          <Line
            key={mood}
            type="monotone"
            dataKey={mood}
            stroke={moodColors[mood]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsChart;

