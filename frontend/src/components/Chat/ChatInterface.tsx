import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Typography,
    Avatar,
    CircularProgress,
    Button,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import { useChatContext } from './ChatContext';
import { Agent, agents, generalCoach, specializedAgents } from './types';
import { useLocation } from 'react-router-dom';
import MarkdownMessage from './MarkdownMessage';
import { useAuthContext } from '@/hooks/useAuth';
import { useAssessmentExport } from '@/hooks/useAssessmentExport';

interface ChatInterfaceProps {
    selectedAgent: Agent;
    onAgentChange: (agent: Agent) => void;
    isMobile?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedAgent, onAgentChange, isMobile = false }) => {
    const { messages, addMessage, sendProgrammaticMessage, clearMessages, loadConversation, isLoading, setMobileKeyboardVisible } = useChatContext();
    const { startup } = useAuthContext();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [previousAgentId, setPreviousAgentId] = useState<string>(selectedAgent.id);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const assessmentExport = useAssessmentExport();
    const [assessmentContextSent, setAssessmentContextSent] = useState(false);

    // Collect page context
    const getPageContext = () => {
        const context = {
            currentPath: location.pathname,
            pageTitle: document.title,
            // Get visible text content (you can customize this selector)
            pageContent: document.querySelector('main')?.innerText || document.body.innerText,
            // Get meta information
            meta: {
                description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
                keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content'),
            },
            // Get any data attributes from the current page
            pageData: document.querySelector('[data-page-context]')?.getAttribute('data-page-context'),
        };
        return context;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-scroll to bottom when keyboard appears on mobile and notify about keyboard visibility
    useEffect(() => {
        if (isMobile && isInputFocused) {
            setMobileKeyboardVisible(true);
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 300); // Delay to allow keyboard animation
        } else if (isMobile && !isInputFocused) {
            setMobileKeyboardVisible(false);
        }
    }, [isInputFocused, isMobile, setMobileKeyboardVisible]);

    useEffect(() => {
        // Check if agent has changed
        if (previousAgentId !== selectedAgent.id) {
            // Load conversation for this agent from database
            loadConversation(selectedAgent.id).then(() => {
                // If no messages were loaded (new conversation), add initial message
                // Note: We use a setTimeout to ensure messages state is updated
                setTimeout(() => {
                    if (messages.length === 0) {
                        addMessage({
                            id: '1',
                            content: selectedAgent.initialMessage,
                            sender: 'agent',
                            timestamp: new Date(),
                        });
                    }
                }, 100);
            });
            setPreviousAgentId(selectedAgent.id);
            // Reset assessment context flag when agent changes
            setAssessmentContextSent(false);
        } else if (messages.length === 0) {
            // Initialize with agent's initial message if no messages exist (first load)
            addMessage({
                id: '1',
                content: selectedAgent.initialMessage,
                sender: 'agent',
                timestamp: new Date(),
            });
        }
    }, [selectedAgent, previousAgentId, messages.length, addMessage, loadConversation]);

    // Reset assessment context flag when page changes
    useEffect(() => {
        setAssessmentContextSent(false);
    }, [location.pathname]);

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        // Get current page context
        const pageContext = getPageContext();

        // Build enhanced system prompt
        let enhancedSystemPrompt = `${selectedAgent.systemPrompt}

Current Page Context:
- Path: ${pageContext.currentPath}
- Title: ${pageContext.pageTitle}
- Content Preview: ${pageContext.pageContent?.substring(0, 500)}...`;

        // Include assessment export on first message only
        if (assessmentExport && !assessmentContextSent) {
            enhancedSystemPrompt += `

Current Assessment Data:
${assessmentExport}`;
            setAssessmentContextSent(true);
        }

        await sendProgrammaticMessage(inputValue.trim(), enhancedSystemPrompt, selectedAgent.id, startup?.id);
        setInputValue('');
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const handleNewChat = () => {
        clearMessages();
        setAssessmentContextSent(false);
        // Add the initial message from the agent
        addMessage({
            id: Date.now().toString(),
            content: selectedAgent.initialMessage,
            sender: 'agent',
            timestamp: new Date(),
        });
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ color: 'background.default' }}>
                        Your AI Companion
                    </Typography>
                    <IconButton
                        onClick={handleNewChat}
                        size="small"
                        sx={{
                            color: 'background.default',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            },
                        }}
                        title="New Chat"
                    >
                        <AddIcon />
                    </IconButton>
                </Box>
                <Typography variant="body2" sx={{ mb: 2, color: 'background.default' }}>
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
                                backgroundColor: selectedAgent.id === 'general-coach' ? 'background.default' : 'rgba(255, 255, 255, 0.1)',
                                color: selectedAgent.id === 'general-coach' ? generalCoach.color : 'background.default',
                                borderColor: 'background.default',
                                borderWidth: selectedAgent.id === 'general-coach' ? 2 : 1,
                                height: 40, // Match dropdown height
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: selectedAgent.id === 'general-coach' ? 'background.default' : 'rgba(255, 255, 255, 0.2)',
                                    borderWidth: 2,
                                },
                                '&.MuiButton-contained': {
                                    backgroundColor: 'background.default',
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
                                        backgroundColor: 'background.default',
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
                                                    backgroundColor: 'background.default',
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
                                    color: 'background.default',
                                    height: 40, // Match button height
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'background.default',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'background.default',
                                        borderWidth: 2,
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'background.default',
                                        borderWidth: 2,
                                    },
                                    '& .MuiSelect-icon': {
                                        color: 'background.default',
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
                                                    backgroundColor: 'background.default',
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
                                            backgroundColor: 'background.default',
                                            border: '2px solid white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                )}
                                <Box
                                    sx={{
                                        p: 2,
                                        backgroundColor: message.sender === 'user' ? 'background.default' : 'rgba(255, 255, 255, 0.5)', // White with 50% transparency
                                        color: 'text.primary',
                                        borderRadius: 2,
                                        border: message.sender === 'user' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                                    }}
                                >
                                    {message.sender === 'agent' ? (
                                        <MarkdownMessage content={message.content} />
                                    ) : (
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {message.content}
                                        </Typography>
                                    )}
                                </Box>
                                {message.sender === 'user' && (
                                    <Avatar
                                        sx={{
                                            bgcolor: 'background.default',
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
                                        backgroundColor: 'background.default',
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
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        variant="outlined"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'background.paper',
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