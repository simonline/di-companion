import React, { useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Add, Remove, HelpOutline } from '@mui/icons-material';
import { useAuthContext } from '@/hooks/useAuth';
import { OnboardingStepProps } from '../OnboardingFlow';

interface StartupFormValues {
  name: string;
  start_date: string;
  founders_count: number;
  background: string;
  idea: string;
  product_type: string;
  industry: string;
  industry_other?: string;
  target_market: string;
  phase: string;
  is_problem_validated: boolean;
  qualified_conversations_count: number;
  is_target_group_defined: boolean;
  is_prototype_validated: boolean;
  is_mvp_tested: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Startup name is required'),
  start_date: Yup.date().required('Start date is required'),
  founders_count: Yup.number().min(0, 'Must be 0 or greater').required('Number of founders is required'),
  background: Yup.string().required('Team background information is required'),
  idea: Yup.string().max(200, 'Must be 200 characters or less').required('Idea description is required'),
  product_type: Yup.string().oneOf(['product', 'service', 'platform'], 'Please select a valid product type').required('Product type is required'),
  industry: Yup.string().required('Industry is required'),
  target_market: Yup.string().oneOf(['b2b', 'b2c'], 'Must be either B2B or B2C').required('Target market is required'),
  phase: Yup.string().oneOf(['start', 'discover_explore', 'transform', 'create', 'implement'], 'Please select a valid phase').required('Current phase is required'),
  qualified_conversations_count: Yup.number().min(0, 'Must be 0 or greater'),
});

const initialValues: StartupFormValues = {
  name: '',
  start_date: '',
  founders_count: 1,
  background: '',
  idea: '',
  product_type: '',
  industry: '',
  target_market: '',
  phase: '',
  is_problem_validated: false,
  qualified_conversations_count: 0,
  is_target_group_defined: false,
  is_prototype_validated: false,
  is_mvp_tested: false,
};

const FieldWithTooltip = ({ tooltip, children }: { tooltip: string; children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1 }}>
    <Box sx={{ flexGrow: 1 }}>
      {children}
    </Box>
    <Tooltip title={tooltip} placement="right">
      <IconButton size="small" sx={{ mt: 1 }}>
        <HelpOutline fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

const StartupCreationStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onBack,
  isFirstStep,
}) => {
  const { createStartup, user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!user) return null;

  const handleSubmit = async (
    values: StartupFormValues,
    { setSubmitting }: FormikHelpers<StartupFormValues>
  ): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await createStartup({
        name: values.name,
        start_date: values.start_date,
        founders_count: values.founders_count,
        background: values.background,
        idea: values.idea,
        product_type: values.product_type,
        industry: values.industry,
        industry_other: values.industry_other,
        target_market: values.target_market,
        phase: values.phase,
        is_problem_validated: values.is_problem_validated,
        qualified_conversations_count: values.qualified_conversations_count,
        is_target_group_defined: values.is_target_group_defined,
        is_prototype_validated: values.is_prototype_validated,
        is_mvp_tested: values.is_mvp_tested,
      });

      // Move to completion
      onNext();
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Startup creation error:', error);
      setErrorMessage(error.message || 'Failed to create startup. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Tell us about your startup idea. This helps us provide personalized recommendations and tools.
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isValid, setFieldValue, values }) => (
          <Form>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Basic Information */}
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                  Basic Information
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FieldWithTooltip tooltip="The name of your startup or project">
                      <TextField
                        fullWidth
                        name="name"
                        label="Startup Name"
                        value={values.name}
                        onChange={(e) => setFieldValue('name', e.target.value)}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </FieldWithTooltip>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FieldWithTooltip tooltip="When you first started working on this startup idea">
                      <TextField
                        fullWidth
                        name="start_date"
                        label="Start Date"
                        type="date"
                        value={values.start_date}
                        onChange={(e) => setFieldValue('start_date', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        error={touched.start_date && Boolean(errors.start_date)}
                        helperText={touched.start_date && errors.start_date}
                      />
                    </FieldWithTooltip>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FieldWithTooltip tooltip="How many co-founders are working on this startup">
                      <TextField
                        fullWidth
                        name="founders_count"
                        label="Number of Founders"
                        type="number"
                        value={values.founders_count}
                        onChange={(e) => setFieldValue('founders_count', Number(e.target.value))}
                        error={touched.founders_count && Boolean(errors.founders_count)}
                        helperText={touched.founders_count && errors.founders_count}
                        InputProps={{
                          endAdornment: (
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setFieldValue('founders_count', Math.max(0, values.founders_count - 1))
                                }
                              >
                                <Remove />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => setFieldValue('founders_count', values.founders_count + 1)}
                              >
                                <Add />
                              </IconButton>
                            </Box>
                          ),
                        }}
                      />
                    </FieldWithTooltip>
                  </Grid>

                  <Grid item xs={12}>
                    <FieldWithTooltip tooltip="Brief description of the founders' experience and expertise">
                      <TextField
                        fullWidth
                        name="background"
                        label="Team Background"
                        multiline
                        rows={3}
                        value={values.background}
                        onChange={(e) => setFieldValue('background', e.target.value)}
                        error={touched.background && Boolean(errors.background)}
                        helperText={touched.background && errors.background}
                        placeholder="Tell us about your team's experience and expertise"
                      />
                    </FieldWithTooltip>
                  </Grid>

                  <Grid item xs={12}>
                    <FieldWithTooltip tooltip="A concise description of your startup idea (max 200 characters)">
                      <TextField
                        fullWidth
                        name="idea"
                        label="Startup Idea"
                        multiline
                        rows={3}
                        value={values.idea}
                        onChange={(e) => setFieldValue('idea', e.target.value)}
                        error={touched.idea && Boolean(errors.idea)}
                        helperText={touched.idea && errors.idea}
                        placeholder="Describe your startup idea in a few sentences (max 200 characters)"
                        inputProps={{ maxLength: 200 }}
                      />
                    </FieldWithTooltip>
                  </Grid>
                </Grid>
              </Box>

              {/* Product & Market */}
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium' }}>
                  Product & Market
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FieldWithTooltip tooltip="Select the type that best describes what you're building">
                      <TextField
                        select
                        fullWidth
                        name="product_type"
                        label="What are you building?"
                        value={values.product_type}
                        onChange={(e) => setFieldValue('product_type', e.target.value)}
                        error={touched.product_type && Boolean(errors.product_type)}
                        helperText={touched.product_type && errors.product_type}
                      >
                        <MenuItem value="product">Physical Product</MenuItem>
                        <MenuItem value="service">Service</MenuItem>
                        <MenuItem value="platform">Software Platform</MenuItem>
                      </TextField>
                    </FieldWithTooltip>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FieldWithTooltip tooltip="The primary industry your startup operates in">
                      <TextField
                        select
                        fullWidth
                        name="industry"
                        label="Industry"
                        value={values.industry}
                        onChange={(e) => setFieldValue('industry', e.target.value)}
                        error={touched.industry && Boolean(errors.industry)}
                        helperText={touched.industry && errors.industry}
                      >
                        <MenuItem value="tech">Technology</MenuItem>
                        <MenuItem value="health">Healthcare</MenuItem>
                        <MenuItem value="finance">Finance</MenuItem>
                        <MenuItem value="education">Education</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </TextField>
                    </FieldWithTooltip>
                  </Grid>

                  {values.industry === 'other' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="industry_other"
                        label="Please specify your industry"
                        value={values.industry_other || ''}
                        onChange={(e) => setFieldValue('industry_other', e.target.value)}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <FieldWithTooltip tooltip="Are you selling to businesses (B2B) or consumers (B2C)?">
                      <TextField
                        select
                        fullWidth
                        name="target_market"
                        label="Target Market"
                        value={values.target_market}
                        onChange={(e) => setFieldValue('target_market', e.target.value)}
                        error={touched.target_market && Boolean(errors.target_market)}
                        helperText={touched.target_market && errors.target_market}
                      >
                        <MenuItem value="b2b">Business to Business (B2B)</MenuItem>
                        <MenuItem value="b2c">Business to Consumer (B2C)</MenuItem>
                      </TextField>
                    </FieldWithTooltip>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FieldWithTooltip tooltip="The current development stage of your startup">
                      <TextField
                        select
                        fullWidth
                        name="phase"
                        label="Current Phase"
                        value={values.phase}
                        onChange={(e) => setFieldValue('phase', e.target.value)}
                        error={touched.phase && Boolean(errors.phase)}
                        helperText={touched.phase && errors.phase}
                      >
                        <MenuItem value="start">Just Starting (Idea Phase)</MenuItem>
                        <MenuItem value="discover_explore">Discovery & Research</MenuItem>
                        <MenuItem value="transform">Transforming Idea to Product</MenuItem>
                        <MenuItem value="create">Creating MVP</MenuItem>
                        <MenuItem value="implement">Implementing & Scaling</MenuItem>
                      </TextField>
                    </FieldWithTooltip>
                  </Grid>
                </Grid>
              </Box>

              {/* Validation & Progress (Optional) */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                  Progress & Validation (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  These questions help us understand your current progress. You can skip them for now.
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="is_problem_validated"
                          checked={values.is_problem_validated}
                          onChange={(e) => setFieldValue('is_problem_validated', e.target.checked)}
                        />
                      }
                      label="Have you validated that your target market has the problem you're solving?"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FieldWithTooltip tooltip="Number of in-depth conversations with potential customers">
                      <TextField
                        fullWidth
                        name="qualified_conversations_count"
                        label="Customer Interviews Conducted"
                        type="number"
                        value={values.qualified_conversations_count}
                        onChange={(e) => setFieldValue('qualified_conversations_count', Number(e.target.value))}
                      />
                    </FieldWithTooltip>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="is_target_group_defined"
                          checked={values.is_target_group_defined}
                          onChange={(e) => setFieldValue('is_target_group_defined', e.target.checked)}
                        />
                      }
                      label="Have you clearly defined your target customer segment?"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="is_prototype_validated"
                          checked={values.is_prototype_validated}
                          onChange={(e) => setFieldValue('is_prototype_validated', e.target.checked)}
                        />
                      }
                      label="Have you created and tested a prototype with potential users?"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="is_mvp_tested"
                          checked={values.is_mvp_tested}
                          onChange={(e) => setFieldValue('is_mvp_tested', e.target.checked)}
                        />
                      }
                      label="Have you built and tested a Minimum Viable Product (MVP)?"
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={onBack}
                  disabled={isFirstStep || isSubmitting}
                  sx={{ px: 4 }}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!isValid || isSubmitting}
                  sx={{ px: 4 }}
                >
                  {isSubmitting ? 'Creating Startup...' : 'Complete Setup'}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default StartupCreationStep;