import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  Avatar,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  Download,
  Person,
  Psychology,
  Favorite,
  Warning,
  TrendingUp,
  LocationOn,
  Work,
  School,
  AttachMoney,
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { categoryColors } from '@/utils/constants';

interface PersonaData {
  id: string;
  name: string;
  age: number;
  occupation: string;
  location: string;
  income: string;
  education: string;
  bio: string;
  avatar?: string;
  goals: string[];
  frustrations: string[];
  motivations: string[];
  personality: {
    introvert: number;
    analytical: number;
    creative: number;
    organized: number;
  };
  quote?: string;
  brands?: string[];
  channels?: string[];
}

const Persona: React.FC = () => {
  const [personas, setPersonas] = useState<PersonaData[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<PersonaData | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<PersonaData>>({
    personality: {
      introvert: 50,
      analytical: 50,
      creative: 50,
      organized: 50,
    },
    goals: [],
    frustrations: [],
    motivations: [],
  });
  const [tempInput, setTempInput] = useState({
    goal: '',
    frustration: '',
    motivation: '',
    brand: '',
    channel: '',
  });

  const handleAddPersona = () => {
    setFormData({
      personality: {
        introvert: 50,
        analytical: 50,
        creative: 50,
        organized: 50,
      },
      goals: [],
      frustrations: [],
      motivations: [],
      brands: [],
      channels: [],
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEditPersona = (persona: PersonaData) => {
    setFormData(persona);
    setEditingId(persona.id);
    setDialogOpen(true);
  };

  const handleSavePersona = () => {
    if (!formData.name) return;

    if (editingId) {
      setPersonas(prev =>
        prev.map(p =>
          p.id === editingId
            ? { ...p, ...formData, id: editingId } as PersonaData
            : p
        )
      );
    } else {
      const newPersona: PersonaData = {
        id: Date.now().toString(),
        name: formData.name,
        age: formData.age || 30,
        occupation: formData.occupation || '',
        location: formData.location || '',
        income: formData.income || '',
        education: formData.education || '',
        bio: formData.bio || '',
        avatar: formData.avatar,
        goals: formData.goals || [],
        frustrations: formData.frustrations || [],
        motivations: formData.motivations || [],
        personality: formData.personality || {
          introvert: 50,
          analytical: 50,
          creative: 50,
          organized: 50,
        },
        quote: formData.quote,
        brands: formData.brands || [],
        channels: formData.channels || [],
      };
      setPersonas(prev => [...prev, newPersona]);
    }

    setDialogOpen(false);
    setFormData({
      personality: {
        introvert: 50,
        analytical: 50,
        creative: 50,
        organized: 50,
      },
      goals: [],
      frustrations: [],
      motivations: [],
    });
  };

  const handleDeletePersona = (id: string) => {
    setPersonas(prev => prev.filter(p => p.id !== id));
    if (selectedPersona?.id === id) {
      setSelectedPersona(null);
    }
  };

  const handleAddItem = (field: 'goals' | 'frustrations' | 'motivations' | 'brands' | 'channels', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
    setTempInput(prev => ({
      ...prev,
      [field === 'goals' ? 'goal' : field === 'frustrations' ? 'frustration' : field === 'motivations' ? 'motivation' : field === 'brands' ? 'brand' : 'channel']: ''
    }));
  };

  const handleRemoveItem = (field: 'goals' | 'frustrations' | 'motivations' | 'brands' | 'channels', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const exportPersonas = () => {
    const data = JSON.stringify(personas, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'personas.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPersonalityLabel = (value: number, trait: string) => {
    const labels: { [key: string]: [string, string] } = {
      introvert: ['Introvert', 'Extrovert'],
      analytical: ['Intuitive', 'Analytical'],
      creative: ['Practical', 'Creative'],
      organized: ['Flexible', 'Organized'],
    };
    return value < 50 ? labels[trait][0] : labels[trait][1];
  };

  return (
    <>
      <Header title="User Personas" />
      <CenteredFlexBox>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Header */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Person sx={{ fontSize: 40, color: categoryColors.stakeholders }} />
                      <Box>
                        <Typography variant="h5" fontWeight="600">
                          User Personas
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Create detailed personas based on your interviews
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={exportPersonas}
                        disabled={personas.length === 0}
                      >
                        Export
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddPersona}
                        sx={{ bgcolor: categoryColors.stakeholders }}
                      >
                        Add Persona
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Persona List */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Personas
                  </Typography>
                  {personas.length === 0 ? (
                    <Alert severity="info">
                      No personas created yet. Click "Add Persona" to create your first user persona.
                    </Alert>
                  ) : (
                    <Stack spacing={2}>
                      {personas.map(persona => (
                        <Paper
                          key={persona.id}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            bgcolor: selectedPersona?.id === persona.id ? 'action.selected' : 'background.paper',
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                          onClick={() => setSelectedPersona(persona)}
                        >
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar sx={{ bgcolor: categoryColors.stakeholders }}>
                                {persona.name[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="600">
                                  {persona.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {persona.age} • {persona.occupation}
                                </Typography>
                              </Box>
                            </Box>
                            <Stack direction="row">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPersona(persona);
                                }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeletePersona(persona.id);
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Stack>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Persona Details */}
            <Grid item xs={12} md={8}>
              {selectedPersona ? (
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={3} mb={3}>
                      <Avatar sx={{ width: 80, height: 80, bgcolor: categoryColors.stakeholders }}>
                        <Typography variant="h4">{selectedPersona.name[0]}</Typography>
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="h5" fontWeight="600">
                          {selectedPersona.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          {selectedPersona.bio}
                        </Typography>
                        {selectedPersona.quote && (
                          <Typography variant="body2" fontStyle="italic" color="text.secondary">
                            "{selectedPersona.quote}"
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={6} sm={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Work fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Occupation
                            </Typography>
                            <Typography variant="body2">{selectedPersona.occupation}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Location
                            </Typography>
                            <Typography variant="body2">{selectedPersona.location}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <School fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Education
                            </Typography>
                            <Typography variant="body2">{selectedPersona.education}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <AttachMoney fontSize="small" color="action" />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Income
                            </Typography>
                            <Typography variant="body2">{selectedPersona.income}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <TrendingUp color="success" />
                          <Typography variant="subtitle1" fontWeight="600">
                            Goals
                          </Typography>
                        </Box>
                        <List dense>
                          {selectedPersona.goals.map((goal, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={`• ${goal}`} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Warning color="error" />
                          <Typography variant="subtitle1" fontWeight="600">
                            Frustrations
                          </Typography>
                        </Box>
                        <List dense>
                          {selectedPersona.frustrations.map((frustration, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={`• ${frustration}`} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <Favorite color="primary" />
                          <Typography variant="subtitle1" fontWeight="600">
                            Motivations
                          </Typography>
                        </Box>
                        <List dense>
                          {selectedPersona.motivations.map((motivation, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={`• ${motivation}`} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Psychology color="action" />
                        <Typography variant="subtitle1" fontWeight="600">
                          Personality Traits
                        </Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {Object.entries(selectedPersona.personality).map(([trait, value]) => (
                          <Grid item xs={12} sm={6} key={trait}>
                            <Box>
                              <Typography variant="body2" gutterBottom>
                                {getPersonalityLabel(value, trait)}
                              </Typography>
                              <Slider
                                value={value}
                                disabled
                                sx={{
                                  '& .MuiSlider-thumb': {
                                    bgcolor: categoryColors.stakeholders,
                                  },
                                  '& .MuiSlider-track': {
                                    bgcolor: categoryColors.stakeholders,
                                  },
                                }}
                              />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {((selectedPersona.brands?.length ?? 0) > 0 || (selectedPersona.channels?.length ?? 0) > 0) && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Grid container spacing={2}>
                          {(selectedPersona.brands?.length ?? 0) > 0 && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" gutterBottom>
                                Preferred Brands
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {selectedPersona.brands?.map((brand, index) => (
                                  <Chip key={index} label={brand} size="small" />
                                ))}
                              </Stack>
                            </Grid>
                          )}
                          {(selectedPersona.channels?.length ?? 0) > 0 && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" gutterBottom>
                                Communication Channels
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {selectedPersona.channels?.map((channel, index) => (
                                  <Chip key={index} label={channel} size="small" variant="outlined" />
                                ))}
                              </Stack>
                            </Grid>
                          )}
                        </Grid>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent>
                    <CenteredFlexBox sx={{ minHeight: 400 }}>
                      <Box textAlign="center">
                        <Person sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          Select a persona to view details
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Create personas from your user interviews to better understand your target audience
                        </Typography>
                      </Box>
                    </CenteredFlexBox>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Container>
      </CenteredFlexBox>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Persona' : 'Create Persona'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Name"
                fullWidth
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Age"
                type="number"
                fullWidth
                value={formData.age || ''}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Occupation"
                fullWidth
                value={formData.occupation || ''}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                fullWidth
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Education"
                fullWidth
                value={formData.education || ''}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Income Range"
                fullWidth
                value={formData.income || ''}
                onChange={(e) => setFormData({ ...formData, income: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Bio"
                fullWidth
                multiline
                rows={2}
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Quote (Optional)"
                fullWidth
                value={formData.quote || ''}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Goals
              </Typography>
              <Stack spacing={1}>
                {formData.goals?.map((goal, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1}>
                    <Chip label={goal} onDelete={() => handleRemoveItem('goals', index)} />
                  </Box>
                ))}
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    placeholder="Add a goal"
                    value={tempInput.goal}
                    onChange={(e) => setTempInput({ ...tempInput, goal: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddItem('goals', tempInput.goal);
                      }
                    }}
                  />
                  <Button
                    size="small"
                    onClick={() => handleAddItem('goals', tempInput.goal)}
                  >
                    Add
                  </Button>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Frustrations
              </Typography>
              <Stack spacing={1}>
                {formData.frustrations?.map((frustration, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1}>
                    <Chip label={frustration} onDelete={() => handleRemoveItem('frustrations', index)} />
                  </Box>
                ))}
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    placeholder="Add a frustration"
                    value={tempInput.frustration}
                    onChange={(e) => setTempInput({ ...tempInput, frustration: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddItem('frustrations', tempInput.frustration);
                      }
                    }}
                  />
                  <Button
                    size="small"
                    onClick={() => handleAddItem('frustrations', tempInput.frustration)}
                  >
                    Add
                  </Button>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Motivations
              </Typography>
              <Stack spacing={1}>
                {formData.motivations?.map((motivation, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1}>
                    <Chip label={motivation} onDelete={() => handleRemoveItem('motivations', index)} />
                  </Box>
                ))}
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    placeholder="Add a motivation"
                    value={tempInput.motivation}
                    onChange={(e) => setTempInput({ ...tempInput, motivation: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddItem('motivations', tempInput.motivation);
                      }
                    }}
                  />
                  <Button
                    size="small"
                    onClick={() => handleAddItem('motivations', tempInput.motivation)}
                  >
                    Add
                  </Button>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Personality Traits
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Introvert vs Extrovert
                  </Typography>
                  <Slider
                    value={formData.personality?.introvert || 50}
                    onChange={(e, value) => setFormData({
                      ...formData,
                      personality: {
                        ...formData.personality!,
                        introvert: value as number
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Intuitive vs Analytical
                  </Typography>
                  <Slider
                    value={formData.personality?.analytical || 50}
                    onChange={(e, value) => setFormData({
                      ...formData,
                      personality: {
                        ...formData.personality!,
                        analytical: value as number
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Practical vs Creative
                  </Typography>
                  <Slider
                    value={formData.personality?.creative || 50}
                    onChange={(e, value) => setFormData({
                      ...formData,
                      personality: {
                        ...formData.personality!,
                        creative: value as number
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    Flexible vs Organized
                  </Typography>
                  <Slider
                    value={formData.personality?.organized || 50}
                    onChange={(e, value) => setFormData({
                      ...formData,
                      personality: {
                        ...formData.personality!,
                        organized: value as number
                      }
                    })}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={handleSavePersona}
            variant="contained"
            startIcon={<Save />}
            disabled={!formData.name}
            sx={{ bgcolor: categoryColors.stakeholders }}
          >
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Persona;