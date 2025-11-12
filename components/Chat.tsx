import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, Mood, SuggestedSchedule } from '../types';
import { analyzeMoodAndGetResponse, getScheduleSuggestion } from '../services/geminiService';
import { getChatHistory, saveChatHistory, saveDetectedEmotion, saveScheduleItem, getScheduleItems, updateScheduleItem } from '../services/storageService';
import { Send, User, Bot, Video, Zap, X, PlusCircle, CheckCircle as CheckCircleIcon, XCircle } from 'lucide-react';
import { adjustScheduleTime, findConflicts } from '../services/scheduleService';
import Spinner from './common/Spinner';
import { MOOD_DETAILS } from '../constants';


interface ChatProps {
    addNotification: (message: string, type?: 'info' | 'success' | 'error') => void;
}

// Draggable Cam Popup Component
const DraggableCamPopup: React.FC<{
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    isOpen: boolean;
    onClose: () => void;
    position: { x: number, y: number };
    onDrag: (e: React.MouseEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
}> = ({ videoRef, canvasRef, isOpen, onClose, position, onDrag, onMouseDown }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="absolute z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 cursor-move"
            style={{ top: position.y, left: position.x }}
            onMouseDown={onMouseDown}
            onMouseMove={onDrag}
            onMouseUp={onDrag} // Stop drag handler is on the parent container (Chat)
        >
            <div className="flex justify-between items-center mb-1 pb-1 border-b dark:border-gray-700">
                <span className="text-xs font-semibold flex items-center gap-1">
                    <Video size={14} className="text-primary-500" /> Live Mood Cam
                </span>
                <button 
                    onClick={onClose} 
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                    <X size={14} />
                </button>
            </div>
            <div className="relative w-32 h-24 rounded-lg overflow-hidden shadow-inner bg-black">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        </div>
    );
};


const Chat: React.FC<ChatProps> = ({ addNotification }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(getChatHistory());
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastDetectedMood, setLastDetectedMood] = useState<Mood | null>(null);

    // Draggable Cam State
    const [isCamOpen, setIsCamOpen] = useState(true);
    const [camPosition, setCamPosition] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const dragOffset = useRef({ x: 0, y: 0 });

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- Effects and Setup ---

    useEffect(() => {
        scrollToBottom();
    }, [messages, lastDetectedMood]);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                addNotification("Could not access camera. Please check permissions.", "error");
            }
        };

        if (isCamOpen) {
            startCamera();
        }

        return () => { // Cleanup on unmount/cam close
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        }
    }, [addNotification, isCamOpen]);

    // --- Drag Handlers for Popup ---

    const startDrag = (e: React.MouseEvent) => {
        e.preventDefault();
        const rect = chatContainerRef.current?.getBoundingClientRect();
        if (rect) {
            dragStart.current = { x: e.clientX, y: e.clientY };
            dragOffset.current = { 
                x: e.clientX - camPosition.x - rect.left, 
                y: e.clientY - camPosition.y - rect.top 
            };
            setIsDragging(true);
        }
    };

    const onDrag = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !chatContainerRef.current) return;
        
        const rect = chatContainerRef.current.getBoundingClientRect();
        
        // Calculate new position relative to the chat container
        let newX = e.clientX - dragOffset.current.x - rect.left;
        let newY = e.clientY - dragOffset.current.y - rect.top;

        // Simple boundary check (assuming cam size is ~144px wide, ~112px tall)
        newX = Math.max(0, Math.min(newX, rect.width - 150));
        newY = Math.max(0, Math.min(newY, rect.height - 130));

        setCamPosition({ x: newX, y: newY });
    }, [isDragging]);

    const stopDrag = useCallback(() => {
        setIsDragging(false);
    }, []);

    // --- Core Chat Functions ---

    const captureFrame = useCallback((): string | undefined => {
        if (!videoRef.current?.srcObject || !canvasRef.current) {
            return undefined;
        }
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        }
        return undefined;
    }, []);

    const handleNewChat = () => {
        setMessages([]);
        saveChatHistory([]);
        setLastDetectedMood(null);
        setInput('');
        addNotification("New chat started!", "info");
    };


    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date().toISOString(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setLastDetectedMood(null);

        // Only capture frame if the camera is currently open
        const imageBase64 = isCamOpen ? captureFrame() : undefined;

        try {
            const { mood, responseText } = await analyzeMoodAndGetResponse(messages, currentInput, imageBase64);

            setLastDetectedMood(mood);

            // Get schedule suggestions only if contextually relevant
            const negativeMoods = ['Anxious', 'Stressed', 'Tired', 'Sad', 'Angry'];
            const triggerKeywords = ['anxious', 'stressed', 'tired', 'sad', 'depressed', 'lonely', 'worry', 'lo lắng', 'căng thẳng', 'mệt', 'buồn', 'chán', 'stress'];
            
            let suggestedSchedules: SuggestedSchedule[] = [];
            
            const shouldGetScheduleSuggestion = 
              currentInput.trim().length > 0 && (
                negativeMoods.includes(mood) ||
                triggerKeywords.some(keyword => currentInput.toLowerCase().includes(keyword))
              );

            if (shouldGetScheduleSuggestion) {
              const scheduleSuggestions = await getScheduleSuggestion(currentInput);
              suggestedSchedules = scheduleSuggestions.map((s, idx) => ({
                  id: `${Date.now()}-${idx}`,
                  title: s.title || '',
                  startTime: s.startTime || '09:00',
                  endTime: s.endTime || '10:00',
                  accepted: false,
              }));
            }

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: responseText,
                timestamp: new Date().toISOString(),
                suggestedSchedules: suggestedSchedules.length > 0 ? suggestedSchedules : undefined,
            };

            const finalMessages = [...newMessages, aiMessage];
            setMessages(finalMessages);
            saveChatHistory(finalMessages);
            saveDetectedEmotion(currentInput, responseText, mood);

            if (suggestedSchedules.length > 0) {
                addNotification(`AI suggested ${suggestedSchedules.length} activities for you!`, "info");
            }
        } catch (error) {
            console.error("AI response error:", error);
            addNotification("Failed to get response from AI.", "error");
            // Optionally revert messages if AI fails completely
            setMessages(newMessages); 
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptSchedule = useCallback((messageId: string, scheduleId: string) => {
        setMessages(prevMessages => 
            prevMessages.map(msg => {
                if (msg.id === messageId && msg.suggestedSchedules) {
                    return {
                        ...msg,
                        suggestedSchedules: msg.suggestedSchedules.map(s => 
                            s.id === scheduleId ? { ...s, accepted: true } : s
                        ),
                    };
                }
                return msg;
            })
        );

        // Add to schedule
        const message = messages.find(m => m.id === messageId);
        if (message?.suggestedSchedules) {
            const schedule = message.suggestedSchedules.find(s => s.id === scheduleId);
            if (schedule) {
                const today = new Date().toISOString().split('T')[0];
                const existingSchedules = getScheduleItems().filter(s => s.date === today);
                
                const newSchedule = {
                    title: schedule.title,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                };

                // Check for conflicts and adjust time if needed
                const conflicts = findConflicts(
                    [{ ...newSchedule, id: `temp-${Date.now()}`, date: today, completed: false }],
                    existingSchedules
                );

                if (conflicts.length > 0) {
                    const adjusted = adjustScheduleTime(
                        { ...newSchedule, id: `temp-${Date.now()}`, date: today, completed: false },
                        existingSchedules
                    );
                    saveScheduleItem({
                        title: adjusted.title,
                        startTime: adjusted.startTime,
                        endTime: adjusted.endTime,
                    });
                    addNotification(
                        `Schedule adjusted to ${adjusted.startTime} - ${adjusted.endTime} (conflict detected)`,
                        'info'
                    );
                } else {
                    saveScheduleItem(newSchedule);
                    addNotification(`"${schedule.title}" added to your schedule!`, 'success');
                }
            }
        }
    }, [messages, addNotification]);

    // --- Render ---

    return (
        // Added onMouseMove and onMouseUp to the main container for dragging logic
        <div 
            className="relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl" 
            ref={chatContainerRef}
            onMouseMove={onDrag}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag} // Stop dragging if mouse leaves the main chat area
        >
            <DraggableCamPopup
                videoRef={videoRef}
                canvasRef={canvasRef}
                isOpen={isCamOpen}
                onClose={() => setIsCamOpen(false)}
                position={camPosition}
                onDrag={onDrag}
                onMouseDown={startDrag}
            />
            
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-semibold">AI Assistant</h1>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handleNewChat} 
                        className="p-2 rounded-full text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 text-sm font-medium"
                        title="Start a new chat"
                    >
                        <PlusCircle size={20} /> New Chat
                    </button>
                    <button 
                        onClick={() => setIsCamOpen(prev => !prev)} 
                        className={`p-2 rounded-full ${isCamOpen ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'} transition-colors`}
                        title={isCamOpen ? "Live camera active (Click to hide)" : "Live camera disabled (Click to show)"}
                    >
                        <Video size={20} />
                    </button>
                </div>
            </div>
            
            {/* Chat Messages Area - takes up remaining vertical space */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                    <div key={index}>
                        <div className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                            {message.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                                    <Bot size={20} className="text-white" />
                                </div>
                            )}
                            <div className={`max-w-md p-3 rounded-2xl ${
                                message.role === 'user'
                                    ? 'bg-primary-500 text-white rounded-br-none'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            </div>
                            {message.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                                    <User size={20} />
                                </div>
                            )}
                        </div>

                        {/* Schedule Suggestions */}
                        {message.suggestedSchedules && message.suggestedSchedules.length > 0 && (
                            <div className="mt-3 ml-11">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500 space-y-2">
                                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                                        💡 Suggested Activities
                                    </p>
                                    {message.suggestedSchedules.map(schedule => (
                                        <div
                                            key={schedule.id}
                                            className={`flex items-center justify-between p-2 rounded border transition-all ${
                                                schedule.accepted
                                                    ? 'bg-green-100 dark:bg-green-900/30 border-green-500'
                                                    : 'bg-white dark:bg-gray-700/50 border-blue-200 dark:border-blue-800 hover:border-blue-400'
                                            }`}
                                        >
                                            <div className="flex-1">
                                                <p className={`text-sm font-medium ${schedule.accepted ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                                    {schedule.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {schedule.startTime} - {schedule.endTime}
                                                </p>
                                            </div>

                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleAcceptSchedule(message.id, schedule.id)}
                                                    disabled={schedule.accepted}
                                                    className={`p-1.5 rounded transition-colors ${
                                                        schedule.accepted
                                                            ? 'bg-green-200 dark:bg-green-800 text-green-700'
                                                            : 'hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-500 hover:text-green-600'
                                                    }`}
                                                    title="Accept"
                                                >
                                                    <CheckCircleIcon size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Mood Detection/Loading Indicator */}
                {(isLoading || lastDetectedMood) && (
                    <div className="flex justify-center my-2">
                        <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/50 rounded-full px-3 py-1 flex items-center gap-2">
                            {isLoading && !lastDetectedMood && <><Spinner /> Analyzing...</>}
                            {lastDetectedMood && !isLoading && <>
                                <Zap size={14} className="text-yellow-500" />
                                Mood Detected: <span className="font-semibold">{MOOD_DETAILS[lastDetectedMood].icon} {lastDetectedMood}</span>
                            </>}
                        </div>
                    </div>
                )}

                {/* AI Typing Indicator */}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div className="max-w-md p-3 rounded-2xl bg-gray-200 dark:bg-gray-700">
                            <Spinner/>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-0"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="p-3 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300 transition-colors">
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;