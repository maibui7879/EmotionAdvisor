import { GoogleGenAI, Type } from '@google/genai';
import { EmotionEntry, ChatMessage, Mood, ScheduleItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const moodValues = Object.values(Mood).join(', ');

export const analyzeMoodAndGetResponse = async (history: ChatMessage[], newMessage: string, imageBase64?: string): Promise<{ mood: Mood; responseText: string }> => {
  try {
    const model = 'gemini-2.0-flash';
    
    const userParts: any[] = [];
    userParts.push({ text: `User's message in Vietnamese: "${newMessage}"` });

    const hasImage = !!imageBase64;
    
    if (imageBase64) {
      userParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      });
      userParts.push({ text: "Also, consider the user's facial expression in this image." });
    }
    
    const contents: any = [
      ...history.map(msg => ({
        role: msg.role,
        parts: [{text: msg.text}]
      })),
      { role: 'user', parts: userParts }
    ];

    // Adjust system prompt based on camera availability
    const systemInstruction = hasImage 
      ? `You are Sybau Suzuka, an empathetic AI mental health assistant. Your goal is to provide supportive and helpful conversations in Vietnamese and English. Do not give medical advice.

**Mood Analysis (With Image):**
1. Your primary task is to determine the user's mood by analyzing their facial expression from the provided image. This is the most important factor.
2. Use the user's text message for additional context, but if the text and image suggest conflicting emotions, give significantly more weight to the visual information from the image.
3. Based on this analysis, choose one primary mood from this list: [${moodValues}]. Default to 'Neutral' if unsure.

**Response Generation:**
4. Craft a supportive and conversational response in Vietnamese that acknowledges their feelings.
5. Use line breaks and formatting to make the response easy to read.
6. Keep responses concise (2-3 paragraphs maximum).

**Output Format:**
7. Respond ONLY with a JSON object.`
      : `You are Sybau Suzuka, an empathetic AI mental health assistant. Your goal is to provide supportive and helpful conversations in Vietnamese. Do not give medical advice.

**Mood Analysis (Text-Based Priority):**
1. Since no image is available, focus on analyzing the user's message context deeply:
   * Analyze the choice of words (positive/negative vocabulary)
   * Understand the situation and context they're describing
   * Look for emotional indicators in their message tone
   * Consider the user's recent chat history for patterns and trends
2. Based on the text analysis, choose one primary mood from this list: [${moodValues}]. Default to 'Neutral' if unsure.
3. When uncertain between multiple moods, use the conversation history to make better inference.

**Response Generation:**
4. Craft a supportive and conversational response in Vietnamese that acknowledges their feelings.
5. Use line breaks and formatting to make the response easy to read.
6. Keep responses concise (2-3 paragraphs maximum).
7. Reference specific details from their message to show you understand their situation.

**Output Format:**
8. Respond ONLY with a JSON object.`;

    const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    mood: { type: Type.STRING, enum: Object.values(Mood) },
                    responseText: { type: Type.STRING }
                },
                required: ["mood", "responseText"]
            }
        }
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    return {
        mood: parsedResponse.mood as Mood || Mood.Neutral,
        responseText: parsedResponse.responseText,
    }

  } catch (error) {
    console.error("Error getting chat response:", error);
    return {
        mood: Mood.Neutral,
        responseText: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.",
    };
  }
};


export const getAnalyticsSummary = async (entries: EmotionEntry[]): Promise<string> => {
    if (entries.length === 0) return "No data to analyze yet. Start chatting to see your trends!";
    try {
        const prompt = `Here is a JSON of a user's emotion entries for the past week: ${JSON.stringify(entries)}. 

Analyze this data to identify trends, such as:
* The most frequent emotions
* Patterns over time
* Overall mood trends

Provide a short, insightful, and encouraging summary in Vietnamese with proper formatting (use line breaks, bold text where appropriate).

Example format:
**Tuần này bạn có vẻ như:**
* Bạn đã trải qua nhiều cung bậc cảm xúc
* Thái độ chủ yếu là (emotion)

Thật tuyệt khi bạn đã luôn ý thức về chúng. Cố lên nhé!`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting analytics summary:", error);
        return "Could not generate summary at this time.";
    }
}


export const getScheduleSuggestion = async (note: string): Promise<Partial<ScheduleItem>[]> => {
    try {
        const prompt = `A user wrote this emotional note in Vietnamese: "${note}". 

Based on this, suggest one or two simple, mood-boosting activities they could schedule today. 

For each activity, provide:
* **title** - Activity name in Vietnamese
* **startTime** - Format: HH:MM (e.g., 14:30)
* **endTime** - Format: HH:MM (e.g., 15:30)

Make sure activities don't overlap and are within the next 24 hours. Activities should be positive and help improve mood.

Respond ONLY with a JSON array.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            startTime: { type: Type.STRING, description: "Format: HH:MM" },
                            endTime: { type: Type.STRING, description: "Format: HH:MM" },
                        },
                        required: ["title", "startTime", "endTime"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error getting schedule suggestion:", error);
        return [];
    }
}

// Fix: Add missing getPositiveSuggestion function for EmotionLogger component
export const getPositiveSuggestion = async (entry: Omit<EmotionEntry, 'id' | 'timestamp' | 'aiSuggestion'>): Promise<string> => {
    try {
        const prompt = `A user is feeling **${entry.mood}** (intensity: ${entry.intensity}/10). They wrote this note: "${entry.note}". 

Provide a short, supportive, and encouraging response in Vietnamese. 

Format your response with:
* Clear line breaks between thoughts
* Use **bold** for key points
* Keep it concise (2-3 paragraphs maximum)
* Be empathetic and understanding`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting positive suggestion:", error);
        return "Could not generate a suggestion at this time.";
    }
}