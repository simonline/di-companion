import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { ChatInterface } from '../Chat';
import { categoryColors } from '../../utils/constants';
import { useCurrentPattern } from '@/hooks/useCurrentPattern';

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

// General coach as default
const defaultAgent = {
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
        name: 'Entrepreneur',
        description: 'Personal development, leadership skills, and entrepreneurial mindset',
        systemPrompt: 'You are an entrepreneurial development expert specializing in personal growth, leadership development, and entrepreneurial mindset. Help founders develop resilience, decision-making skills, work-life balance, and the mental frameworks needed for startup success.',
        initialMessage: 'Hello! I\'m your Entrepreneurial Development coach. I can help you develop your leadership skills, entrepreneurial mindset, personal resilience, and work-life balance. What aspect of your personal development as an entrepreneur would you like to focus on?',
        color: categoryColors.entrepreneur,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=entrepreneur&backgroundColor=ffffff',
    },
    {
        id: 'team',
        name: 'Team & Collaboration',
        description: 'Build and manage high-performing teams, culture, and collaboration',
        systemPrompt: 'You are a team building and organizational development expert. Help founders build strong teams, develop company culture, handle hiring challenges, foster collaboration, and become effective leaders.',
        initialMessage: 'Hello! I\'m your Team & Collaboration specialist. I can help you build strong teams, develop company culture, handle hiring challenges, and foster effective collaboration. What team-related challenge are you working on?',
        color: categoryColors.team,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=team&backgroundColor=ffffff',
    },
    {
        id: 'stakeholders',
        name: 'Stakeholders',
        description: 'Customer development, stakeholder management, and market positioning',
        systemPrompt: 'You are a stakeholder management and customer development expert. Help founders understand their customers, build relationships with stakeholders, develop market positioning strategies, and create sustainable business models.',
        initialMessage: 'Hello! I\'m your Stakeholder Management advisor. I can help you understand your customers, build relationships with stakeholders, develop market positioning, and create sustainable business models. What stakeholder challenge are you facing?',
        color: categoryColors.stakeholders,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=stakeholders&backgroundColor=ffffff',
    },
    {
        id: 'product',
        name: 'Product Development',
        description: 'Product development, design thinking, and solution optimization',
        systemPrompt: 'You are a product development expert with deep knowledge of user-centered design, agile methodologies, MVP development, product-market fit, and solution optimization. Help founders build better products and find the best solutions.',
        initialMessage: 'Hi there! I\'m your Product Development specialist. I can assist with product design, development methodologies, user experience optimization, MVP strategies, and finding the best solutions. What product challenge are you facing?',
        color: categoryColors.product,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product&backgroundColor=ffffff',
    },
    {
        id: 'sustainability',
        name: 'Sustainability',
        description: 'Sustainable business practices, social responsibility, and long-term impact',
        systemPrompt: 'You are a sustainability and social responsibility expert. Help founders develop sustainable business practices, understand their social impact, create responsible business models, and build long-term value for all stakeholders.',
        initialMessage: 'Welcome! I\'m your Sustainability & Responsibility advisor. I can help you develop sustainable business practices, understand your social impact, create responsible business models, and build long-term value. What sustainability challenge are you working on?',
        color: categoryColors.sustainability,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sustainability&backgroundColor=ffffff',
    },
    {
        id: 'time-space',
        name: 'Time & Space',
        description: 'Time management, workspace optimization, and productivity systems',
        systemPrompt: 'You are a time management and productivity expert. Help founders optimize their time, create effective workspace environments, develop productivity systems, and balance work with personal life.',
        initialMessage: 'Hello! I\'m your Time & Space optimization specialist. I can help you manage your time effectively, optimize your workspace, develop productivity systems, and create better work-life balance. What time or space challenge are you facing?',
        color: categoryColors.time_space,
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=timespace&backgroundColor=ffffff',
    },
];

const agents: Agent[] = [defaultAgent, ...specializedAgents];

// Mapping from pattern category to agent ID
const categoryToAgentMap: Record<string, string> = {
    'entrepreneur': 'entrepreneur',
    'team': 'team',
    'stakeholders': 'stakeholders',
    'product': 'product',
    'sustainability': 'sustainability',
    'time_space': 'time-space',
};

const AgentLayout: React.FC<AgentLayoutProps> = ({ children }) => {
    const [selectedAgent, setSelectedAgent] = useState<Agent>(defaultAgent);
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
            setSelectedAgent(defaultAgent);
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