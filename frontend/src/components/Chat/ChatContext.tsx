import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'agent';
    timestamp: Date;
}

interface ChatContextType {
    messages: Message[];
    addMessage: (message: Message) => void;
    sendProgrammaticMessage: (content: string, systemPrompt: string, agentId: string, startupId?: string) => Promise<void>;
    clearMessages: () => void;
    loadConversation: (agentId: string, startupId?: string) => Promise<void>;
    isLoading: boolean;
    isMobileKeyboardVisible: boolean;
    setMobileKeyboardVisible: (visible: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMobileKeyboardVisible, setIsMobileKeyboardVisible] = useState(false);

    const addMessage = useCallback((message: Message) => {
        setMessages(prev => [...prev, message]);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // Load conversation history from backend
    const loadConversation = useCallback(async (agentId: string, startupId?: string) => {
        try {
            // Get auth token
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                console.log('No auth token, skipping conversation load');
                setMessages([]);
                return;
            }

            // Call backend to get conversation history
            const response = await fetch(`/api/chat/history?agent_id=${agentId}${startupId ? `&startup_id=${startupId}` : ''}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load conversation');
            }

            const data = await response.json();

            // Convert backend messages to UI messages
            const loadedMessages: Message[] = data.messages.map((msg: any) => ({
                id: msg.id,
                content: msg.content,
                sender: msg.sender,
                timestamp: new Date(msg.created_at),
            }));

            setMessages(loadedMessages);
        } catch (error) {
            console.error('Error loading conversation:', error);
            // Continue without persistence on error
            setMessages([]);
        }
    }, []);

    const sendProgrammaticMessage = useCallback(async (content: string, systemPrompt: string, agentId: string, startupId?: string) => {
        // Only show the user's question, not the system prompt
        const userMessage: Message = {
            id: Date.now().toString(),
            content: content,
            sender: 'user',
            timestamp: new Date(),
        };

        addMessage(userMessage);
        setIsLoading(true);

        try {
            // Get auth token
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // Get current messages for conversation history
            const conversationHistory = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content,
            }));

            // Send the API request - backend will save messages
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    message: content,
                    systemPrompt,
                    conversationHistory,
                    agentId,
                    startupId: startupId || null,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            const agentMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.response,
                sender: 'agent',
                timestamp: new Date(),
            };
            addMessage(agentMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Sorry, I encountered an error. Please try again.',
                sender: 'agent',
                timestamp: new Date(),
            };
            addMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [messages, addMessage]);

    return (
        <ChatContext.Provider value={{
            messages,
            addMessage,
            sendProgrammaticMessage,
            clearMessages,
            loadConversation,
            isLoading,
            isMobileKeyboardVisible,
            setMobileKeyboardVisible: setIsMobileKeyboardVisible,
        }}>
            {children}
        </ChatContext.Provider>
    );
}; 