import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { ChatInterface, Agent, agents, categoryToAgentMap, generalCoach } from '../Chat';
import { useCurrentPattern } from '@/hooks/useCurrentPattern';

interface AgentLayoutProps {
    children: React.ReactNode;
}

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
    const [selectedAgent, setSelectedAgent] = useState<Agent>(generalCoach);
    const { currentPattern } = useCurrentPattern();

    // Automatically select the matching agent based on pattern category
    useEffect(() => {
        if (currentPattern?.category) {
            const agentId = categoryToAgentMap[currentPattern.category];
            const matchingAgent = agents.find(agent => agent.id === agentId);
            if (matchingAgent) {
                setSelectedAgent(matchingAgent);
            }
        } else {
            setSelectedAgent(generalCoach);
        }
    }, [currentPattern?.category]);

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