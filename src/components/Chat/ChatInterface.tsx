import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Typography,
    Paper,
    Avatar,
    Divider,
    CircularProgress,
    ButtonGroup,
    Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'agent';
    timestamp: Date;
}

interface Agent {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    initialMessage: string;
    color: string;
    avatarUrl: string;
}

interface ChatInterfaceProps {
    selectedAgent: Agent;
    onAgentChange: (agent: Agent) => void;
}



const agents: Agent[] = [
    {
        id: 'business-strategy',
        name: 'Business Strategy',
        description: 'Get guidance on business model, market positioning, and strategic planning',
        systemPrompt: 'You are a business strategy expert specializing in startup development. Help founders with business model validation, market analysis, competitive positioning, and strategic planning. Provide actionable advice and frameworks.',
        initialMessage: 'Hello! I\'m your Business Strategy advisor. I can help you with business model development, market analysis, competitive positioning, and strategic planning. What aspect of your business strategy would you like to discuss today?',
        color: '#0075bc', // stakeholders color
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=business&backgroundColor=ffffff',
    },
    {
        id: 'product-development',
        name: 'Product Development',
        description: 'Expert guidance on product design, development process, and user experience',
        systemPrompt: 'You are a product development expert with deep knowledge of user-centered design, agile methodologies, MVP development, and product-market fit. Help founders build better products.',
        initialMessage: 'Hi there! I\'m your Product Development specialist. I can assist with product design, development methodologies, user experience optimization, and MVP strategies. What product challenge are you facing?',
        color: '#53c0d8', // product color
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product&backgroundColor=ffffff',
    },
    {
        id: 'fundraising',
        name: 'Fundraising',
        description: 'Navigate the fundraising process, investor relations, and pitch preparation',
        systemPrompt: 'You are a fundraising expert who helps startups prepare for funding rounds, develop compelling pitches, understand investor expectations, and navigate the fundraising process effectively.',
        initialMessage: 'Welcome! I\'m your Fundraising advisor. I can help you prepare for funding rounds, develop compelling pitches, understand investor expectations, and navigate the fundraising landscape. What funding stage are you targeting?',
        color: '#50ae3d', // sustainability color
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fundraising&backgroundColor=ffffff',
    },
    {
        id: 'team-building',
        name: 'Team Building',
        description: 'Build and manage high-performing teams, culture, and leadership',
        systemPrompt: 'You are a team building and organizational development expert. Help founders build strong teams, develop company culture, handle hiring challenges, and become effective leaders.',
        initialMessage: 'Hello! I\'m your Team Building specialist. I can help you build strong teams, develop company culture, handle hiring challenges, and become an effective leader. What team-related challenge are you working on?',
        color: '#d2132a', // team color
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=team&backgroundColor=ffffff',
    },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedAgent, onAgentChange }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Initialize with agent's initial message
        setMessages([
            {
                id: '1',
                content: selectedAgent.initialMessage,
                sender: 'agent',
                timestamp: new Date(),
            },
        ]);
    }, [selectedAgent]);

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    systemPrompt: selectedAgent.systemPrompt,
                    conversationHistory: messages.map(msg => ({
                        role: msg.sender === 'user' ? 'user' : 'assistant',
                        content: msg.content,
                    })),
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

            setMessages(prev => [...prev, agentMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Sorry, I encountered an error. Please try again.',
                sender: 'agent',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: selectedAgent.color, // Use main agent color
            alignItems: 'center', // Center the chat container
        }}>
            {/* Agent Selection Header */}
            <Box
                sx={{
                    p: 2,
                    mb: 2,
                    mt: 2,
                    width: '75%', // 3/4 width
                    maxWidth: '500px',
                }}
            >
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                    AI Startup Advisor
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Choose an expert to help with your startup challenges
                </Typography>
                <ButtonGroup variant="outlined" size="small" sx={{ width: '100%' }}>
                    {agents.map((agent) => (
                        <Button
                            key={agent.id}
                            onClick={() => onAgentChange(agent)}
                            variant={selectedAgent.id === agent.id ? 'contained' : 'outlined'}
                            sx={{
                                flex: 1,
                                backgroundColor: selectedAgent.id === agent.id ? 'white' : 'transparent',
                                color: selectedAgent.id === agent.id ? selectedAgent.color : 'white',
                                borderColor: 'white',
                                '&:hover': {
                                    backgroundColor: selectedAgent.id === agent.id ? 'white' : 'rgba(255, 255, 255, 0.1)',
                                },
                                '&.MuiButton-contained': {
                                    backgroundColor: 'white',
                                    color: selectedAgent.color,
                                },
                            }}
                        >
                            {agent.name}
                        </Button>
                    ))}
                </ButtonGroup>
            </Box>

            {/* Chat Container - Takes up 3/4 width */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '75%', // 3/4 of the available space
                width: '75%', // 3/4 width
                maxWidth: '500px',
                mb: 2, // Add bottom margin
            }}>
                {/* Messages Area */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mb: 2,
                    }}
                >
                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            sx={{
                                display: 'flex',
                                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                                mb: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1,
                                    maxWidth: '80%',
                                }}
                            >
                                {message.sender === 'agent' && (
                                    <Avatar
                                        src={selectedAgent.avatarUrl}
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            backgroundColor: 'white',
                                            border: '2px solid white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                )}
                                <Box
                                    sx={{
                                        p: 2,
                                        backgroundColor: message.sender === 'user' ? 'primary.main' : 'rgba(255, 255, 255, 0.5)', // White with 50% transparency
                                        color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {message.content}
                                    </Typography>
                                </Box>
                                {message.sender === 'user' && (
                                    <Avatar
                                        sx={{
                                            bgcolor: 'primary.main',
                                            width: 48,
                                            height: 48,
                                        }}
                                    >
                                        <PersonIcon sx={{ fontSize: 24 }} />
                                    </Avatar>
                                )}
                            </Box>
                        </Box>
                    ))}
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <Avatar
                                    src={selectedAgent.avatarUrl}
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        backgroundColor: 'white',
                                        border: '2px solid white',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                                    <CircularProgress size={20} />
                                </Box>
                            </Box>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>
            </Box>

            {/* Input Area - Fixed at bottom */}
            <Box sx={{
                p: 2,
                width: '75%', // 3/4 width
                maxWidth: '500px',
                mt: 'auto', // Push to bottom
            }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'white',
                                borderRadius: 2,
                            },
                        }}
                    />
                    <IconButton
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || isLoading}
                        color="primary"
                        sx={{ alignSelf: 'flex-end' }}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default ChatInterface; 