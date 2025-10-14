import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Pattern,
  Recommendation,
  RecommendationCreate,
  RecommendationUpdate
} from '@/types/database';
import useSearch from '@/hooks/useSearch';
import { useAuthContext } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

type RecommendationWithPatterns = Recommendation & {
  patterns?: Pattern[];
};

interface RecommendationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RecommendationCreate | RecommendationUpdate, patternIds: string[]) => Promise<void>;
  initialValues?: RecommendationWithPatterns;
  isSubmitting?: boolean;
  startupId: string;
}

const validationSchema = Yup.object({
  comment: Yup.string().required('Comment is required'),
  type: Yup.string()
    .oneOf(['pattern', 'url', 'file', 'contact'], 'Invalid type')
    .required('Type is required'),
  patterns: Yup.array().when('type', {
    is: 'pattern',
    then: (schema) => schema.min(1, 'At least one pattern must be selected'),
    otherwise: (schema) => schema,
  }),
});

const RecommendationForm: React.FC<RecommendationFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting = false,
  startupId,
}) => {
  const { user } = useAuthContext();
  const { SearchComponent, searchResults } = useSearch();
  const isEditMode = Boolean(initialValues?.id);
  const [selectedPatterns, setSelectedPatterns] = useState<Pattern[]>([]);

  // Reset and fetch patterns when dialog opens or initialValues change
  useEffect(() => {
    const fetchPatterns = async () => {
      if (!open) {
        // Reset when dialog closes
        setSelectedPatterns([]);
        return;
      }

      if (initialValues?.patterns) {
        // Use patterns provided in initialValues
        setSelectedPatterns(initialValues.patterns);
      } else if (isEditMode && initialValues?.id) {
        // Fetch patterns from the link table
        const { data } = await supabase
          .from('recommendations_patterns_lnk')
          .select('pattern_id, patterns(*)')
          .eq('recommendation_id', initialValues.id);

        if (data) {
          const patterns = data.map((item: any) => item.patterns).filter(Boolean);
          setSelectedPatterns(patterns);
        }
      } else {
        // Clear patterns for new recommendation
        setSelectedPatterns([]);
      }
    };

    fetchPatterns();
  }, [open, initialValues?.id, initialValues?.patterns, isEditMode]);

  const formik = useFormik({
    initialValues: {
      id: initialValues?.id || '',
      comment: initialValues?.comment || '',
      type: initialValues?.type || 'pattern',
      patterns: selectedPatterns.map(p => p.id),
      coach_id: user?.id,
      startup_id: startupId,
      read_at: initialValues?.read_at,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        console.log('Form values:', values);
        console.log('Pattern IDs being submitted:', values.patterns);

        // Create different objects based on whether we're creating or updating
        // Create recommendation data without patterns
        const baseData = {
          comment: values.comment,
          type: values.type,
          coach_id: values.coach_id,
          startup_id: values.startup_id,
          read_at: values.read_at,
        };

        let formattedValues: RecommendationCreate | RecommendationUpdate;

        if (values.id) {
          // For update
          formattedValues = {
            id: values.id,
            ...baseData,
          } as RecommendationUpdate;
        } else {
          // For create
          formattedValues = baseData as RecommendationCreate;
        }

        // Pass pattern IDs separately
        await onSubmit(formattedValues, values.patterns);
        onClose();
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
  });

  const handlePatternSelect = (pattern: any) => {
    if (!pattern || !pattern.id) {
      console.error('Invalid pattern selected:', pattern);
      return;
    }

    const currentPatterns = [...formik.values.patterns];
    const patternIdExists = currentPatterns.some((p) => p === pattern.id);

    if (!patternIdExists) {
      formik.setFieldValue('patterns', [...currentPatterns, pattern.id]);

      // Check if the pattern is already in the selectedPatterns array to avoid duplicates
      const patternExists = selectedPatterns.some((p) => p.id === pattern.id);
      if (!patternExists) {
        setSelectedPatterns((prev) => [...prev, pattern]);
      }
    }
  };

  const handleRemovePattern = (patternId: string) => {
    const updatedPatterns = formik.values.patterns.filter((p) => p !== patternId);
    formik.setFieldValue('patterns', updatedPatterns);
    setSelectedPatterns((prev) => prev.filter((pattern) => pattern.id !== patternId));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{isEditMode ? 'Edit Recommendation' : 'Add New Recommendation'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth error={formik.touched.type && Boolean(formik.errors.type)}>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type"
                name="type"
                value={formik.values.type}
                label="Type"
                onChange={formik.handleChange}
              >
                <MenuItem value="pattern">Pattern</MenuItem>
                <MenuItem value="url">URL</MenuItem>
                <MenuItem value="file">File</MenuItem>
                <MenuItem value="contact">Contact</MenuItem>
              </Select>
              {formik.touched.type && formik.errors.type && (
                <FormHelperText>{formik.errors.type}</FormHelperText>
              )}
            </FormControl>

            {formik.values.type === 'pattern' && (
              <Box>
                {selectedPatterns.length > 0 && (
                  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedPatterns.map((pattern) => (
                      <Chip
                        key={pattern.id}
                        label={pattern.name}
                        onDelete={() => handleRemovePattern(pattern.id)}
                      />
                    ))}
                  </Box>
                )}

                <Box sx={{ position: 'relative' }}>
                  <SearchComponent
                    onSelect={handlePatternSelect}
                    preventNavigation={true}
                    forceExpanded={true}
                  />
                  {searchResults && searchResults.length > 0 && (
                    <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                      {searchResults.map((pattern) => (
                        <Box
                          key={pattern.id}
                          sx={{
                            p: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: formik.values.patterns.includes(pattern.id)
                              ? 'action.selected'
                              : 'transparent',
                          }}
                          onClick={() => handlePatternSelect(pattern)}
                        >
                          {pattern.name}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
                {formik.touched.patterns && formik.errors.patterns && (
                  <FormHelperText error>{String(formik.errors.patterns)}</FormHelperText>
                )}
              </Box>
            )}

            <TextField
              fullWidth
              id="comment"
              name="comment"
              label="Comment"
              value={formik.values.comment}
              onChange={formik.handleChange}
              error={formik.touched.comment && Boolean(formik.errors.comment)}
              helperText={formik.touched.comment && formik.errors.comment}
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : isEditMode ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RecommendationForm;
