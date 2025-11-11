import React, { useState, useEffect } from 'react';
import { EmotionEntry } from '../types';
import { getEmotionEntries } from '../services/storageService';
import { MOOD_DETAILS } from '../constants';
import { Bot, MessageSquare } from 'lucide-react';
import { Language, t } from '../i18n';

const EmotionHistory: React.FC = () => {
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const language: Language = (localStorage.getItem('language') as Language) || 'en';

  useEffect(() => {
    setEntries(getEmotionEntries());
  }, []);

  return (
    <div className="space-y-6">
  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('history.title', language)}</h1>
  <p className="text-gray-500 dark:text-gray-400">{t('history.subtitle', language)}</p>
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all hover:shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{MOOD_DETAILS[entry.mood].icon}</span>
                  <div>
                    <h3 className={`text-lg font-semibold ${MOOD_DETAILS[entry.mood].color} ${MOOD_DETAILS[entry.mood].darkColor}`}>{entry.mood}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              {entry.note && (
                 <div className="mt-4 flex items-start space-x-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <MessageSquare size={20} className="flex-shrink-0 mt-0.5 text-gray-400" />
                  <p className="italic">{language === 'vi' ? `Bạn đã nói: "${entry.note}"` : `You said: "${entry.note}"`}</p>
                </div>
              )}
              {entry.aiSuggestion && (
                <div className="mt-2 flex items-start space-x-3 text-sm text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/50 p-3 rounded-lg">
                  <Bot size={20} className="flex-shrink-0 mt-0.5" />
                  <p className="italic">{language === 'vi' ? `SybauSuzuka trả lời: "${entry.aiSuggestion}"` : `SybauSuzuka replied: "${entry.aiSuggestion}"`}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">{t('history.noHistory', language)}</p>
          <p className="text-sm mt-2 text-gray-400">{t('history.empty', language)}</p>
        </div>
      )}
    </div>
  );
};

export default EmotionHistory;