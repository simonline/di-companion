import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { ChatInterface, Agent, agents, categoryToAgentMap, generalCoach } from '../Chat';
import { useCurrentPattern } from '@/hooks/useCurrentPattern';

interface AgentLayoutProps {
    children: React.ReactNode;
    agent?: string;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children, agent }) => {
    const [selectedAgent, setSelectedAgent] = useState<Agent>(generalCoach);
    const { currentPattern } = useCurrentPattern();

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

    return (
        <Box sx={{
            display: 'flex',
            height: 'calc(100vh - 80px)', // Account for header (80px) only
            width: '100%',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1000
        }}>
            {/* Left side - Original content */}
            <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: 'background.default' }}>
                {children}
            </Box>

            {/* Right side - Chat interface */}
            <Box sx={{ flex: 1, borderLeft: 1, borderColor: 'divider', backgroundColor: 'background.default' }}>
                <ChatInterface
                    selectedAgent={selectedAgent}
                    onAgentChange={setSelectedAgent}
                />
            </Box>
        </Box>
    );
};

export default AgentLayout; 