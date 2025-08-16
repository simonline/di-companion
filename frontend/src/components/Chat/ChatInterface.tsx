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
import { useChatContext } from './ChatContext';
import { Agent, agents, generalCoach, specializedAgents } from './types';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'agent';
    timestamp: Date;
}

interface ChatInterfaceProps {
    selectedAgent: Agent;
    onAgentChange: (agent: Agent) => void;
    isMobile?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedAgent, onAgentChange, isMobile = false }) => {
    const { messages, addMessage, sendProgrammaticMessage, clearMessages, isLoading } = useChatContext();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [previousAgentId, setPreviousAgentId] = useState<string>(selectedAgent.id);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-scroll to bottom when keyboard appears on mobile
    useEffect(() => {
        if (isMobile && isInputFocused) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 300); // Delay to allow keyboard animation
        }
    }, [isInputFocused, isMobile]);

    useEffect(() => {
        // Check if agent has changed
        if (previousAgentId !== selectedAgent.id) {
            // Clear existing messages and add new agent's initial message
            clearMessages();
            addMessage({
                id: '1',
                content: selectedAgent.initialMessage,
                sender: 'agent',
                timestamp: new Date(),
            });
            setPreviousAgentId(selectedAgent.id);
        } else if (messages.length === 0) {
            // Initialize with agent's initial message if no messages exist (first load)
            addMessage({
                id: '1',
                content: selectedAgent.initialMessage,
                sender: 'agent',
                timestamp: new Date(),
            });
        }
    }, [selectedAgent, previousAgentId, messages.length, addMessage, clearMessages]);

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        await sendProgrammaticMessage(inputValue.trim(), selectedAgent.systemPrompt);
        setInputValue('');
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
                    width: isMobile ? '100%' : '75%', // Full width on mobile
                    maxWidth: isMobile ? '100%' : '500px',
                    flexShrink: 0, // Prevent shrinking
                    display: isMobile && isInputFocused ? 'none' : 'block', // Hide when keyboard is shown
                    px: 3,
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
                width: isMobile ? '100%' : '75%', // Full width on mobile
                maxWidth: isMobile ? '100%' : '500px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0, // Allow flex item to shrink
                px: isMobile ? 1 : 0, // Minimal padding on mobile
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
                                        backgroundColor: message.sender === 'user' ? 'white' : 'rgba(255, 255, 255, 0.5)', // White with 50% transparency
                                        color: message.sender === 'user' ? 'text.primary' : 'text.primary',
                                        borderRadius: 2,
                                        border: message.sender === 'user' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                                    }}
                                >
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {message.content}
                                    </Typography>
                                </Box>
                                {message.sender === 'user' && (
                                    <Avatar
                                        sx={{
                                            bgcolor: 'white',
                                            color: 'text.primary',
                                            width: 48,
                                            height: 48,
                                            border: '1px solid rgba(0, 0, 0, 0.1)',
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
                p: isMobile ? 1 : 2, // Minimal padding on mobile
                width: isMobile ? '100%' : '75%', // Full width on mobile
                maxWidth: isMobile ? '100%' : '500px',
                flexShrink: 0, // Prevent shrinking
            }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        ref={inputRef}
                        fullWidth
                        multiline
                        maxRows={4}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
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