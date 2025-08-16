import React, { useState, useEffect } from 'react';
import { Box, Fab, Slide, useMediaQuery, useTheme, Badge, IconButton } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
                        {/* Mobile Chat Header */}
                        <Box sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
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
                                <ArrowBackIcon />
                            </IconButton>
                        </Box>
                        
                        <ChatInterface
                            selectedAgent={selectedAgent}
                            onAgentChange={setSelectedAgent}
                        />
                    </Box>
                </Slide>

                {/* Floating Action Button */}
                {mobileView === 'content' && (
                    <Fab
                        color="primary"
                        onClick={() => {
                            setMobileView('chat');
                            setUnreadMessages(0);
                        }}
                        sx={{
                            position: 'fixed',
                            top: 16,
                            right: 16,
                            backgroundColor: selectedAgent.color,
                            '&:hover': {
                                backgroundColor: selectedAgent.color,
                                filter: 'brightness(0.9)'
                            },
                            boxShadow: theme.shadows[8],
                            transition: 'all 0.3s ease',
                            zIndex: 1200
                        }}
                    >
                        <Badge badgeContent={unreadMessages} color="error">
                            <ChatIcon />
                        </Badge>
                    </Fab>
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

    // Desktop view: Split screen (50/50)
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
            {/* Left side - Original content */}
            <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                backgroundColor: 'background.default',
                transition: 'all 0.3s ease'
            }}>
                {children}
            </Box>

            {/* Right side - Chat interface */}
            <Box sx={{ 
                flex: 1, 
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