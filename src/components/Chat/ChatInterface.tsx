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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { categoryColors, categoryDisplayNames } from '../../utils/constants';

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



// General coach - separated and prominent
const generalCoach: Agent = {
    id: 'general-coach',
    name: 'General Coach',
    description: 'Your comprehensive startup advisor for all aspects of entrepreneurship',
    systemPrompt: 'You are a comprehensive startup coach with expertise across all areas of entrepreneurship. Help founders with business strategy, product development, team building, stakeholder management, sustainability, and time management. Provide holistic guidance and actionable advice.',
    initialMessage: 'Hello! I\'m your General Coach, here to help you with any aspect of your startup journey. Whether it\'s business strategy, product development, team building, stakeholder management, sustainability, or time management - I\'m here to guide you. What would you like to discuss today?',
    color: '#07bce5', // primary color
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach&backgroundColor=ffffff',
};

// Specialized agents for each category
const specializedAgents: Agent[] = [
    {
        id: 'entrepreneur',
        name: categoryDisplayNames.entrepreneur,
        description: 'Personal development, leadership skills, and entrepreneurial mindset',
        systemPrompt: 'You are an entrepreneurial development expert specializing in personal growth, leadership development, and entrepreneurial mindset. Help founders develop resilience, decision-making skills, work-life balance, and the mental frameworks needed for startup success.',
        initialMessage: 'Hello! I\'m your Entrepreneurial Development coach. I can help you develop your leadership skills, entrepreneurial mindset, personal resilience, and work-life balance. What aspect of your personal development as an entrepreneur would you like to focus on?',
        color: categoryColors.entrepreneur,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=entrepreneur&backgroundColor=ffffff',
    },
    {
        id: 'team',
        name: categoryDisplayNames.team,
        description: 'Build and manage high-performing teams, culture, and collaboration',
        systemPrompt: 'You are a team building and organizational development expert. Help founders build strong teams, develop company culture, handle hiring challenges, foster collaboration, and become effective leaders.',
        initialMessage: 'Hello! I\'m your Team & Collaboration specialist. I can help you build strong teams, develop company culture, handle hiring challenges, and foster effective collaboration. What team-related challenge are you working on?',
        color: categoryColors.team,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=team&backgroundColor=ffffff',
    },
    {
        id: 'stakeholders',
        name: categoryDisplayNames.stakeholders,
        description: 'Customer development, stakeholder management, and market positioning',
        systemPrompt: 'You are a stakeholder management and customer development expert. Help founders understand their customers, build relationships with stakeholders, develop market positioning strategies, and create sustainable business models.',
        initialMessage: 'Hello! I\'m your Stakeholder Management advisor. I can help you understand your customers, build relationships with stakeholders, develop market positioning, and create sustainable business models. What stakeholder challenge are you facing?',
        color: categoryColors.stakeholders,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stakeholders&backgroundColor=ffffff',
    },
    {
        id: 'product',
        name: categoryDisplayNames.product,
        description: 'Product development, design thinking, and solution optimization',
        systemPrompt: 'You are a product development expert with deep knowledge of user-centered design, agile methodologies, MVP development, product-market fit, and solution optimization. Help founders build better products and find the best solutions.',
        initialMessage: 'Hi there! I\'m your Product Development specialist. I can assist with product design, development methodologies, user experience optimization, MVP strategies, and finding the best solutions. What product challenge are you facing?',
        color: categoryColors.product,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product&backgroundColor=ffffff',
    },
    {
        id: 'sustainability',
        name: categoryDisplayNames.sustainability,
        description: 'Sustainable business practices, social responsibility, and long-term impact',
        systemPrompt: 'You are a sustainability and social responsibility expert. Help founders develop sustainable business practices, understand their social impact, create responsible business models, and build long-term value for all stakeholders.',
        initialMessage: 'Welcome! I\'m your Sustainability & Responsibility advisor. I can help you develop sustainable business practices, understand your social impact, create responsible business models, and build long-term value. What sustainability challenge are you working on?',
        color: categoryColors.sustainability,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sustainability&backgroundColor=ffffff',
    },
    {
        id: 'time-space',
        name: categoryDisplayNames.time_space,
        description: 'Time management, workspace optimization, and productivity systems',
        systemPrompt: 'You are a time management and productivity expert. Help founders optimize their time, create effective workspace environments, develop productivity systems, and balance work with personal life.',
        initialMessage: 'Hello! I\'m your Time & Space optimization specialist. I can help you manage your time effectively, optimize your workspace, develop productivity systems, and create better work-life balance. What time or space challenge are you facing?',
        color: categoryColors.time_space,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=timespace&backgroundColor=ffffff',
    },
];

const agents: Agent[] = [generalCoach, ...specializedAgents];

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
            {/* Agent Selection Header - Fixed at top */}
            <Box
                sx={{
                    p: 2,
                    mb: 2,
                    mt: 2,
                    width: '75%', // 3/4 width
                    maxWidth: '500px',
                    flexShrink: 0, // Prevent shrinking
                }}
            >
                <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                    AI Startup Advisor
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)' }}>
                    Choose an expert to help with your startup challenges
                </Typography>

                {/* Agent Selection Row */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {/* General Coach - Left Side */}
                    <Box sx={{ flex: 1 }}>
                        <Button
                            onClick={() => onAgentChange(generalCoach)}
                            variant={selectedAgent.id === 'general-coach' ? 'contained' : 'outlined'}
                            fullWidth
                            size="small"
                            sx={{
                                backgroundColor: selectedAgent.id === 'general-coach' ? 'white' : 'rgba(255, 255, 255, 0.1)',
                                color: selectedAgent.id === 'general-coach' ? generalCoach.color : 'white',
                                borderColor: 'white',
                                borderWidth: selectedAgent.id === 'general-coach' ? 2 : 1,
                                height: 40, // Match dropdown height
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: selectedAgent.id === 'general-coach' ? 'white' : 'rgba(255, 255, 255, 0.2)',
                                    borderWidth: 2,
                                },
                                '&.MuiButton-contained': {
                                    backgroundColor: 'white',
                                    color: generalCoach.color,
                                },
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                    src={generalCoach.avatarUrl}
                                    sx={{
                                        width: 20,
                                        height: 20,
                                        backgroundColor: 'white',
                                    }}
                                />
                                <Typography variant="body2">
                                    {generalCoach.name}
                                </Typography>
                            </Box>
                        </Button>
                    </Box>

                    {/* Specialized Agents Dropdown - Right Side */}
                    <Box sx={{ flex: 1 }}>
                        <FormControl fullWidth size="small">
                            <Select
                                value={selectedAgent.id === 'general-coach' ? '' : selectedAgent.id}
                                onChange={(e) => {
                                    const agent = agents.find(a => a.id === e.target.value);
                                    if (agent) onAgentChange(agent);
                                }}
                                displayEmpty
                                renderValue={(value) => {
                                    if (!value) {
                                        return (
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                                Select expert...
                                            </Typography>
                                        );
                                    }
                                    const agent = agents.find(a => a.id === value);
                                    if (!agent) return null;

                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar
                                                src={agent.avatarUrl}
                                                sx={{
                                                    width: 20,
                                                    height: 20,
                                                    backgroundColor: 'white',
                                                }}
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {agent.name}
                                            </Typography>
                                        </Box>
                                    );
                                }}
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    height: 40, // Match button height
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                        borderWidth: 2,
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'white',
                                        borderWidth: 2,
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'white',
                                    },
                                }}
                                MenuProps={{
                                    PaperProps: {
                                        sx: {
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(10px)',
                                            '& .MuiMenuItem-root': {
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                },
                                            },
                                        },
                                    },
                                }}
                            >
                                <MenuItem value="" disabled>
                                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                        Select expert...
                                    </Typography>
                                </MenuItem>
                                {specializedAgents.map((agent) => (
                                    <MenuItem key={agent.id} value={agent.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                            <Avatar
                                                src={agent.avatarUrl}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    backgroundColor: 'white',
                                                    border: `2px solid ${agent.color}`,
                                                }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                    {agent.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.6)' }}>
                                                    {agent.description}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </Box>

            {/* Chat Messages Area - Scrollable */}
            <Box sx={{
                flex: 1,
                width: '75%', // 3/4 width
                maxWidth: '500px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0, // Allow flex item to shrink
            }}>
                {/* Messages Area - Only this part scrolls */}
                <Box
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        minHeight: 0, // Allow flex item to shrink
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
                flexShrink: 0, // Prevent shrinking
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