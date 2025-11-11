import { EmotionEntry, ScheduleItem, ChatMessage, Mood } from '../types';

const EMOTIONS_KEY = 'SybauSuzuka-emotions';
const SCHEDULE_KEY = 'SybauSuzuka-schedule';
const CHAT_HISTORY_KEY = 'SybauSuzuka-chat-history';

// Emotion Entries
export const getEmotionEntries = (): EmotionEntry[] => {
    const data = localStorage.getItem(EMOTIONS_KEY);
    return data ? JSON.parse(data) : [];
};

// Fix: Add missing saveEmotionEntry function for EmotionLogger component
export const saveEmotionEntry = (entryData: Omit<EmotionEntry, 'id' | 'timestamp' | 'aiSuggestion'>): EmotionEntry => {
    const entries = getEmotionEntries();
    const newEntry: EmotionEntry = {
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        ...entryData,
    };
    entries.unshift(newEntry);
    localStorage.setItem(EMOTIONS_KEY, JSON.stringify(entries));
    return newEntry;
}

// Fix: Add missing updateEmotionEntry function for EmotionLogger component
export const updateEmotionEntry = (updatedEntry: EmotionEntry): void => {
    let items = getEmotionEntries();
    items = items.map(item => item.id === updatedEntry.id ? updatedEntry : item);
    localStorage.setItem(EMOTIONS_KEY, JSON.stringify(items));
};


export const saveDetectedEmotion = (userMessage: string, aiResponse: string, mood: Mood): EmotionEntry => {
    const entries = getEmotionEntries();
    const newEntry: EmotionEntry = {
        id: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        mood: mood,
        intensity: 5, // Placeholder, as intensity is now inferred
        note: userMessage,
        aiSuggestion: aiResponse,
    };
    entries.unshift(newEntry);
    localStorage.setItem(EMOTIONS_KEY, JSON.stringify(entries));
    return newEntry;
}

// Schedule Items
export const getScheduleItems = (): ScheduleItem[] => {
    const data = localStorage.getItem(SCHEDULE_KEY);
    return data ? JSON.parse(data) : [];
};

export const saveScheduleItem = (item: Omit<ScheduleItem, 'id' | 'completed' | 'date'>): ScheduleItem => {
    const items = getScheduleItems();
    const newItem: ScheduleItem = {
        ...item,
        id: new Date().toISOString() + Math.random(),
        completed: false,
        date: new Date().toISOString().split('T')[0],
    };

    // Prevent duplicates
    const existingTitles = new Set(items.map(i => i.title));
    if (!existingTitles.has(newItem.title)) {
        items.push(newItem);
        localStorage.setItem(SCHEDULE_KEY, JSON.stringify(items));
    }
    return newItem;
};

export const updateScheduleItem = (updatedItem: ScheduleItem): void => {
    let items = getScheduleItems();
    items = items.map(item => item.id === updatedItem.id ? updatedItem : item);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(items));
};


// Chat History
export const getChatHistory = (): ChatMessage[] => {
    const data = localStorage.getItem(CHAT_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
}

export const saveChatHistory = (history: ChatMessage[]): void => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}

/**
 * Clears the stored chat history from local storage.
 * FIX for Chat component error.
 */
export const clearChatHistory = (): void => {
    try {
        localStorage.removeItem(CHAT_HISTORY_KEY);
        console.log('Chat history cleared from storage.');
    } catch (error) {
        console.error('Error clearing chat history:', error);
    }
};