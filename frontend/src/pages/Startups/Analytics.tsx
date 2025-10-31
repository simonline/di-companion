import {
    Box,
    Card,
    CardHeader,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    ToggleButtonGroup,
    ToggleButton,
    Chip,
    TableSortLabel,
    CircularProgress,
    LinearProgress,
    Stack,
    Grid,
} from '@mui/material';
import { Info as InfoIcon, CheckCircle as CheckCircleIcon, RadioButtonUnchecked as UncheckedIcon } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Startup, StartupProgress } from '@/types/database';
import { supabaseGetStartups, supabase } from '@/lib/supabase';

type StartupFilter = 'my' | 'all';
type SortField = 'name' | 'progress' | 'members';
type SortOrder = 'asc' | 'desc';

interface StartupAnalytics {
    startup: Startup;
    memberCount: number;
    progressCount: number;
    progressPercentage: number;
}

// Tool names mapping
const TOOL_NAMES: Record<keyof StartupProgress, string> = {
    'startup-profile': 'Startup Profile',
    'startup-team': 'Startup Team',
    'team-values': 'Team Values',
    'team-contract': 'Team Contract',
    'team-assessment': 'Team Assessment',
    'stakeholder-map': 'Stakeholder Map',
    'interviews': 'Interviews',
    'persona': 'Persona',
    'pitch-deck': 'Pitch Deck',
    'financial-plan': 'Financial Plan',
};

export default function AnalyticsView() {
    const { user, profile } = useAuthContext();
    const [startupFilter, setStartupFilter] = useState<StartupFilter>('my');
    const [analytics, setAnalytics] = useState<StartupAnalytics[]>([]);
    const [selectedStartup, setSelectedStartup] = useState<StartupAnalytics | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [loading, setLoading] = useState(false);
    const [coachees, setCoachees] = useState<Startup[]>([]);

    // Fetch coachees when user is available
    useEffect(() => {
        const fetchCoachees = async () => {
            if (user?.id && profile?.is_coach) {
                try {
                    const { data, error } = await supabase
                        .from('startups')
                        .select('*')
                        .eq('coach_id', user.id);

                    if (!error && data) {
                        setCoachees((data || []) as any);
                    }
                } catch (error) {
                    console.error('Error fetching coachees:', error);
                }
            }
        };

        fetchCoachees();
    }, [user?.id, profile?.is_coach]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get all startups based on filter
                let startups: Startup[] = [];
                if (startupFilter === 'my') {
                    startups = coachees || [];
                } else {
                    // Fetch all startups
                    const allStartups = await supabaseGetStartups();
                    startups = allStartups || [];
                }

                // 2. Fetch member count for each startup
                const analyticsPromises = startups.map(async (startup) => {
                    // Count members - fetch actual data to count
                    const { data: members, error } = await supabase
                        .from('startups_users_lnk')
                        .select('user_id')
                        .eq('startup_id', startup.id);

                    if (error) {
                        console.error('Error fetching members for', startup.name, ':', error);
                    }

                    const memberCount = members?.length || 0;

                    // Calculate progress - only count the 10 tool keys
                    const defaultProgress: StartupProgress = {
                        'startup-profile': false,
                        'startup-team': false,
                        'team-values': false,
                        'team-contract': false,
                        'team-assessment': false,
                        'stakeholder-map': false,
                        'interviews': false,
                        'persona': false,
                        'pitch-deck': false,
                        'financial-plan': false,
                    };

                    const progress = startup.progress || defaultProgress;

                    // Only count the specific tool keys
                    const toolKeys: (keyof StartupProgress)[] = [
                        'startup-profile',
                        'startup-team',
                        'team-values',
                        'team-contract',
                        'team-assessment',
                        'stakeholder-map',
                        'interviews',
                        'persona',
                        'pitch-deck',
                        'financial-plan',
                    ];

                    const completedCount = toolKeys.filter(key => progress[key] === true).length;
                    const totalCount = toolKeys.length;
                    const progressPercentage = Math.round((completedCount / totalCount) * 100);

                    return {
                        startup,
                        memberCount,
                        progressCount: completedCount,
                        progressPercentage,
                    };
                });

                const analyticsData = await Promise.all(analyticsPromises);
                setAnalytics(analyticsData);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [coachees, startupFilter]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortedAnalytics = (data: StartupAnalytics[]) => {
        return [...data].sort((a, b) => {
            const multiplier = sortOrder === 'asc' ? 1 : -1;

            if (sortField === 'name') {
                return multiplier * (a.startup.name || '').localeCompare(b.startup.name || '');
            } else if (sortField === 'progress') {
                return multiplier * (a.progressPercentage - b.progressPercentage);
            } else {
                return multiplier * (a.memberCount - b.memberCount);
            }
        });
    };

    const handleStartupFilterChange = (_: React.MouseEvent<HTMLElement>, newFilter: StartupFilter | null) => {
        if (newFilter !== null) {
            setStartupFilter(newFilter);
        }
    };

    const handleViewDetails = (startupAnalytics: StartupAnalytics) => {
        setSelectedStartup(startupAnalytics);
        setIsDialogOpen(true);
    };

    const sortedAnalytics = getSortedAnalytics(analytics);

    return (
        <>
            <Header title="Analytics" />
            <CenteredFlexBox>
                <Card sx={{ width: '100%', mb: 4 }}>
                    <CardHeader
                        title="Startup Analytics"
                        subheader="Track startup progress and team growth"
                    />
                    <CardContent>
                        <Box sx={{
                            mb: 3,
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                        }}>
                            <ToggleButtonGroup
                                value={startupFilter}
                                exclusive
                                onChange={handleStartupFilterChange}
                                aria-label="startup filter"
                                size="small"
                            >
                                <ToggleButton value="my" aria-label="my startups">
                                    Meine Startups
                                </ToggleButton>
                                <ToggleButton value="all" aria-label="all startups">
                                    Alle Startups
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {sortedAnalytics.length} {sortedAnalytics.length === 1 ? 'Startup' : 'Startups'} gefunden
                                    </Typography>
                                </Box>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    <TableSortLabel
                                                        active={sortField === 'name'}
                                                        direction={sortField === 'name' ? sortOrder : 'asc'}
                                                        onClick={() => handleSort('name')}
                                                    >
                                                        Startup
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell>
                                                    <TableSortLabel
                                                        active={sortField === 'members'}
                                                        direction={sortField === 'members' ? sortOrder : 'asc'}
                                                        onClick={() => handleSort('members')}
                                                    >
                                                        Members
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell>
                                                    <TableSortLabel
                                                        active={sortField === 'progress'}
                                                        direction={sortField === 'progress' ? sortOrder : 'asc'}
                                                        onClick={() => handleSort('progress')}
                                                    >
                                                        Progress
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell align="right">Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sortedAnalytics.map((analyticsItem) => (
                                                <TableRow key={analyticsItem.startup.id}>
                                                    <TableCell component="th" scope="row">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor: 'primary.main',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                }}
                                                            >
                                                                {analyticsItem.startup.name?.charAt(0) || '?'}
                                                            </Avatar>
                                                            <Typography>{analyticsItem.startup.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={analyticsItem.memberCount}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 200 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={analyticsItem.progressPercentage}
                                                                sx={{
                                                                    flex: 1,
                                                                    height: 8,
                                                                    borderRadius: 1,
                                                                }}
                                                            />
                                                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60 }}>
                                                                {analyticsItem.progressCount}/10 ({analyticsItem.progressPercentage}%)
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Details anzeigen">
                                                            <IconButton
                                                                onClick={() => handleViewDetails(analyticsItem)}
                                                                size="small"
                                                            >
                                                                <InfoIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {sortedAnalytics.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        <Typography variant="body1" sx={{ py: 2 }}>
                                                            Keine Startups gefunden
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Details Dialog */}
                <Dialog
                    open={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                >
                    {selectedStartup && (
                        <>
                            <DialogTitle>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {selectedStartup.startup.name?.charAt(0) || '?'}
                                    </Avatar>
                                    {selectedStartup.startup.name} - Progress Details
                                </Box>
                            </DialogTitle>
                            <DialogContent>
                                <Box sx={{ mb: 3 }}>
                                    <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Team Members
                                            </Typography>
                                            <Typography variant="h6">
                                                {selectedStartup.memberCount}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Overall Progress
                                            </Typography>
                                            <Typography variant="h6">
                                                {selectedStartup.progressCount}/10 ({selectedStartup.progressPercentage}%)
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={selectedStartup.progressPercentage}
                                        sx={{
                                            height: 10,
                                            borderRadius: 1,
                                        }}
                                    />
                                </Box>

                                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2 }}>
                                    Tool Completion Status
                                </Typography>
                                <Grid container spacing={2}>
                                    {Object.entries(TOOL_NAMES).map(([key, name]) => {
                                        const isCompleted = selectedStartup.startup.progress?.[key as keyof StartupProgress] || false;
                                        return (
                                            <Grid item xs={12} sm={6} key={key}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: isCompleted ? 'success.main' : 'divider',
                                                        bgcolor: isCompleted ? 'success.light' : 'background.paper',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    {isCompleted ? (
                                                        <CheckCircleIcon color="success" />
                                                    ) : (
                                                        <UncheckedIcon color="disabled" />
                                                    )}
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: isCompleted ? 600 : 400,
                                                            color: isCompleted ? 'success.dark' : 'text.secondary',
                                                        }}
                                                    >
                                                        {name}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setIsDialogOpen(false)}>Schließen</Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </CenteredFlexBox>
        </>
    );
} 