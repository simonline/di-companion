
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography, Link, Box } from '@mui/material';
import { Components } from 'react-markdown';

interface MarkdownMessageProps {
    content: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
    const components: Components = {
        p: ({ children }) => (
            <Typography variant="body2" component="p" sx={{ mb: 1.5 }}>
                {children}
            </Typography>
        ),
        strong: ({ children }) => (
            <Typography component="span" sx={{ fontWeight: 'bold' }}>
                {children}
            </Typography>
        ),
        em: ({ children }) => (
            <Typography component="span" sx={{ fontStyle: 'italic' }}>
                {children}
            </Typography>
        ),
        h1: ({ children }) => (
            <Typography variant="h5" component="h1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                {children}
            </Typography>
        ),
        h2: ({ children }) => (
            <Typography variant="h6" component="h2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                {children}
            </Typography>
        ),
        h3: ({ children }) => (
            <Typography variant="subtitle1" component="h3" sx={{ mt: 1.5, mb: 0.5, fontWeight: 'bold' }}>
                {children}
            </Typography>
        ),
        ul: ({ children }) => (
            <Box component="ul" sx={{ pl: 3, my: 1 }}>
                {children}
            </Box>
        ),
        ol: ({ children }) => (
            <Box component="ol" sx={{ pl: 3, my: 1 }}>
                {children}
            </Box>
        ),
        li: ({ children }) => (
            <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                {children}
            </Typography>
        ),
        a: ({ href, children }) => (
            <Link href={href} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main' }}>
                {children}
            </Link>
        ),
        code: ({ children }) => (
            <Typography
                component="code"
                sx={{
                    fontFamily: 'monospace',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontSize: '0.9em',
                }}
            >
                {children}
            </Typography>
        ),
        pre: ({ children }) => (
            <Box
                component="pre"
                sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    padding: 2,
                    borderRadius: 1,
                    overflowX: 'auto',
                    my: 1.5,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                }}
            >
                {children}
            </Box>
        ),
        blockquote: ({ children }) => (
            <Box
                component="blockquote"
                sx={{
                    borderLeft: '4px solid',
                    borderColor: 'primary.main',
                    pl: 2,
                    ml: 0,
                    my: 1.5,
                    color: 'text.secondary',
                }}
            >
                {children}
            </Box>
        ),
        hr: () => (
            <Box component="hr" sx={{ my: 2, border: 'none', borderTop: '1px solid', borderColor: 'divider' }} />
        ),
    };

    return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownMessage;