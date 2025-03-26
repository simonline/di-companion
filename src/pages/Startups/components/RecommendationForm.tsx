import React from 'react';
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
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Recommendation } from '@/types/strapi';
import { CreateRecommendation, UpdateRecommendation } from '@/lib/strapi';

interface RecommendationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateRecommendation | UpdateRecommendation) => Promise<void>;
  initialValues?: Recommendation;
  isSubmitting?: boolean;
}

const validationSchema = Yup.object({
  recommendation: Yup.string().required('Recommendation is required'),
  type: Yup.string()
    .oneOf(['pattern', 'url', 'file', 'contact'], 'Invalid type')
    .required('Type is required'),
  text: Yup.string(),
});

const RecommendationForm: React.FC<RecommendationFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  isSubmitting = false,
}) => {
  const isEditMode = Boolean(initialValues?.documentId);

  const formik = useFormik({
    initialValues: {
      documentId: initialValues?.documentId || '',
      recommendation: initialValues?.recommendation || '',
      type: initialValues?.type || 'pattern',
      text: initialValues?.text || '',
      isRead: initialValues?.isRead || false,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
        onClose();
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{isEditMode ? 'Edit Recommendation' : 'Add New Recommendation'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              id="recommendation"
              name="recommendation"
              label="Recommendation"
              value={formik.values.recommendation}
              onChange={formik.handleChange}
              error={formik.touched.recommendation && Boolean(formik.errors.recommendation)}
              helperText={formik.touched.recommendation && formik.errors.recommendation}
              multiline
              rows={4}
            />

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

            <TextField
              fullWidth
              id="text"
              name="text"
              label="Additional Text"
              value={formik.values.text}
              onChange={formik.handleChange}
              error={formik.touched.text && Boolean(formik.errors.text)}
              helperText={formik.touched.text && formik.errors.text}
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
