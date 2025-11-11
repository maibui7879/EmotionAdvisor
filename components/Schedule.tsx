
import React, { useState, useEffect, useCallback } from 'react';
import { ScheduleItem } from '../types';
import { getScheduleItems, updateScheduleItem } from '../services/storageService';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';

const Schedule: React.FC<{ addNotification: (message: string, type?: 'info' | 'success' | 'error') => void; }> = ({ addNotification }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  
  const fetchSchedule = useCallback(() => {
    const items = getScheduleItems().filter(item => {
        // Simple filter for today's items
        return item.date === new Date().toISOString().split('T')[0];
    });
    setSchedule(items.sort((a,b) => a.startTime.localeCompare(b.startTime)));
  }, []);

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(fetchSchedule, 5000); // Poll for updates from other tabs/components
    return () => clearInterval(interval);
  }, [fetchSchedule]);
  
  useEffect(() => {
      schedule.forEach(item => {
          if (item.completed) return;

          const [hours, minutes] = item.startTime.split(':').map(Number);
          const now = new Date();
          const itemTime = new Date();
          itemTime.setHours(hours, minutes, 0, 0);

          const timeToNotification = itemTime.getTime() - now.getTime() - 15 * 60 * 1000;
          
          if (timeToNotification > 0) {
              const timerId = setTimeout(() => {
                  addNotification(`Reminder: "${item.title}" is in 15 minutes!`, 'info');
              }, timeToNotification);

              return () => clearTimeout(timerId);
          }
      });
  }, [schedule, addNotification]);

  const toggleComplete = (item: ScheduleItem) => {
    const updatedItem = { ...item, completed: !item.completed };
    updateScheduleItem(updatedItem);
    fetchSchedule();
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Today's Wellness Schedule</h1>
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
        {schedule.length > 0 ? (
          <ul className="space-y-4">
            {schedule.map(item => (
              <li
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                  item.completed ? 'bg-green-50 dark:bg-green-900/50 text-gray-500' : 'bg-gray-50 dark:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <button onClick={() => toggleComplete(item)}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                      {item.completed && <CheckCircle size={16} className="text-white"/>}
                    </div>
                  </button>
                  <div>
                    <p className={`font-medium ${item.completed ? 'line-through' : ''}`}>{item.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{item.startTime} - {item.endTime}</span>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Your schedule for today is clear.</p>
            <p className="text-sm mt-2 text-gray-400">AI might suggest activities based on your mood logs.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
