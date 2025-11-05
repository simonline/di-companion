import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
} from '@mui/material';
import { ArrowBack, Psychology, Summarize } from '@mui/icons-material';
import Header from '@/sections/Header';
import { CenteredFlexBox } from '@/components/styled';
import { useAuthContext } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AssessmentStep, { AssessmentStepRef } from '@/components/AssessmentStep';
import useNotifications from '@/store/notifications';
import { CategoryEnum, categoryColors } from '@/utils/constants';
import AssessmentSummary from '@/components/AssessmentSummary';
import useQuestions from '@/hooks/useQuestions';
import useUserQuestions from '@/hooks/useUserQuestions';

const SelfAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile, updateScores } = useAuthContext();
  const [, notificationsActions] = useNotifications();
  const assessmentRef = useRef<AssessmentStepRef>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Fetch all questions and answers for summary
  const { fetchQuestions, questions } = useQuestions();
  const { fetchUserQuestions, userQuestions } = useUserQuestions();

  useEffect(() => {
    if (user?.id) {
      fetchQuestions(CategoryEnum.entrepreneur);
      fetchUserQuestions(user.id);
    }
  }, [user?.id, fetchQuestions, fetchUserQuestions]);

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
      if (profile && user) {
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

      navigate('/user');
    } catch (error) {
      notificationsActions.push({
        options: { variant: 'error' },
        message: 'Failed to complete assessment',
      });
    }
  };

  const handleOpenSummary = () => {
    // Refetch latest data before opening summary
    if (user?.id) {
      fetchUserQuestions(user.id);
    }
    setSummaryOpen(true);
  };

  if (!user) {
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
          <Box sx={{ mb: 1, mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/user")}
              sx={{ color: 'text.secondary' }}
            >
              Back to User
            </Button>
            <Button
              startIcon={<Summarize />}
              onClick={handleOpenSummary}
              sx={{ color: 'text.secondary' }}
            >
              Summary
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
                surveyName="Self Assessment"
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  size="large"
                  sx={{
                    backgroundColor: categoryColors.entrepreneur,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: categoryColors.entrepreneur,
                      filter: 'brightness(0.9)',
                    }
                  }}
                >
                  Complete Assessment
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </CenteredFlexBox>

      {/* Assessment Summary Dialog - outside Container for proper modal behavior */}
      {questions && userQuestions && (
        <AssessmentSummary
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
          title="Self Assessment"
          subtitle="Evaluate your entrepreneurial skills and mindset"
          questions={questions}
          answers={userQuestions}
          metadata={{ user: profile?.given_name || profile?.email || undefined }}
        />
      )}
    </>
  );
};

export default SelfAssessment;