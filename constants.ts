import { Mood } from './types';

export const MOOD_DETAILS: Record<Mood, { icon: string; color: string; darkColor: string }> = {
  [Mood.Happy]: { icon: '😊', color: 'text-yellow-500', darkColor: 'dark:text-yellow-400' },
  [Mood.Sad]: { icon: '😢', color: 'text-blue-500', darkColor: 'dark:text-blue-400' },
  [Mood.Anxious]: { icon: '😟', color: 'text-purple-500', darkColor: 'dark:text-purple-400' },
  [Mood.Stressed]: { icon: '😫', color: 'text-orange-500', darkColor: 'dark:text-orange-400' },
  [Mood.Tired]: { icon: '😴', color: 'text-gray-500', darkColor: 'dark:text-gray-400' },
  [Mood.Peaceful]: { icon: '😌', color: 'text-green-500', darkColor: 'dark:text-green-400' },
  [Mood.Angry]: { icon: '😠', color: 'text-red-500', darkColor: 'dark:text-red-400' },
  [Mood.Excited]: { icon: '🤩', color: 'text-pink-500', darkColor: 'dark:text-pink-400' },
  [Mood.Neutral]: { icon: '😐', color: 'text-gray-500', darkColor: 'dark:text-gray-400' },
};