
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { EmotionEntry } from '../types';

interface AnalyticsChartProps {
  data: EmotionEntry[];
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  const chartData = data.slice().reverse().map(entry => ({
    name: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    intensity: entry.intensity,
    mood: entry.mood,
  }));

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
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: 'none',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#fff' }}
          itemStyle={{ color: '#818cf8' }}
        />
        <Legend />
        <Line type="monotone" dataKey="intensity" stroke="#6366f1" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsChart;
