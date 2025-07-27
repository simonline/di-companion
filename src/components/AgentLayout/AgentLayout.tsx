import React, { useState } from 'react';
import { Box } from '@mui/material';
import { ChatInterface } from '../Chat';

interface AgentLayoutProps {
    children: React.ReactNode;
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

// Default agent to start with
const defaultAgent = {
    id: 'business-strategy',
    name: 'Business Strategy',
    description: 'Get guidance on business model, market positioning, and strategic planning',
    systemPrompt: 'You are a business strategy expert specializing in startup development. Help founders with business model validation, market analysis, competitive positioning, and strategic planning. Provide actionable advice and frameworks.',
    initialMessage: 'Hello! I\'m your Business Strategy advisor. I can help you with business model development, market analysis, competitive positioning, and strategic planning. What aspect of your business strategy would you like to discuss today?',
    color: '#0075bc', // stakeholders color
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=business&backgroundColor=ffffff',
};

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
    const [selectedAgent, setSelectedAgent] = useState<Agent>(defaultAgent);

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)', width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
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