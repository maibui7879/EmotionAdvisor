

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EmotionEntry, Mood } from '../types';

interface AnalyticsChartProps {
  data: EmotionEntry[];
}

/**
 * Map categorical mood to a numeric score (1 = very negative/sad ... 10 = very positive/happy)
 * Adjust mapping as needed. The order should reflect negative -> positive.
 */
const moodToScore: Record<Mood, number> = {
  [Mood.Angry]: 1,
  [Mood.Sad]: 2,
  [Mood.Anxious]: 3,
  [Mood.Stressed]: 4,
  [Mood.Tired]: 5,
  [Mood.Neutral]: 6,
  [Mood.Peaceful]: 8,
  [Mood.Excited]: 9,
  [Mood.Happy]: 10,
};

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  // Transform data: group by 3-minute intervals and compute average mood score per interval
  const chartDataMap = new Map<string, { name: string; sum: number; count: number }>();

  data.slice().reverse().forEach(entry => {
    const date = new Date(entry.timestamp);
    const minutes = date.getMinutes();
    const interval = Math.floor(minutes / 3) * 3; // Round down to nearest 3-minute interval

    const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(interval).padStart(2, '0')}`;
    const dateStr = new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const key = `${dateStr} ${timeStr}`;

    if (!chartDataMap.has(key)) {
      chartDataMap.set(key, { name: key, sum: 0, count: 0 });
    }

    const dataPoint = chartDataMap.get(key)!;
    const score = moodToScore[entry.mood] ?? 6; // fallback to neutral if missing
    dataPoint.sum += score;
    dataPoint.count += 1;
  });

  const chartData = Array.from(chartDataMap.values()).map(d => ({
    name: d.name,
    moodScore: d.count > 0 ? Number((d.sum / d.count).toFixed(2)) : null,
  })).slice(0, 50);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Log your first mood to see your chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
        <XAxis dataKey="name" tick={{ fill: 'rgb(107 114 128)' }} />
        <YAxis domain={[1, 10]} tick={{ fill: 'rgb(107 114 128)' }} />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', border: 'none', borderRadius: '0.5rem', padding: '12px' }}
          labelStyle={{ color: '#fff', marginBottom: '8px' }}
          formatter={(value: any) => (value === undefined || value === null ? null : [value, 'Mood score (1-10)'])}
          wrapperStyle={{ outline: 'none' }}
        />
        <Legend formatter={() => 'Mood score (1-10)'} />

        <Line
          type="monotone"
          dataKey="moodScore"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={true}
          connectNulls={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsChart;

