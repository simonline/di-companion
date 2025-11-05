import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { Question, UserQuestion, StartupQuestion } from '@/types/database';
import { QuestionType, QuestionOption, ScaleOptions } from '@/utils/constants';
import { exportAsText } from '@/utils/exportAssessment';

interface AssessmentSummaryProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  questions: Question[];
  answers: (UserQuestion | StartupQuestion)[];
  metadata?: {
    user?: string;
    startup?: string;
  };
}

/**
 * Format answer value based on question type
 */
const formatAnswerValue = (
  answer: any,
  question: Question
): string | string[] => {
  if (answer === null || answer === undefined || answer === '') {
    return '';
  }

  // Handle array answers (multiple choice, rank)
  if (Array.isArray(answer)) {
    if (answer.length === 0) return '';

    // For rank type, show numbered list with labels
    if (question.type === QuestionType.rank) {
      const options = question.options as QuestionOption[] | null;
      if (options) {
        return answer.map((value, idx) => {
          const option = options.find(opt => opt.value === value);
          const label = option?.label || value;
          return `${idx + 1}. ${label}`;
        });
      }
      return answer.map((value, idx) => `${idx + 1}. ${value}`);
    }

    // For checkbox_multiple and select_multiple, find labels
    if (
      question.type === QuestionType.checkbox_multiple ||
      question.type === QuestionType.select_multiple
    ) {
      const options = question.options as QuestionOption[] | null;
      if (options) {
        return answer.map(value => {
          const option = options.find(opt => opt.value === value);
          return option?.label || value;
        });
      }
    }

    return answer;
  }

  // Handle boolean
  if (typeof answer === 'boolean') {
    return answer ? 'Yes' : 'No';
  }

  // Handle number (scale, number)
  if (question.type === QuestionType.scale) {
    const scaleOptions = question.options as ScaleOptions | null;
    if (scaleOptions && scaleOptions.max && scaleOptions.minLabel && scaleOptions.maxLabel) {
      return `${answer}/${scaleOptions.max} (${scaleOptions.min}=${scaleOptions.minLabel}, ${scaleOptions.max}=${scaleOptions.maxLabel})`;
    } else if (scaleOptions && scaleOptions.max) {
      return `${answer}/${scaleOptions.max}`;
    }
    return `${answer}`;
  }

  // Handle single choice (radio, select) - find label
  if (
    question.type === QuestionType.radio ||
    question.type === QuestionType.select
  ) {
    const options = question.options as QuestionOption[] | null;
    if (options) {
      const option = options.find(opt => opt.value === answer);
      return option?.label || String(answer);
    }
  }

  // Handle checkbox (single)
  if (question.type === QuestionType.checkbox) {
    return answer ? 'Checked' : 'Unchecked';
  }

  // Default string conversion - strip surrounding quotes if present
  const strValue = String(answer);
  // Remove surrounding double quotes if they exist
  if (strValue.startsWith('"') && strValue.endsWith('"')) {
    return strValue.slice(1, -1);
  }
  return strValue;
};

/**
 * Create answer map from saved answers (using latest_* views, so already the newest values)
 */
const createAnswerMap = (
  savedAnswers: (UserQuestion | StartupQuestion)[]
): Map<string, any> => {
  const answerMap = new Map<string, any>();

  // Add saved answers (these come from latest_user_questions or latest_startup_questions views)
  savedAnswers.forEach(savedAnswer => {
    if (savedAnswer.question_id) {
      answerMap.set(savedAnswer.question_id, savedAnswer.answer);
    }
  });

  return answerMap;
};

const AssessmentSummary: React.FC<AssessmentSummaryProps> = ({
  open,
  onClose,
  title,
  subtitle,
  questions,
  answers,
  metadata,
}) => {
  // Create answer map and calculate progress
  const { answerMap, answeredCount, totalCount } = useMemo(() => {
    const map = createAnswerMap(answers);

    // Count answered questions (non-empty answers)
    let answered = 0;
    questions.forEach(q => {
      const answer = map.get(q.id);
      if (answer !== null && answer !== undefined && answer !== '' &&
        !(Array.isArray(answer) && answer.length === 0)) {
        answered++;
      }
    });

    return {
      answerMap: map,
      answeredCount: answered,
      totalCount: questions.length,
    };
  }, [questions, answers]);

  // Group questions by category/topic
  const groupedQuestions = useMemo(() => {
    const groups: Record<string, Question[]> = {};

    questions.forEach(question => {
      // categories is a Json field that can contain an array
      const categories = question.categories as any;
      const category = Array.isArray(categories) && categories.length > 0
        ? categories[0]
        : null;
      const key = question.topic || category || 'General';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(question);
    });

    // Sort questions within each group by order
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return groups;
  }, [questions]);

  // Filter to only show answered questions
  const filteredGroupedQuestions = useMemo(() => {
    const filtered: Record<string, Array<{ question: Question; answer: any }>> = {};

    Object.entries(groupedQuestions).forEach(([groupName, groupQuestions]) => {
      const answeredQuestions = groupQuestions
        .map(q => ({
          question: q,
          answer: answerMap.get(q.id),
        }))
        .filter(({ answer }) =>
          answer !== null &&
          answer !== undefined &&
          answer !== '' &&
          !(Array.isArray(answer) && answer.length === 0)
        );

      if (answeredQuestions.length > 0) {
        filtered[groupName] = answeredQuestions;
      }
    });

    return filtered;
  }, [groupedQuestions, answerMap]);

  const handleExport = () => {
    // Prepare export data with only answered questions and their formatted values
    const sections = Object.entries(filteredGroupedQuestions).map(([heading, items]) => ({
      heading,
      questions: items.map(({ question, answer }) => {
        const formatted = formatAnswerValue(answer, question);
        return {
          question: question.question || '',
          // Convert arrays to proper format for export
          answer: Array.isArray(formatted) ? formatted : formatted,
        };
      }),
    }));

    const exportData = {
      title,
      subtitle,
      sections,
      metadata: {
        date: new Date().toLocaleDateString('de-DE', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        ...metadata,
      },
    };

    exportAsText(exportData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" component="div">
              {title} Summary
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {answeredCount} of {totalCount} questions answered
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {Object.keys(filteredGroupedQuestions).length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No questions answered yet
            </Typography>
          </Box>
        ) : (
          <Box>
            {Object.entries(filteredGroupedQuestions).map(([groupName, items], groupIdx) => {
              const totalSections = Object.keys(filteredGroupedQuestions).length;
              const showSectionTitle = totalSections > 1;

              return (
                <Box key={groupName}>
                  {showSectionTitle && groupIdx > 0 && <Divider sx={{ my: 1.5 }} />}

                  {showSectionTitle && (
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="primary"
                      sx={{ mb: 0.75 }}
                    >
                      {groupName}
                    </Typography>
                  )}

                  {items.map(({ question, answer }) => {
                    const formattedAnswer = formatAnswerValue(answer, question);

                    return (
                      <Box
                        key={question.id}
                        sx={{
                          mb: 0.75,
                          pl: 1.5,
                          borderLeft: '2px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
                          {question.question}
                        </Typography>

                        {Array.isArray(formattedAnswer) ? (
                          <Box component="ul" sx={{ mt: 0, mb: 0, pl: 2, listStyleType: 'disc' }}>
                            {formattedAnswer.map((item, i) => (
                              <Typography
                                key={i}
                                component="li"
                                variant="caption"
                                fontWeight="medium"
                                sx={{ mb: 0 }}
                              >
                                {item}
                              </Typography>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" fontWeight="medium" display="block">
                            {formattedAnswer}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={answeredCount === 0}
        >
          Export as .txt
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssessmentSummary;
