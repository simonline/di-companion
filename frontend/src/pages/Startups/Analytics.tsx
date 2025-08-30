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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Avatar,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    Chip,
    TableSortLabel,
    CircularProgress,
    Stack,
} from '@mui/material';
import { Info as InfoIcon, Person as PersonIcon, Pattern as PatternIcon } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Startup } from '@/types/supabase';
import { formatDistanceToNow, subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { de } from 'date-fns/locale';
import { supabaseGetStartupPatterns, supabaseGetStartups } from '@/lib/supabase';
import { categoryColors, categoryDisplayNames, phaseNumbers, PhaseEnum, CategoryEnum } from '@/utils/constants';

type TimeFilter = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';
type StartupFilter = 'my' | 'all';
type SortField = 'name' | 'interactions';
type SortOrder = 'asc' | 'desc';

interface DateRange {
    startDate: Date;
    endDate: Date;
}

interface UniqueUser {
    id: string;
    name: string;
}

interface PatternInteraction {
    patternId: string;
    patternName: string;
    lastInteraction: Date;
    category?: CategoryEnum;
    phases?: PhaseEnum[];
    imageUrl?: string;
}

interface StartupAnalytics {
    startup: Startup;
    users: UniqueUser[];
    patternInteractions: PatternInteraction[];
    uniquePatterns: Set<string>;
    interactionCount: number;
    lastActivity: Date;
}

// PatternInteractionListItem component based on PatternListItem from Progress.tsx
interface PatternInteractionListItemProps {
    interaction: PatternInteraction;
}

const PatternInteractionListItem: React.FC<PatternInteractionListItemProps> = ({ interaction }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Use the pattern's category color if available, otherwise use default
    const defaultColor = '#0075bc';
    const categoryColor = interaction.category ? categoryColors[interaction.category] : defaultColor;

    return (
        <Card
            sx={{
                mb: 2,
                width: '100%',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                transform: isHovered ? 'translateY(-4px)' : 'none',
                boxShadow: isHovered ? 8 : 1,
                position: 'relative',
                overflow: 'visible',
                '&:after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    backgroundColor: categoryColor,
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                },
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Stack spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            sx={{
                                width: 48,
                                height: 48,
                                bgcolor: `${categoryColor}22`,
                                color: categoryColor,
                            }}
                        >
                            {interaction.imageUrl ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${interaction.imageUrl}`}
                                    alt={interaction.patternName}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <PatternIcon sx={{ fontSize: 24 }} />
                            )}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h6"
                                component="div"
                                sx={{
                                    fontWeight: 900,
                                    mb: 0.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                }}
                            >
                                {interaction.patternName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Letzte Interaktion: {formatDistanceToNow(interaction.lastInteraction, {
                                    addSuffix: true,
                                    locale: de
                                })}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Add category and phase chips if available */}
                    {(interaction.category || (interaction.phases && interaction.phases.length > 0)) && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {interaction.category && (
                                <Chip
                                    label={categoryDisplayNames[interaction.category]}
                                    size="small"
                                    sx={{
                                        bgcolor: categoryColor,
                                        color: 'white',
                                        fontWeight: 700,
                                        '&:hover': { bgcolor: `${categoryColor}22` },
                                        height: 24,
                                    }}
                                />
                            )}
                            {interaction.phases && interaction.phases.length > 0 && Object.entries(phaseNumbers).map(([phase, number]) => (
                                <Chip
                                    key={number}
                                    label={number}
                                    sx={{
                                        backgroundColor: interaction.phases?.includes(phase as PhaseEnum)
                                            ? '#918d73'
                                            : '#cccdcc',
                                        color: 'white',
                                        fontWeight: '900',
                                        fontSize: '.9em',
                                        borderRadius: '50%',
                                        height: '1.5em',
                                        width: '1.5em',
                                        padding: 0,
                                        span: {
                                            padding: 0,
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default function AnalyticsView() {
    const { user } = useAuthContext();
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('thisMonth');
    const [startupFilter, setStartupFilter] = useState<StartupFilter>('my');
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: startOfMonth(new Date()),
        endDate: new Date(),
    });
    const [analytics, setAnalytics] = useState<StartupAnalytics[]>([]);
    const [selectedStartup, setSelectedStartup] = useState<StartupAnalytics | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Get all startups based on filter
                let startups: Startup[] = [];
                if (startupFilter === 'my') {
                    startups = user?.coachees || [];
                } else {
                    // Fetch all startups, not just available ones
                    const allStartups = await supabaseGetStartups();
                    startups = allStartups || [];
                }

                // 2. Initialize analytics data structure
                const analyticsMap = new Map<string, StartupAnalytics>();

                // 3. Fetch startup patterns for each startup
                for (const startup of startups) {
                    // Initialize entry for this startup
                    analyticsMap.set(startup.documentId, {
                        startup,
                        users: [],
                        patternInteractions: [],
                        uniquePatterns: new Set<string>(),
                        interactionCount: 0,
                        lastActivity: new Date(0)
                    });

                    // Fetch all patterns for this startup with date range filter
                    const startupPatterns = await supabaseGetStartupPatterns(
                        startup.documentId,
                        undefined,
                        dateRange
                    );

                    // Process each pattern (no need to filter here since it's done on the server)
                    for (const pattern of startupPatterns) {
                        const analytics = analyticsMap.get(startup.documentId);
                        if (!analytics) continue;

                        // Add pattern interaction
                        const interactionDate = new Date(pattern.createdAt);
                        analytics.patternInteractions.push({
                            patternId: pattern.pattern?.documentId,
                            patternName: pattern.pattern?.name || 'Unnamed Pattern',
                            lastInteraction: interactionDate,
                            category: pattern.pattern?.category as CategoryEnum,
                            phases: pattern.pattern?.phases as PhaseEnum[],
                            imageUrl: pattern.pattern?.image?.url,
                        });

                        // Add unique pattern
                        analytics.uniquePatterns.add(pattern.pattern?.documentId);

                        // Increment interaction count
                        analytics.interactionCount++;

                        // Update last activity if this is more recent
                        if (interactionDate > analytics.lastActivity) {
                            analytics.lastActivity = interactionDate;
                        }

                        // Get user info from the pattern's user attribute
                        if (pattern.user) {
                            const userId = pattern.user.documentId;
                            const userName = `${pattern.user.givenName || ''} ${pattern.user.familyName || ''}`.trim() || 'Unnamed User';

                            // Check if user already exists in the list
                            if (!analytics.users.some(u => u.id === userId)) {
                                analytics.users.push({ id: userId, name: userName });
                            }
                        }
                    }
                }

                // Convert map to array
                setAnalytics(Array.from(analyticsMap.values()));
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.coachees, dateRange, startupFilter]);

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
            } else {
                return multiplier * (a.interactionCount - b.interactionCount);
            }
        });
    };

    const handleTimeFilterChange = (value: TimeFilter) => {
        setTimeFilter(value);
        const now = new Date();

        switch (value) {
            case 'thisWeek':
                setDateRange({
                    startDate: startOfWeek(now, { locale: de }),
                    endDate: now,
                });
                break;
            case 'lastWeek':
                setDateRange({
                    startDate: startOfWeek(subWeeks(now, 1), { locale: de }),
                    endDate: endOfWeek(subWeeks(now, 1), { locale: de }),
                });
                break;
            case 'thisMonth':
                setDateRange({
                    startDate: startOfMonth(now),
                    endDate: now,
                });
                break;
            case 'lastMonth':
                setDateRange({
                    startDate: startOfMonth(subMonths(now, 1)),
                    endDate: endOfMonth(subMonths(now, 1)),
                });
                break;
            case 'thisYear':
                setDateRange({
                    startDate: startOfYear(now),
                    endDate: now,
                });
                break;
            case 'custom':
                // Keep current date range
                break;
        }
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
                        subheader="Track startup engagement and pattern interactions"
                    />
                    <CardContent>
                        <Box sx={{
                            mb: 3,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
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
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <FormControl sx={{ minWidth: 150 }}>
                                    <InputLabel>Zeitraum</InputLabel>
                                    <Select
                                        value={timeFilter}
                                        label="Zeitraum"
                                        onChange={(e) => handleTimeFilterChange(e.target.value as TimeFilter)}
                                    >
                                        <MenuItem value="thisWeek">Diese Woche</MenuItem>
                                        <MenuItem value="lastWeek">Letzte Woche</MenuItem>
                                        <MenuItem value="thisMonth">Dieser Monat</MenuItem>
                                        <MenuItem value="lastMonth">Letzter Monat</MenuItem>
                                        <MenuItem value="thisYear">Dieses Jahr</MenuItem>
                                        <MenuItem value="custom">Benutzerdefiniert</MenuItem>
                                    </Select>
                                </FormControl>
                                {timeFilter === 'custom' && (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            label="Von"
                                            type="date"
                                            value={dateRange.startDate.toISOString().split('T')[0]}
                                            onChange={(e) => setDateRange(prev => ({
                                                ...prev,
                                                startDate: new Date(e.target.value),
                                            }))}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                        <TextField
                                            label="Bis"
                                            type="date"
                                            value={dateRange.endDate.toISOString().split('T')[0]}
                                            onChange={(e) => setDateRange(prev => ({
                                                ...prev,
                                                endDate: new Date(e.target.value),
                                            }))}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {sortedAnalytics.length} {sortedAnalytics.length === 1 ? 'Startup' : 'Startups'} gefunden
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {sortedAnalytics.reduce((sum, item) => sum + item.interactionCount, 0)} Interaktionen insgesamt
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
                                                <TableCell>Users</TableCell>
                                                <TableCell align="right">
                                                    <TableSortLabel
                                                        active={sortField === 'interactions'}
                                                        direction={sortField === 'interactions' ? sortOrder : 'asc'}
                                                        onClick={() => handleSort('interactions')}
                                                    >
                                                        Interaktionen
                                                    </TableSortLabel>
                                                </TableCell>
                                                <TableCell align="right">Letzte Interaktion</TableCell>
                                                <TableCell align="right">Details</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sortedAnalytics.map((analyticsItem) => (
                                                <TableRow key={analyticsItem.startup.documentId}>
                                                    <TableCell component="th" scope="row">
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Avatar
                                                                sx={{
                                                                    bgcolor: 'background.paper',
                                                                    color: 'text.primary',
                                                                    fontWeight: 'bold',
                                                                    border: '1px solid #e0e0e0',
                                                                }}
                                                            >
                                                                {analyticsItem.startup.name?.charAt(0) || '?'}
                                                            </Avatar>
                                                            <Typography>{analyticsItem.startup.name}</Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: 'fit-content' }}>
                                                            {analyticsItem.users.map((user) => (
                                                                <Chip
                                                                    key={user.id}
                                                                    label={user.name}
                                                                    size="small"
                                                                    icon={<PersonIcon />}
                                                                    variant="outlined"
                                                                    sx={{
                                                                        justifyContent: 'flex-start',
                                                                        '& .MuiChip-label': {
                                                                            flex: 1,
                                                                            textAlign: 'left',
                                                                            whiteSpace: 'nowrap'
                                                                        }
                                                                    }}
                                                                />
                                                            ))}
                                                            {analyticsItem.users.length === 0 && (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Keine Benutzer
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">{analyticsItem.interactionCount}</TableCell>
                                                    <TableCell align="right">
                                                        {analyticsItem.lastActivity.getTime() > 0
                                                            ? formatDistanceToNow(analyticsItem.lastActivity, { addSuffix: true, locale: de })
                                                            : 'Keine'}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Details anzeigen">
                                                            <IconButton
                                                                onClick={() => handleViewDetails(analyticsItem)}
                                                                size="small"
                                                                disabled={analyticsItem.patternInteractions.length === 0}
                                                            >
                                                                <InfoIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {sortedAnalytics.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center">
                                                        <Typography variant="body1" sx={{ py: 2 }}>
                                                            Keine Daten für den ausgewählten Zeitraum verfügbar
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
                    maxWidth="sm"
                    fullWidth
                >
                    {selectedStartup && (
                        <>
                            <DialogTitle>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: 'background.paper',
                                            color: 'text.primary',
                                            fontWeight: 'bold',
                                            border: '1px solid #e0e0e0',
                                        }}
                                    >
                                        {selectedStartup.startup.name?.charAt(0) || '?'}
                                    </Avatar>
                                    {selectedStartup.startup.name} - Muster-Interaktionen
                                </Box>
                            </DialogTitle>
                            <DialogContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    Insgesamt {selectedStartup.interactionCount} Interaktionen mit {selectedStartup.uniquePatterns.size} Mustern
                                </Typography>
                                <List sx={{ p: 0 }}>
                                    {/* Group patterns by pattern ID and show unique patterns */}
                                    {Array.from(new Map(
                                        selectedStartup.patternInteractions.map(interaction =>
                                            [interaction.patternId, interaction]
                                        )
                                    ).values()).map((interaction) => (
                                        <ListItem key={interaction.patternId} sx={{ p: 0, mb: 2 }}>
                                            <PatternInteractionListItem interaction={interaction} />
                                        </ListItem>
                                    ))}
                                    {selectedStartup.patternInteractions.length === 0 && (
                                        <Card sx={{ borderRadius: 2, mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="body1" align="center">
                                                    Keine Muster-Interaktionen in diesem Zeitraum
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" align="center">
                                                    Probieren Sie einen anderen Zeitraum
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    )}
                                </List>
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