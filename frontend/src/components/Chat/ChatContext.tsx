import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'agent';
    timestamp: Date;
}

interface ChatContextType {
    messages: Message[];
    addMessage: (message: Message) => void;
    sendProgrammaticMessage: (content: string, systemPrompt: string) => Promise<void>;
    clearMessages: () => void;
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

    const sendProgrammaticMessage = useCallback(async (content: string, systemPrompt: string) => {
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
            // Get current messages for conversation history
            const currentMessages = messages;
            const conversationHistory = currentMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.content,
            }));

            // Send the API request with system prompt hidden from user
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    systemPrompt,
                    conversationHistory,
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
            isLoading,
            isMobileKeyboardVisible,
            setMobileKeyboardVisible: setIsMobileKeyboardVisible,
        }}>
            {children}
        </ChatContext.Provider>
    );
}; 