import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Button,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
import { ArrowForward, Warning } from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import { categoryDisplayNames, categoryColors, categoryIcons } from '@/utils/constants';
import Header from '@/sections/Header';

interface Pattern {
  id: string;
  title: string;
  category: string;
  description: string;
}

const maturityData: { [key: string]: number } = {
  the_entrepreneur: 0.7,
  team_collaboration: 0.4,
  customers_stakeholders_ecosystem: 0.8,
  the_solution: 0.6,
  sustainability_responsibility: 0.3,
};

const recommendedPattern: Pattern = {
  id: 'p1',
  title: 'Team Alignment Workshop',
  category: 'Team',
  description: 'Conduct a workshop to align team goals and improve collaboration.',
};

const patternsInProgress = 2;

// Components
const MaturityScoreSection: React.FC = () => {
  return (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Maturity Score
        </Typography>
        <Stack spacing={2}>
          {Object.keys(maturityData).map((category) => (
            <Box key={category}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton size="small" sx={{ color: categoryColors[category], mr: 1 }}>
                  {categoryIcons[category]}
                </IconButton>
                <Typography variant="body2">{categoryDisplayNames[category]}</Typography>
                <Typography variant="body2" sx={{ ml: 'auto' }}>
                  {Math.round(maturityData[category] * 100)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={maturityData[category] * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: `${categoryColors[category]}22`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: categoryColors[category],
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

const RecommendationSection: React.FC = () => {
  const theme = useTheme();
  const lowestCategory = Object.entries(maturityData).reduce((acc, [key, value]) => {
    return value < acc[1] ? [key, value] : acc;
  });

  return (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recommendation
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Warning sx={{ color: theme.palette.warning.main, mr: 1 }} />
          <Typography variant="body2">
            Focus on improving: <strong>{categoryDisplayNames[lowestCategory[0]]}</strong>
          </Typography>
        </Box>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              {recommendedPattern.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {recommendedPattern.description}
            </Typography>
            <Button variant="contained" endIcon={<ArrowForward />} size="small" fullWidth>
              Start Pattern
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

const PatternBacklogSection: React.FC = () => {
  return (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Pattern Backlog</Typography>
          <Chip label={`${patternsInProgress} In Progress`} color="primary" size="small" />
        </Box>
        <Button variant="outlined" endIcon={<ArrowForward />} fullWidth sx={{ mt: 2 }}>
          Go to Pattern Backlog
        </Button>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  return (
    <>
      <Header title="Dashboard" />
      <CenteredFlexBox>
        <MaturityScoreSection />
        <RecommendationSection />
        <PatternBacklogSection />
      </CenteredFlexBox>
    </>
  );
};

export default Dashboard;
