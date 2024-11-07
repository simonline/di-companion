import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  LinearProgress,
  Stack,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import {
  categoryDisplayNames,
  categoryColors,
  categoryIcons,
  CategoryEnum,
} from '@/utils/constants';
import Header from '@/sections/Header';

const maturityData: Record<CategoryEnum, number> = {
  entrepreneur: 0.7,
  team: 0.4,
  stakeholders: 0.8,
  product: 0.6,
  sustainability: 0.3,
};

const patternsInProgress = 2;

// Components
const MaturityScoreSection: React.FC = () => {
  const lowestCategory = Object.entries(maturityData).reduce((acc, [key, value]) =>
    value < acc[1] ? [key, value] : acc,
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Maturity Score
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            {/* Progress Bars */}
            <Stack spacing={1}>
              {Object.entries(maturityData).map(([category, score]) => (
                <Box key={category} sx={{ position: 'relative', height: 60 }}>
                  {/* Progress Bar */}
                  <LinearProgress
                    variant="determinate"
                    value={score * 100}
                    sx={{
                      height: 40,
                      borderRadius: 8,
                      bgcolor: `${categoryColors[category as CategoryEnum]}66`,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: categoryColors[category as CategoryEnum],
                        borderRadius: 8,
                      },
                    }}
                  />
                  {/* Ticks */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '40px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    {[0, 20, 40, 60, 80, 100].map((tick) => (
                      <Box
                        key={tick}
                        sx={{
                          width: '1px',
                          height: '40px',
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          visibility: [0, 100].includes(tick) ? 'hidden' : 'visible',
                        }}
                      />
                    ))}
                  </Box>
                  {/* Category Info within the Progress Bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      height: '40px',
                      padding: '0 16px',
                    }}
                  >
                    {/* Icon */}
                    <IconButton
                      size="small"
                      sx={{ color: categoryColors[category as CategoryEnum], mr: 1 }}
                    >
                      {categoryIcons[category as CategoryEnum]}
                    </IconButton>
                    {/* Category Name */}
                    <Typography variant="body1" sx={{ color: 'white', flexGrow: 1 }}>
                      {categoryDisplayNames[category as CategoryEnum]}
                    </Typography>
                    {/* Percentage */}
                    <Typography variant="body1" sx={{ color: 'white', ml: 'auto' }}>
                      {Math.round(score * 100)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Grid>
          <Grid item sm={4}>
            {/* Self-assessment */}
            <Box
              sx={{
                mt: { xs: 2, md: 0 },
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.300',
                position: 'relative',
              }}
            >
              <Chip
                label="Coming Soon"
                color="primary"
                size="small"
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: 16,
                  fontWeight: 'medium',
                }}
              />

              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Opportunity for Growth
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Your <strong>{categoryDisplayNames[lowestCategory[0] as CategoryEnum]}</strong>{' '}
                perspective has the most room for improvement. Soon you&apos;ll be able to take a
                detailed assessment to better understand this area.
              </Typography>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                disabled
                sx={{
                  '&.Mui-disabled': {
                    borderColor: 'grey.300',
                    color: 'grey.500',
                  },
                }}
              >
                Self-Assessment
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const recommendedPatterns = [
  {
    id: 'pattern1',
    title: 'Pattern One',
    image: 'https://api.di.sce.de/uploads/Persistent_and_flexible_1bca83937b.JPG',
  },
  {
    id: 'pattern2',
    title: 'Pattern Two',
    image: 'https://api.di.sce.de/uploads/Persistent_and_flexible_1bca83937b.JPG',
  },
];

const RecommendationSection: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recommended Patterns
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Based on your current maturity score, we recommend the following pattern to help you
          improve.
        </Typography>
        <Grid container spacing={2}>
          {recommendedPatterns.map((pattern) => (
            <Grid item xs={6} key={pattern.id}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  aspectRatio: '2/3',
                  borderRadius: 4,
                }}
              >
                <CardMedia component="img" image={pattern.image} alt={pattern.title} />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {pattern.title}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button variant="contained" endIcon={<ArrowForward />} size="small" fullWidth>
                    Start Pattern
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const PatternBacklogSection: React.FC = () => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pattern Backlog
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          You&apos;ve got some patterns in progress. Keep up the good work!
        </Typography>
        <Button variant="outlined" endIcon={<ArrowForward />} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={patternsInProgress} color="primary" size="small" />
            Continue Patterns
          </Box>
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
        <Grid container spacing={2}>
          <Grid item sm={12}>
            <MaturityScoreSection />
          </Grid>
          <Grid item xs={12} sm={8}>
            <RecommendationSection />
          </Grid>
          <Grid item xs={12} sm={4}>
            <PatternBacklogSection />
          </Grid>
        </Grid>
      </CenteredFlexBox>
    </>
  );
};

export default Dashboard;
