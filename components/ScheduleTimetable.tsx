import React, { useState, useEffect, useCallback } from 'react';
import { ScheduleItem } from '../types';
import { getScheduleItems, updateScheduleItem, saveScheduleItem } from '../services/storageService';
import { groupSchedulesByDate, sortSchedulesByTime, timeToMinutes } from '../services/scheduleService';
import { CheckCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Language, t } from '../i18n';

const ScheduleTimetable: React.FC<{ addNotification: (message: string, type?: 'info' | 'success' | 'error') => void; }> = ({ addNotification }) => {
  const [allSchedules, setAllSchedules] = useState<ScheduleItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [daySchedules, setDaySchedules] = useState<ScheduleItem[]>([]);
  const language: Language = (localStorage.getItem('language') as Language) || 'en';

  const fetchSchedules = useCallback(() => {
    const items = getScheduleItems();
    setAllSchedules(items);
    
    const filtered = items.filter(item => item.date === currentDate);
    setDaySchedules(sortSchedulesByTime(filtered));
  }, [currentDate]);

  useEffect(() => {
    fetchSchedules();
    const interval = setInterval(fetchSchedules, 5000);
    return () => clearInterval(interval);
  }, [fetchSchedules]);

  const toggleComplete = (item: ScheduleItem) => {
    const updated = { ...item, completed: !item.completed };
    updateScheduleItem(updated);
    fetchSchedules();
    addNotification(
      item.completed ? (language === 'vi' ? `Bỏ đánh dấu "${item.title}"` : `Unmarked "${item.title}"`) : (language === 'vi' ? `Đã hoàn thành "${item.title}"!` : `Completed "${item.title}"!`),
      item.completed ? 'info' : 'success'
    );
  };

  const deleteSchedule = (id: string) => {
    setDaySchedules(prev => prev.filter(item => item.id !== id));
    const allItems = getScheduleItems();
    const updated = allItems.filter(item => item.id !== id);
    allItems.forEach(item => item.id !== id ? null : null);
    // Simple delete by re-filtering
    setAllSchedules(allItems.filter(item => item.id !== id));
  addNotification(language === 'vi' ? 'Đã xóa lịch' : 'Schedule item deleted', 'info');
  };

  const previousDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - 1);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const nextDay = () => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + 1);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const today = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const timeSlots = hours.map(hour => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
  }));

  // Group schedules by hour
  const schedulesByHour: Record<number, ScheduleItem[]> = {};
  daySchedules.forEach(schedule => {
    const startHour = Math.floor(timeToMinutes(schedule.startTime) / 60);
    if (!schedulesByHour[startHour]) {
      schedulesByHour[startHour] = [];
    }
    schedulesByHour[startHour].push(schedule);
  });

  const displayDate = new Date(currentDate);
  const isToday = currentDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('schedule.title', language)}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('schedule.subtitle', language)}</p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
        <button
          onClick={previousDay}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {displayDate.toLocaleDateString((language === 'vi' ? 'vi-VN' : 'en-US'), { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          {isToday && <span className="text-sm text-primary-500 font-semibold">{language === 'vi' ? 'Hôm nay' : 'Today'}</span>}
        </div>

        <div className="flex gap-2">
          {!isToday && (
            <button
              onClick={today}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              {language === 'vi' ? 'Hôm nay' : 'Today'}
            </button>
          )}
          <button
            onClick={nextDay}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Timetable */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 w-20">
                  Time
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                  Activities
                </th>
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, idx) => (
                <tr
                  key={slot.hour}
                  className={`border-b border-gray-200 dark:border-gray-600 ${
                    idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <td className="px-4 py-4 font-mono font-semibold text-gray-700 dark:text-gray-300 sticky left-0">
                    {slot.label}
                  </td>
                  <td className="px-4 py-4">
                    {schedulesByHour[slot.hour] && schedulesByHour[slot.hour].length > 0 ? (
                      <div className="space-y-2">
                        {schedulesByHour[slot.hour].map(schedule => (
                          <div
                            key={schedule.id}
                            className={`p-3 rounded-lg border-l-4 transition-all ${
                              schedule.completed
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 opacity-60'
                                : 'bg-blue-50 dark:bg-blue-900/20 border-primary-500 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p
                                  className={`font-medium ${
                                    schedule.completed
                                      ? 'line-through text-gray-500'
                                      : 'text-gray-800 dark:text-gray-200'
                                  }`}
                                >
                                  {schedule.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {schedule.startTime} - {schedule.endTime}
                                </p>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  onClick={() => toggleComplete(schedule)}
                                  className={`p-1.5 rounded transition-colors ${
                                    schedule.completed
                                      ? 'bg-green-200 dark:bg-green-900 text-green-700'
                                      : 'hover:bg-primary-100 dark:hover:bg-primary-900/30 text-gray-500 hover:text-primary-500'
                                  }`}
                                  title="Toggle complete"
                                >
                                  <CheckCircle size={16} />
                                </button>
                                <button
                                  onClick={() => deleteSchedule(schedule.id)}
                                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-500 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm italic">No activities</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {daySchedules.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No schedules for this day
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Your wellness activities will appear here
          </p>
        </div>
      )}
    </div>
  );
};

export default ScheduleTimetable;
