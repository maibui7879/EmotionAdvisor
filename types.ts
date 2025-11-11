export type Theme = 'light' | 'dark';
export type ColorTheme = 'green' | 'blue' | 'purple' | 'orange';

export type Page = 'dashboard' | 'chat' | 'history' | 'schedule' | 'profile' | 'notifications';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
}

export enum Mood {
  Happy = 'Happy',
  Sad = 'Sad',
  Anxious = 'Anxious',
  Stressed = 'Stressed',
  Tired = 'Tired',
  Peaceful = 'Peaceful',
  Angry = 'Angry',
  Excited = 'Excited',
  Neutral = 'Neutral',
}

export interface EmotionEntry {
  id: string;
  mood: Mood;
  intensity: number; // Will be inferred by AI
  note: string; // The user's chat message
  timestamp: string;
  aiSuggestion?: string; // The AI's chat response
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  detectedMood?: Mood;
  suggestedSchedules?: SuggestedSchedule[];
}

export interface SuggestedSchedule {
  id: string;
  title: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  accepted: boolean;
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  date: string; // "YYYY-MM-DD"
  completed: boolean;
}

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}