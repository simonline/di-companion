import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Grid,
    Paper,
    Chip,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Groups, ArrowBack, EmojiEvents } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuth';
import { supabaseCreateStartupMethod, supabaseUpdateStartupMethod } from '@/lib/supabase';
import { StartupMethod } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { CategoryEnum, categoryColors } from '@/utils/constants';

interface FounderValues {
    userId: string;
    userName: string;
    top3Values: string[];
}

interface TeamValuesData {
    founderValues: FounderValues[];
    companyValues: {
        value1: {
            name: string;
            description: string;
        };
        value2: {
            name: string;
            description: string;
        };
        value3: {
            name: string;
            description: string;
        };
    };
    notes: string;
}

const USER_VALUES_METHOD_NAME = 'User Values';
const TEAM_VALUES_METHOD_NAME = 'Team Values';

const TeamValues: React.FC = () => {
    const navigate = useNavigate();
    const { user, startup } = useAuthContext();

    const [teamValuesData, setTeamValuesData] = useState<TeamValuesData>({
        founderValues: [],
        companyValues: {
            value1: { name: '', description: '' },
            value2: { name: '', description: '' },
            value3: { name: '', description: '' },
        },
        notes: '',
    });

    const [startupMethod, setStartupMethod] = useState<StartupMethod | null>(null);
    const [userValuesMethodId, setUserValuesMethodId] = useState<string | null>(null);
    const [teamValuesMethodId, setTeamValuesMethodId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load founder values and existing team values
    useEffect(() => {
        const loadData = async () => {
            if (!startup?.id) return;

            setLoading(true);
            try {
                // Get both method IDs
                const { data: userValuesMethod } = await supabase
                    .from('methods')
                    .select('id')
                    .eq('name', USER_VALUES_METHOD_NAME)
                    .single();

                const { data: teamValuesMethod } = await supabase
                    .from('methods')
                    .select('id')
                    .eq('name', TEAM_VALUES_METHOD_NAME)
                    .single();

                if (!userValuesMethod) {
                    setError('User Values method not found. Please ensure the method exists in the database.');
                    setLoading(false);
                    return;
                }

                if (!teamValuesMethod) {
                    setError('Team Values method not found. Please ensure the method exists in the database.');
                    setLoading(false);
                    return;
                }

                const userMethodId = userValuesMethod.id;
                const teamMethodId = teamValuesMethod.id;
                setUserValuesMethodId(userMethodId);
                setTeamValuesMethodId(teamMethodId);

                // Load founder values from user_methods with user info
                const { data: founderValuesMethods } = await supabase
                    .from('user_methods')
                    .select(`
                        *,
                        users:user_id (
                            id,
                            given_name,
                            family_name
                        )
                    `)
                    .eq('method_id', userMethodId)
                    .eq('startup_id', startup.id);

                if (founderValuesMethods && founderValuesMethods.length > 0) {
                    const founderValuesList: FounderValues[] = founderValuesMethods
                        .filter(method => method.user_id) // Filter out null user_ids
                        .map(method => {
                            const valuesData = JSON.parse(method.result_text || '{}');
                            const valueScores = valuesData.valueScores || [];
                            const top3 = valueScores.slice(0, 3).map((item: any) => item.value);

                            // Get user info
                            const userId = method.user_id as string;
                            const userInfo = method.users as any;
                            const userName = userInfo?.given_name || 'Unknown User';

                            return {
                                userId,
                                userName,
                                top3Values: top3,
                            };
                        });

                    setTeamValuesData(prevData => ({
                        ...prevData,
                        founderValues: founderValuesList,
                    }));
                }

                // Load existing team values from startup_methods
                const { data: existingMethods } = await supabase
                    .from('startup_methods')
                    .select('*')
                    .eq('startup_id', startup.id)
                    .eq('method_id', teamMethodId)
                    .single();

                if (existingMethods) {
                    setStartupMethod(existingMethods);
                    const savedData = JSON.parse(existingMethods.result_text || '{}');
                    setTeamValuesData(prevData => ({
                        ...prevData,
                        companyValues: savedData.companyValues || prevData.companyValues,
                        notes: savedData.notes || '',
                    }));
                }
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [startup?.id]);


    const handleCompanyValueChange = (valueIndex: 1 | 2 | 3, field: 'name' | 'description', value: string) => {
        setTeamValuesData(prevData => ({
            ...prevData,
            companyValues: {
                ...prevData.companyValues,
                [`value${valueIndex}`]: {
                    ...prevData.companyValues[`value${valueIndex}`],
                    [field]: value,
                },
            },
        }));
    };

    const handleNotesChange = (value: string) => {
        setTeamValuesData(prevData => ({
            ...prevData,
            notes: value,
        }));
    };

    const handleSave = async () => {
        if (!startup?.id || !user?.id || !teamValuesMethodId) return;

        setSaving(true);
        setError(null);

        try {
            const dataToSave = {
                companyValues: teamValuesData.companyValues,
                notes: teamValuesData.notes,
                founderValues: teamValuesData.founderValues,
            };

            if (startupMethod) {
                // Update existing
                await supabaseUpdateStartupMethod({
                    id: startupMethod.id,
                    result_text: JSON.stringify(dataToSave),
                    updated_at: new Date().toISOString(),
                }, []);
            } else {
                // Create new
                const newMethod = await supabaseCreateStartupMethod({
                    startup_id: startup.id,
                    method_id: teamValuesMethodId,
                    result_text: JSON.stringify(dataToSave),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }, []);
                setStartupMethod(newMethod);
            }

            // Show success message
            setError(null);
        } catch (err) {
            console.error('Error saving team values:', err);
            setError('Failed to save team values. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const renderFounderValue = (position: number) => {
        const values = teamValuesData.founderValues.map(founder => ({
            userName: founder.userName,
            value: founder.top3Values[position] || 'Not selected',
        }));

        if (values.length === 0) {
            return (
                <Typography variant="body2" color="text.secondary">
                    No founder values available yet. Founders need to complete the User Values exercise first.
                </Typography>
            );
        }

        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {values.map((item, index) => (
                    <Chip
                        key={index}
                        label={`${item.userName}: ${item.value}`}
                        variant="outlined"
                        color="team"
                        size="small"
                    />
                ))}
            </Box>
        );
    };

    if (loading) {
        return (
            <>
                <Header title="Team Values" />
                <CenteredFlexBox>
                    <CircularProgress />
                </CenteredFlexBox>
            </>
        );
    }

    return (
        <>
            <Header title="Team Values" />
            <CenteredFlexBox>
                <Box sx={{ maxWidth: 1200, width: '100%', mt: 4 }}>
                    <Box sx={{ mb: 1 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => navigate('/startup')}
                            sx={{ color: 'text.secondary' }}
                        >
                            Back to Startup
                        </Button>
                    </Box>
                    <Card>
                        <CardContent>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Groups sx={{ fontSize: 64, color: categoryColors[CategoryEnum.team], mb: 2 }} />
                                <Typography variant="h4" gutterBottom fontWeight="bold">
                                    Team Values Workshop
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Define your team&apos;s corporate values based on individual founder values
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}

                            {teamValuesData.founderValues.length === 0 && (
                                <Alert severity="info" sx={{ mb: 3 }}>
                                    <Typography variant="body2">
                                        <strong>Note:</strong> Founders should complete the User Values exercise first to see their individual values here.
                                    </Typography>
                                </Alert>
                            )}

                            <Grid container spacing={3}>
                                {/* Company Value 1 */}
                                <Grid item xs={12}>
                                    <Paper elevation={2} sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                            <EmojiEvents sx={{ color: 'gold', mr: 1 }} />
                                            Company Value #1
                                        </Typography>

                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Founder Values (Position 1):
                                        </Typography>
                                        {renderFounderValue(0)}

                                        <TextField
                                            fullWidth
                                            label="Company Value #1"
                                            value={teamValuesData.companyValues.value1.name}
                                            onChange={(e) => handleCompanyValueChange(1, 'name', e.target.value)}
                                            sx={{ mb: 2 }}
                                            placeholder="Enter your first company value"
                                        />

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="How will customers/employees experience this value?"
                                            value={teamValuesData.companyValues.value1.description}
                                            onChange={(e) => handleCompanyValueChange(1, 'description', e.target.value)}
                                            placeholder="Describe how this value manifests in day-to-day interactions..."
                                        />
                                    </Paper>
                                </Grid>

                                {/* Company Value 2 */}
                                <Grid item xs={12}>
                                    <Paper elevation={2} sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                            <EmojiEvents sx={{ color: 'silver', mr: 1 }} />
                                            Company Value #2
                                        </Typography>

                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Founder Values (Position 2):
                                        </Typography>
                                        {renderFounderValue(1)}

                                        <TextField
                                            fullWidth
                                            label="Company Value #2"
                                            value={teamValuesData.companyValues.value2.name}
                                            onChange={(e) => handleCompanyValueChange(2, 'name', e.target.value)}
                                            sx={{ mb: 2 }}
                                            placeholder="Enter your second company value"
                                        />

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="How will customers/employees experience this value?"
                                            value={teamValuesData.companyValues.value2.description}
                                            onChange={(e) => handleCompanyValueChange(2, 'description', e.target.value)}
                                            placeholder="Describe how this value manifests in day-to-day interactions..."
                                        />
                                    </Paper>
                                </Grid>

                                {/* Company Value 3 */}
                                <Grid item xs={12}>
                                    <Paper elevation={2} sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                            <EmojiEvents sx={{ color: '#cd7f32', mr: 1 }} />
                                            Company Value #3
                                        </Typography>

                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Founder Values (Position 3):
                                        </Typography>
                                        {renderFounderValue(2)}

                                        <TextField
                                            fullWidth
                                            label="Company Value #3"
                                            value={teamValuesData.companyValues.value3.name}
                                            onChange={(e) => handleCompanyValueChange(3, 'name', e.target.value)}
                                            sx={{ mb: 2 }}
                                            placeholder="Enter your third company value"
                                        />

                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={3}
                                            label="How will customers/employees experience this value?"
                                            value={teamValuesData.companyValues.value3.description}
                                            onChange={(e) => handleCompanyValueChange(3, 'description', e.target.value)}
                                            placeholder="Describe how this value manifests in day-to-day interactions..."
                                        />
                                    </Paper>
                                </Grid>

                                {/* Notes Section */}
                                <Grid item xs={12}>
                                    <Paper elevation={2} sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Additional Notes
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={4}
                                            label="Comments and additional notes"
                                            value={teamValuesData.notes}
                                            onChange={(e) => handleNotesChange(e.target.value)}
                                            placeholder="Add any comments, additional values, or notes about your team values..."
                                        />
                                    </Paper>
                                </Grid>

                                {/* Save Button */}
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleSave}
                                            disabled={saving}
                                            size="large"
                                        >
                                            {saving ? 'Saving...' : 'Save Team Values'}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            </CenteredFlexBox>
        </>
    );
};

export default TeamValues;