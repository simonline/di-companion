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
import { Pattern, Recommendation } from '@/types/supabase';
import { CreateRecommendation, UpdateRecommendation } from '@/lib/supabase';
import useSearch from '@/hooks/useSearch';
import { useAuthContext } from '@/hooks/useAuth';
interface RecommendationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateRecommendation | UpdateRecommendation) => Promise<void>;
  initialValues?: Recommendation;
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
  const isEditMode = Boolean(initialValues?.documentId);
  const [selectedPatterns, setSelectedPatterns] = useState<Pattern[]>([]);
  // Synchronize selectedPatterns when initialValues changes
  useEffect(() => {
    setSelectedPatterns(initialValues?.patterns || []);
  }, [initialValues?.patterns]);

  const formik = useFormik({
    initialValues: {
      documentId: initialValues?.documentId || '',
      comment: initialValues?.comment || '',
      type: initialValues?.type || 'pattern',
      patterns: initialValues?.patterns
        ? initialValues.patterns.map((pattern: any) => pattern.documentId)
        : [],
      coach: user?.documentId,
      startup: startupId,
      readAt: initialValues?.readAt,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // Create different objects based on whether we're creating or updating
        const baseData = {
          comment: values.comment,
          type: values.type,
          patterns: { set: values.patterns },
          coach: values.coach,
          startup: values.startup,
          readAt: values.readAt,
        };

        let formattedValues: CreateRecommendation | UpdateRecommendation;

        if (values.documentId) {
          // For update
          formattedValues = {
            documentId: values.documentId,
            ...baseData,
          } as UpdateRecommendation;
        } else {
          // For create
          formattedValues = baseData as CreateRecommendation;
        }

        await onSubmit(formattedValues);
        onClose();
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
  });

  const handlePatternSelect = (pattern: any) => {
    if (!pattern || !pattern.documentId) {
      console.error('Invalid pattern selected:', pattern);
      return;
    }

    const currentPatterns = [...formik.values.patterns];
    const patternIdExists = currentPatterns.some((p) => p === pattern.documentId);

    if (!patternIdExists) {
      formik.setFieldValue('patterns', [...currentPatterns, pattern.documentId]);

      // Check if the pattern is already in the selectedPatterns array to avoid duplicates
      const patternExists = selectedPatterns.some((p) => p.documentId === pattern.documentId);
      if (!patternExists) {
        setSelectedPatterns((prev) => [...prev, pattern]);
      }
    }
  };

  const handleRemovePattern = (patternId: string) => {
    const updatedPatterns = formik.values.patterns.filter((p) => p !== patternId);
    formik.setFieldValue('patterns', updatedPatterns);
    setSelectedPatterns((prev) => prev.filter((pattern) => pattern.documentId !== patternId));
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
                        key={pattern.documentId}
                        label={pattern.name}
                        onDelete={() => handleRemovePattern(pattern.documentId)}
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
                          key={pattern.documentId}
                          sx={{
                            p: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            bgcolor: formik.values.patterns.includes(pattern.documentId)
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
