import React, { useState, useEffect, useRef } from 'react';
import { Box, Fab, Slide, useMediaQuery, useTheme, Badge, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ChatIcon from '@mui/icons-material/Chat';
import { ChatInterface, Agent, agents, categoryToAgentMap, generalCoach } from '../Chat';
import { useCurrentPattern } from '@/hooks/useCurrentPattern';

interface AgentLayoutProps {
    children: React.ReactNode;
    agent?: string;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children, agent }) => {
    const [selectedAgent, setSelectedAgent] = useState<Agent>(generalCoach);
    const { currentPattern } = useCurrentPattern();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const [mobileView, setMobileView] = useState<'content' | 'chat'>('content');
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [tabletChatOpen, setTabletChatOpen] = useState(true);
    const [showAgentLabel, setShowAgentLabel] = useState(false);
    const labelTimeoutRef = useRef<NodeJS.Timeout>();

    // Automatically select the matching agent based on prop or pattern category
    useEffect(() => {
        // Priority 1: Explicit agent prop from route
        if (agent) {
            const routeAgent = agents.find(a => a.id === agent);
            if (routeAgent) {
                setSelectedAgent(routeAgent);
                return;
            }
        }

        // Priority 2: Pattern category
        if (currentPattern?.category) {
            const agentId = categoryToAgentMap[currentPattern.category];
            const matchingAgent = agents.find(a => a.id === agentId);
            if (matchingAgent) {
                setSelectedAgent(matchingAgent);
                return;
            }
        }

        // Default: General coach
        setSelectedAgent(generalCoach);
    }, [agent, currentPattern?.category]);

    // Show agent label animation on agent change (mobile only)
    useEffect(() => {
        if (isMobile && mobileView === 'content') {
            // Clear any existing timeout
            if (labelTimeoutRef.current) {
                clearTimeout(labelTimeoutRef.current);
            }

            // Show label
            setShowAgentLabel(true);

            // Hide label after 3 seconds
            labelTimeoutRef.current = setTimeout(() => {
                setShowAgentLabel(false);
            }, 3000);
        }

        return () => {
            if (labelTimeoutRef.current) {
                clearTimeout(labelTimeoutRef.current);
            }
        };
    }, [selectedAgent, isMobile, mobileView]);

    // Mobile view: Toggle between content and chat
    if (isMobile) {
        return (
            <Box sx={{
                height: 'calc(100vh - 80px)',
                width: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1000,
                overflow: 'hidden'
            }}>
                {/* Content View */}
                <Slide direction="right" in={mobileView === 'content'} mountOnEnter unmountOnExit>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        overflow: 'auto',
                        backgroundColor: 'background.default'
                    }}>
                        {children}
                    </Box>
                </Slide>

                {/* Chat View */}
                <Slide direction="left" in={mobileView === 'chat'} mountOnEnter unmountOnExit>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Mobile Chat Header - Right aligned like agent button */}
                        <Box sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            zIndex: 1100
                        }}>
                            <IconButton
                                onClick={() => setMobileView('content')}
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                    }
                                }}
                            >
                                <ArrowBack />
                            </IconButton>
                        </Box>

                        <ChatInterface
                            selectedAgent={selectedAgent}
                            onAgentChange={setSelectedAgent}
                            isMobile={true}
                        />
                    </Box>
                </Slide>

                {/* Floating Action Button with animated label */}
                {mobileView === 'content' && (
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 16,
                            right: 16,
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 1200
                        }}
                    >
                        {/* Animated Agent Label */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                marginRight: 2,
                                transform: showAgentLabel ? 'translateX(0)' : 'translateX(calc(100% + 64px))',
                                opacity: showAgentLabel ? 1 : 0,
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                pointerEvents: showAgentLabel ? 'auto' : 'none'
                            }}
                        >
                            <Box
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1,
                                    boxShadow: theme.shadows[4],
                                    border: `2px solid ${selectedAgent.color}`,
                                    position: 'relative',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        right: -8,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 0,
                                        height: 0,
                                        borderLeft: '8px solid',
                                        borderLeftColor: selectedAgent.color,
                                        borderTop: '6px solid transparent',
                                        borderBottom: '6px solid transparent'
                                    }
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 600,
                                        color: selectedAgent.color,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {selectedAgent.name} is here to help!
                                </Typography>
                            </Box>
                        </Box>

                        {/* Agent FAB Button */}
                        <Fab
                            color="primary"
                            onClick={() => {
                                // Clear any existing timeout when clicked
                                if (labelTimeoutRef.current) {
                                    clearTimeout(labelTimeoutRef.current);
                                }
                                setShowAgentLabel(false);
                                setMobileView('chat');
                                setUnreadMessages(0);
                            }}
                            onMouseEnter={() => {
                                if (labelTimeoutRef.current) {
                                    clearTimeout(labelTimeoutRef.current);
                                }
                                setShowAgentLabel(true);
                            }}
                            onMouseLeave={() => {
                                labelTimeoutRef.current = setTimeout(() => {
                                    setShowAgentLabel(false);
                                }, 2000);
                            }}
                            sx={{
                                backgroundColor: 'white',
                                border: `2px solid ${selectedAgent.color}`,
                                '&:hover': {
                                    backgroundColor: 'white',
                                    filter: 'brightness(0.95)',
                                    transform: 'scale(1.05)'
                                },
                                boxShadow: theme.shadows[8],
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                animation: unreadMessages > 0 ? 'pulse 2s infinite' : 'none',
                                '@keyframes pulse': {
                                    '0%': {
                                        boxShadow: `0 0 0 0 ${selectedAgent.color}40`
                                    },
                                    '70%': {
                                        boxShadow: `0 0 0 10px ${selectedAgent.color}00`
                                    },
                                    '100%': {
                                        boxShadow: `0 0 0 0 ${selectedAgent.color}00`
                                    }
                                }
                            }}
                        >
                            <Badge badgeContent={unreadMessages} color="error">
                                <Box
                                    component="img"
                                    src={selectedAgent.avatarUrl}
                                    alt={selectedAgent.name}
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%'
                                    }}
                                />
                            </Badge>
                        </Fab>
                    </Box>
                )}
            </Box>
        );
    }

    // Tablet view: Collapsible chat panel
    if (isTablet) {
        return (
            <Box sx={{
                display: 'flex',
                height: 'calc(100vh - 80px)',
                width: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1000
            }}>
                {/* Main content - takes full width when chat is closed */}
                <Box sx={{
                    flex: tabletChatOpen ? '0 0 40%' : 1,
                    overflow: 'auto',
                    backgroundColor: 'background.default',
                    transition: 'flex 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {children}
                </Box>

                {/* Chat interface - 60% width when open */}
                <Box sx={{
                    flex: tabletChatOpen ? '0 0 60%' : '0 0 0px',
                    borderLeft: tabletChatOpen ? 1 : 0,
                    borderColor: 'divider',
                    backgroundColor: 'background.default',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {tabletChatOpen && (
                        <ChatInterface
                            selectedAgent={selectedAgent}
                            onAgentChange={setSelectedAgent}
                        />
                    )}
                </Box>

                {/* Toggle button for tablet */}
                <Fab
                    size="small"
                    onClick={() => setTabletChatOpen(!tabletChatOpen)}
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: tabletChatOpen ? 'calc(60% + 12px)' : 24,
                        backgroundColor: selectedAgent.color,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            backgroundColor: selectedAgent.color,
                            filter: 'brightness(0.9)'
                        },
                        boxShadow: theme.shadows[6],
                        zIndex: 1200
                    }}
                >
                    {tabletChatOpen ? <CloseIcon /> : <ChatIcon />}
                </Fab>
            </Box>
        );
    }

    // Desktop view: Split screen (60/40)
    return (
        <Box sx={{
            display: 'flex',
            height: 'calc(100vh - 80px)',
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1000
        }}>
            {/* Left side - Original content (60%) */}
            <Box sx={{
                flex: '0 0 60%',
                overflow: 'auto',
                backgroundColor: 'background.default',
                transition: 'all 0.3s ease'
            }}>
                {children}
            </Box>

            {/* Right side - Chat interface (40%) */}
            <Box sx={{
                flex: '0 0 40%',
                borderLeft: 1,
                borderColor: 'divider',
                backgroundColor: 'background.default',
                transition: 'all 0.3s ease'
            }}>
                <ChatInterface
                    selectedAgent={selectedAgent}
                    onAgentChange={setSelectedAgent}
                />
            </Box>
        </Box>
    );
};

export default AgentLayout; 