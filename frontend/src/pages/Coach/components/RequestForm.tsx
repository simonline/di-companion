import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateRequest } from '@/lib/supabase';

interface RequestFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TablesInsert<'requests'>) => Promise<void>;
  isSubmitting: boolean;
  startupId?: string;
}

const RequestSchema = Yup.object().shape({
  comment: Yup.string().required('Please enter your request'),
});

const RequestForm: React.FC<RequestFormProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  startupId,
}) => {
  const formik = useFormik({
    initialValues: {
      comment: '',
    },
    validationSchema: RequestSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit({
          ...values,
          startup: startupId,
        });
        formik.resetForm();
        onClose();
      } catch (err) {
        // Error will be handled by the parent component
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Send Request to Coach</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <TextField
              label="Your Request"
              name="comment"
              multiline
              rows={4}
              fullWidth
              value={formik.values.comment}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.comment && Boolean(formik.errors.comment)}
              helperText={formik.touched.comment && formik.errors.comment}
              disabled={isSubmitting}
              placeholder="How can your coach help you?"
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RequestForm;
