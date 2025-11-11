
import React, { useState } from 'react';
import { Mood, EmotionEntry } from '../types';
import { MOOD_DETAILS } from '../constants';
import { saveEmotionEntry, updateEmotionEntry } from '../services/storageService';
import { getPositiveSuggestion, getScheduleSuggestion } from '../services/geminiService';
import Spinner from './common/Spinner';
import { Language, t } from '../i18n';

interface EmotionLoggerProps {
  onEmotionLogged: () => void;
  addNotification: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const EmotionLogger: React.FC<EmotionLoggerProps> = ({ onEmotionLogged, addNotification }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const language: Language = (localStorage.getItem('language') as Language) || 'en';
    if (!selectedMood) {
      addNotification(language === 'vi' ? 'Vui lòng chọn cảm xúc.' : 'Please select a mood.', 'error');
      return;
    }
    setIsLoading(true);

    const newEntryData: Omit<EmotionEntry, 'id' | 'timestamp'> = {
      mood: selectedMood,
      intensity,
      note,
    };
    
    // Save entry without AI suggestion first for responsiveness
    const savedEntry = saveEmotionEntry(newEntryData);
  onEmotionLogged(); // Update UI immediately
  addNotification(t('emotion.success', (localStorage.getItem('language') as Language) || 'en'), 'success');

    // Then, get AI suggestion and update the entry
    const suggestion = await getPositiveSuggestion(newEntryData);
    const updatedEntry = { ...savedEntry, aiSuggestion: suggestion };
    updateEmotionEntry(updatedEntry);

    // Also get schedule suggestion
    if (note.trim().length > 0) {
        const scheduleSuggestions = await getScheduleSuggestion(note);
        if(scheduleSuggestions.length > 0) {
            addNotification(language === 'vi' ? 'AI đã đề xuất một vài hoạt động cho bạn. Kiểm tra lịch trình!' : 'AI has suggested some activities for you. Check your schedule!', 'info');
            // The schedule component will read from storage, so we just need to save them.
            // This is a simplified approach. In a real app, you'd probably use a global state.
            const { saveScheduleItem } = await import('../services/storageService');
            scheduleSuggestions.forEach(s => saveScheduleItem({title: s.title!, startTime: s.startTime!, endTime: s.endTime!}));
        }
    }


    onEmotionLogged(); // Re-render dashboard with new suggestion
    setSelectedMood(null);
    setIntensity(5);
    setNote('');
    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
  <h2 className="text-xl font-semibold mb-4">{t('emotion.title', (localStorage.getItem('language') as Language) || 'en')}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('emotion.mood', (localStorage.getItem('language') as Language) || 'en')}</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.values(Mood).map(mood => (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMood(mood)}
                className={`p-3 rounded-lg flex flex-col items-center justify-center transition-transform transform hover:scale-110 ${selectedMood === mood ? 'ring-2 ring-primary-500 bg-primary-100 dark:bg-primary-900' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                <span className="text-3xl">{MOOD_DETAILS[mood].icon}</span>
                <span className="text-xs mt-1">{mood}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label htmlFor="intensity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emotion.intensity', (localStorage.getItem('language') as Language) || 'en')}: {intensity}</label>
          <input
            id="intensity"
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 mt-2"
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('emotion.note', (localStorage.getItem('language') as Language) || 'en')}</label>
          <textarea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 block w-full rounded-md bg-gray-100 dark:bg-gray-700 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0"
            placeholder={ (localStorage.getItem('language') as Language) === 'vi' ? 'Bạn đang nghĩ gì?' : "What's on your mind?" }
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !selectedMood}
          className="w-full flex justify-center items-center px-4 py-3 font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? <Spinner /> : ( (localStorage.getItem('language') as Language) === 'vi' ? 'Lưu cảm xúc' : 'Save Mood') }
        </button>
      </form>
    </div>
  );
};

export default EmotionLogger;
