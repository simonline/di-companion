import React, { useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { ArrowBack, Psychology } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AssessmentStep, { AssessmentStepRef } from '@/components/AssessmentStep';
import useNotifications from '@/store/notifications';
import { CategoryEnum, categoryDisplayNames, categoryColors, categoryIcons } from '@/utils/constants';

const SelfAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { user, startup, profile, updateProfile, updateScores } = useAuthContext();
  const [, notificationsActions] = useNotifications();
  const assessmentRef = useRef<AssessmentStepRef>(null);

  // SelfAssessment can be called from both User page (step 3) and Startup page
  const isUserOnboarding = profile && !profile.progress?.assessment;
  const returnPath = isUserOnboarding ? '/user' : '/startup';
  const returnLabel = isUserOnboarding ? 'User' : 'Startup';

  const handleSubmit = async () => {
    if (assessmentRef.current) {
      const isValid = assessmentRef.current.isValid();
      if (!isValid) {
        notificationsActions.push({
          options: { variant: 'warning' },
          message: 'Please answer all required questions before submitting',
        });
        return;
      }

      await assessmentRef.current.submit();
      await completeAssessment();
    }
  };

  const completeAssessment = async () => {
    try {
      // Update scores
      await updateScores();

      // Mark assessment as completed based on context
      if (isUserOnboarding && profile && user) {
        const currentProgress = profile.progress || {
          profile: false,
          values: false,
          assessment: false,
          startup: false
        };
        await updateProfile({
          id: user.id,
          progress: {
            ...currentProgress,
            assessment: true
          }
        });
      }

      notificationsActions.push({
        options: { variant: 'success' },
        message: 'Self assessment completed successfully',
      });

      navigate(returnPath);
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Failed to complete assessment',
      });
    }
  };

  if (!user || !startup) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Typography variant="h6">Please log in to access the assessment</Typography>
      </Box>
    );
  }

  return (
    <>
      <Header title="Self Assessment" />
      <CenteredFlexBox>
        <Container maxWidth="md">
          <Box sx={{ mb: 1, mt: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate(returnPath)}
              sx={{ color: 'text.secondary' }}
            >
              Back to {returnLabel}
            </Button>
          </Box>

          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Psychology sx={{ fontSize: 64, color: categoryColors[CategoryEnum.entrepreneur], mb: 2 }} />
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  Self Assessment
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Evaluate your entrepreneurial skills and mindset
                </Typography>
              </Box>

              {/* Assessment Step for entrepreneur category only */}
              <AssessmentStep
                ref={assessmentRef}
                category={CategoryEnum.entrepreneur}
                questionType="user"
                userId={user.id}
                startupId={startup.id}
                surveyName="Self Assessment"
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  size="large"
                >
                  Complete Assessment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </CenteredFlexBox>
    </>
  );
};

export default SelfAssessment;