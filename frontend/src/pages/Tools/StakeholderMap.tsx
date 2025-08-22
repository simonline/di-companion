import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Paper,
  Grid,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  Download,
  AccountTree,
  Person,
  Business,
  Groups,
  Public,
} from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { categoryColors } from '@/utils/constants';

interface Stakeholder {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'partner' | 'customer';
  influence: 'high' | 'medium' | 'low';
  interest: 'high' | 'medium' | 'low';
  description?: string;
  relationship?: string;
}

const STAKEHOLDER_ICONS = {
  internal: Person,
  external: Public,
  partner: Business,
  customer: Groups,
};

const INFLUENCE_COLORS = {
  high: '#d32f2f',
  medium: '#ff9800',
  low: '#4caf50',
};

const StakeholderMap: React.FC = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Stakeholder>>({
    type: 'internal',
    influence: 'medium',
    interest: 'medium',
  });

  const handleAddStakeholder = () => {
    setFormData({
      type: 'internal',
      influence: 'medium',
      interest: 'medium',
    });
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEditStakeholder = (stakeholder: Stakeholder) => {
    setFormData(stakeholder);
    setEditingId(stakeholder.id);
    setDialogOpen(true);
  };

  const handleSaveStakeholder = () => {
    if (!formData.name) return;

    if (editingId) {
      setStakeholders(prev =>
        prev.map(s =>
          s.id === editingId
            ? { ...s, ...formData, id: editingId }
            : s
        )
      );
    } else {
      const newStakeholder: Stakeholder = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type || 'internal',
        influence: formData.influence || 'medium',
        interest: formData.interest || 'medium',
        description: formData.description,
        relationship: formData.relationship,
      };
      setStakeholders(prev => [...prev, newStakeholder]);
    }

    setDialogOpen(false);
    setFormData({
      type: 'internal',
      influence: 'medium',
      interest: 'medium',
    });
  };

  const handleDeleteStakeholder = (id: string) => {
    setStakeholders(prev => prev.filter(s => s.id !== id));
  };

  const getQuadrant = (influence: string, interest: string) => {
    if (influence === 'high' && interest === 'high') return 'Manage Closely';
    if (influence === 'high' && interest !== 'high') return 'Keep Satisfied';
    if (influence !== 'high' && interest === 'high') return 'Keep Informed';
    return 'Monitor';
  };

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case 'Manage Closely':
        return '#ff6b6b';
      case 'Keep Satisfied':
        return '#4dabf7';
      case 'Keep Informed':
        return '#51cf66';
      case 'Monitor':
        return '#ffd43b';
      default:
        return '#868e96';
    }
  };

  const exportMap = () => {
    const data = JSON.stringify(stakeholders, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stakeholder-map.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header title="Stakeholder Map" />
      <CenteredFlexBox>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            {/* Header */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <AccountTree sx={{ fontSize: 40, color: categoryColors.stakeholders }} />
                      <Box>
                        <Typography variant="h5" fontWeight="600">
                          Stakeholder Mapping
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Identify and analyze your key stakeholders
                        </Typography>
                      </Box>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={exportMap}
                        disabled={stakeholders.length === 0}
                      >
                        Export
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddStakeholder}
                        sx={{ bgcolor: categoryColors.stakeholders }}
                      >
                        Add Stakeholder
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Influence/Interest Matrix */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Influence/Interest Matrix
                  </Typography>
                  <Box sx={{ position: 'relative', height: 400, border: '2px solid', borderColor: 'divider', borderRadius: 1 }}>
                    {/* Quadrant Labels */}
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '50%', p: 2, bgcolor: '#4dabf740' }}>
                      <Typography variant="caption" fontWeight="600">Keep Satisfied</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">High Influence, Low Interest</Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '50%', p: 2, bgcolor: '#ff6b6b40' }}>
                      <Typography variant="caption" fontWeight="600">Manage Closely</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">High Influence, High Interest</Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '50%', height: '50%', p: 2, bgcolor: '#ffd43b40' }}>
                      <Typography variant="caption" fontWeight="600">Monitor</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">Low Influence, Low Interest</Typography>
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: '50%', height: '50%', p: 2, bgcolor: '#51cf6640' }}>
                      <Typography variant="caption" fontWeight="600">Keep Informed</Typography>
                      <Typography variant="caption" display="block" color="text.secondary">Low Influence, High Interest</Typography>
                    </Box>

                    {/* Plot stakeholders */}
                    {stakeholders.map(stakeholder => {
                      const Icon = STAKEHOLDER_ICONS[stakeholder.type];
                      const x = stakeholder.interest === 'high' ? 75 : stakeholder.interest === 'medium' ? 50 : 25;
                      const y = stakeholder.influence === 'high' ? 25 : stakeholder.influence === 'medium' ? 50 : 75;
                      
                      return (
                        <Tooltip key={stakeholder.id} title={stakeholder.name}>
                          <Box
                            sx={{
                              position: 'absolute',
                              left: `${x}%`,
                              top: `${y}%`,
                              transform: 'translate(-50%, -50%)',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleEditStakeholder(stakeholder)}
                          >
                            <Icon sx={{ fontSize: 32, color: categoryColors.stakeholders }} />
                          </Box>
                        </Tooltip>
                      );
                    })}

                    {/* Axis Labels */}
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        bottom: -20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      Interest →
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        position: 'absolute',
                        left: -50,
                        top: '50%',
                        transform: 'rotate(-90deg)',
                      }}
                    >
                      Influence →
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Stakeholder List */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Stakeholder List
                  </Typography>
                  {stakeholders.length === 0 ? (
                    <Alert severity="info">
                      No stakeholders added yet. Click "Add Stakeholder" to begin mapping.
                    </Alert>
                  ) : (
                    <Stack spacing={2} sx={{ maxHeight: 400, overflow: 'auto' }}>
                      {stakeholders.map(stakeholder => {
                        const Icon = STAKEHOLDER_ICONS[stakeholder.type];
                        const quadrant = getQuadrant(stakeholder.influence, stakeholder.interest);
                        
                        return (
                          <Paper key={stakeholder.id} sx={{ p: 2 }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Box display="flex" alignItems="center" gap={2}>
                                <Icon sx={{ color: categoryColors.stakeholders }} />
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="600">
                                    {stakeholder.name}
                                  </Typography>
                                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                    <Chip
                                      label={stakeholder.type}
                                      size="small"
                                      variant="outlined"
                                    />
                                    <Chip
                                      label={quadrant}
                                      size="small"
                                      sx={{
                                        bgcolor: getQuadrantColor(quadrant) + '20',
                                        color: getQuadrantColor(quadrant),
                                        fontWeight: 600,
                                      }}
                                    />
                                  </Stack>
                                  {stakeholder.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      {stakeholder.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Stack direction="row" spacing={1}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditStakeholder(stakeholder)}
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteStakeholder(stakeholder.id)}
                                >
                                  <Delete />
                                </IconButton>
                              </Stack>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </CenteredFlexBox>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Stakeholder' : 'Add Stakeholder'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type || 'internal'}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Stakeholder['type'] })}
              >
                <MenuItem value="internal">Internal</MenuItem>
                <MenuItem value="external">External</MenuItem>
                <MenuItem value="partner">Partner</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Influence</InputLabel>
              <Select
                value={formData.influence || 'medium'}
                label="Influence"
                onChange={(e) => setFormData({ ...formData, influence: e.target.value as Stakeholder['influence'] })}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Interest</InputLabel>
              <Select
                value={formData.interest || 'medium'}
                label="Interest"
                onChange={(e) => setFormData({ ...formData, interest: e.target.value as Stakeholder['interest'] })}
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Relationship"
              fullWidth
              value={formData.relationship || ''}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} startIcon={<Cancel />}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveStakeholder}
            variant="contained"
            startIcon={<Save />}
            disabled={!formData.name}
            sx={{ bgcolor: categoryColors.stakeholders }}
          >
            {editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StakeholderMap;