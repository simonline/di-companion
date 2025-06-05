import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import { trackEvent } from '../analytics/track';

export function BugReportButton() {
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleOpen = () => setOpen(true);
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

    return (
        <>
            <Button
                startIcon={<BugReportIcon />}
                onClick={handleOpen}
                variant="outlined"
                size="small"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
            >
                Report Bug
            </Button>

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