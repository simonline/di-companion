import { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, useTheme, Button, Slide, Paper, IconButton, Tooltip } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { trackEvent } from '../analytics/track';

interface BugReportButtonProps {
    showFloatingButton?: boolean;
}

export function BugReportButton({ showFloatingButton = true }: BugReportButtonProps) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [panelSubmitted, setPanelSubmitted] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        // Add event listener for the custom event from Menu component
        const handleBugReportEvent = () => setOpen(true);
        document.addEventListener('open-bug-report', handleBugReportEvent);

        // Clean up event listener
        return () => {
            document.removeEventListener('open-bug-report', handleBugReportEvent);
        };
    }, []);

    const handleExpand = () => setExpanded(true);
    const handleCollapse = () => {
        setExpanded(false);
        // Reset panel submitted state after panel is closed
        setTimeout(() => setPanelSubmitted(false), 300);
    };

    const handleClose = () => {
        setOpen(false);
        setTimeout(() => setSubmitted(false), 300);
    };

    const handleSubmit = () => {
        // Send bug report to Amplitude
        trackEvent('bug_report_submitted', {
            description,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        });

        setSubmitted(true);
        setTimeout(handleClose, 1500);
    };

    const handlePanelSubmit = () => {
        // Send bug report to Amplitude
        trackEvent('bug_report_submitted', {
            description,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
        });

        // Show success message in panel
        setPanelSubmitted(true);
        setDescription('');

        // Close panel after delay
        setTimeout(handleCollapse, 1500);
    };

    if (!showFloatingButton) return null;

    return (
        <>
            {/* Small indicator that slides out */}
            <div style={{ position: 'fixed', right: 0, bottom: '120px', zIndex: 1000 }}>
                {!expanded ? (
                    <Tooltip title="Report a bug" placement="left">
                        <Paper
                            elevation={3}
                            sx={{
                                backgroundColor: theme.palette.primary.main,
                                color: 'white',
                                borderTopLeftRadius: '4px',
                                borderBottomLeftRadius: '4px',
                                cursor: 'pointer',
                                py: 1.5,
                                px: 0.4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                width: '24px',
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.dark
                                }
                            }}
                            onClick={handleExpand}
                        >
                            <BugReportIcon sx={{ fontSize: '16px' }} />
                            <div
                                style={{
                                    writingMode: 'vertical-rl',
                                    transform: 'rotate(180deg)',
                                    marginTop: '6px',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                }}
                            >
                                BUG
                            </div>
                        </Paper>
                    </Tooltip>
                ) : (
                    <Slide direction="left" in={expanded} mountOnEnter unmountOnExit>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                width: '260px',
                                maxWidth: '90vw',
                                borderTopLeftRadius: '4px',
                                borderBottomLeftRadius: '4px'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <BugReportIcon color="primary" style={{ marginRight: '8px' }} />
                                    <span style={{ fontWeight: 'bold' }}>
                                        {panelSubmitted ? "Thank you!" : "Report a Bug"}
                                    </span>
                                </div>
                                <IconButton size="small" onClick={handleCollapse}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </div>

                            {panelSubmitted ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '16px 0',
                                    color: theme.palette.success.main
                                }}>
                                    <CheckCircleIcon style={{ fontSize: '36px', marginBottom: '8px' }} />
                                    <span>Your bug report has been submitted!</span>
                                </div>
                            ) : (
                                <>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        label="What went wrong?"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            disabled={!description.trim()}
                                            onClick={handlePanelSubmit}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Paper>
                    </Slide>
                )}
            </div>

            {/* Keep the dialog for when it's triggered from elsewhere */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {submitted ? "Thank you for your feedback!" : "Report a Bug"}
                </DialogTitle>
                <DialogContent>
                    {!submitted ? (
                        <TextField
                            autoFocus
                            margin="dense"
                            label="What went wrong?"
                            fullWidth
                            multiline
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            variant="outlined"
                        />
                    ) : (
                        "Your bug report has been submitted."
                    )}
                </DialogContent>
                {!submitted && (
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={!description.trim()}
                        >
                            Submit
                        </Button>
                    </DialogActions>
                )}
            </Dialog>
        </>
    );
} 