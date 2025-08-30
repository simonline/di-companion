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
  startDate: string;
  foundersCount: number;
  background: string;
  idea: string;
  productType: string;
  industry: string;
  industryOther?: string;
  targetMarket: string;
  phase: string;
  isProblemValidated: boolean;
  qualifiedConversationsCount: number;
  isTargetGroupDefined: boolean;
  isPrototypeValidated: boolean;
  isMvpTested: boolean;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Startup name is required'),
  startDate: Yup.date().required('Start date is required'),
  foundersCount: Yup.number().min(0, 'Must be 0 or greater').required('Number of founders is required'),
  background: Yup.string().required('Team background information is required'),
  idea: Yup.string().max(200, 'Must be 200 characters or less').required('Idea description is required'),
  productType: Yup.string().oneOf(['product', 'service', 'platform'], 'Please select a valid product type').required('Product type is required'),
  industry: Yup.string().required('Industry is required'),
  targetMarket: Yup.string().oneOf(['b2b', 'b2c'], 'Must be either B2B or B2C').required('Target market is required'),
  phase: Yup.string().oneOf(['start', 'discover_explore', 'transform', 'create', 'implement'], 'Please select a valid phase').required('Current phase is required'),
  qualifiedConversationsCount: Yup.number().min(0, 'Must be 0 or greater'),
});

const initialValues: StartupFormValues = {
  name: '',
  startDate: '',
  foundersCount: 1,
  background: '',
  idea: '',
  productType: '',
  industry: '',
  targetMarket: '',
  phase: '',
  isProblemValidated: false,
  qualifiedConversationsCount: 0,
  isTargetGroupDefined: false,
  isPrototypeValidated: false,
  isMvpTested: false,
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
      await createStartup(values);

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
                        name="startDate"
                        label="Start Date"
                        type="date"
                        value={values.startDate}
                        onChange={(e) => setFieldValue('startDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        error={touched.startDate && Boolean(errors.startDate)}
                        helperText={touched.startDate && errors.startDate}
                      />
                    </FieldWithTooltip>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FieldWithTooltip tooltip="How many co-founders are working on this startup">
                      <TextField
                        fullWidth
                        name="foundersCount"
                        label="Number of Founders"
                        type="number"
                        value={values.foundersCount}
                        onChange={(e) => setFieldValue('foundersCount', Number(e.target.value))}
                        error={touched.foundersCount && Boolean(errors.foundersCount)}
                        helperText={touched.foundersCount && errors.foundersCount}
                        InputProps={{
                          endAdornment: (
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setFieldValue('foundersCount', Math.max(0, values.foundersCount - 1))
                                }
                              >
                                <Remove />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => setFieldValue('foundersCount', values.foundersCount + 1)}
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
                        name="productType"
                        label="What are you building?"
                        value={values.productType}
                        onChange={(e) => setFieldValue('productType', e.target.value)}
                        error={touched.productType && Boolean(errors.productType)}
                        helperText={touched.productType && errors.productType}
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
                        name="industryOther"
                        label="Please specify your industry"
                        value={values.industryOther || ''}
                        onChange={(e) => setFieldValue('industryOther', e.target.value)}
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <FieldWithTooltip tooltip="Are you selling to businesses (B2B) or consumers (B2C)?">
                      <TextField
                        select
                        fullWidth
                        name="targetMarket"
                        label="Target Market"
                        value={values.targetMarket}
                        onChange={(e) => setFieldValue('targetMarket', e.target.value)}
                        error={touched.targetMarket && Boolean(errors.targetMarket)}
                        helperText={touched.targetMarket && errors.targetMarket}
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
                          name="isProblemValidated"
                          checked={values.isProblemValidated}
                          onChange={(e) => setFieldValue('isProblemValidated', e.target.checked)}
                        />
                      }
                      label="Have you validated that your target market has the problem you're solving?"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FieldWithTooltip tooltip="Number of in-depth conversations with potential customers">
                      <TextField
                        fullWidth
                        name="qualifiedConversationsCount"
                        label="Customer Interviews Conducted"
                        type="number"
                        value={values.qualifiedConversationsCount}
                        onChange={(e) => setFieldValue('qualifiedConversationsCount', Number(e.target.value))}
                      />
                    </FieldWithTooltip>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="isTargetGroupDefined"
                          checked={values.isTargetGroupDefined}
                          onChange={(e) => setFieldValue('isTargetGroupDefined', e.target.checked)}
                        />
                      }
                      label="Have you clearly defined your target customer segment?"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="isPrototypeValidated"
                          checked={values.isPrototypeValidated}
                          onChange={(e) => setFieldValue('isPrototypeValidated', e.target.checked)}
                        />
                      }
                      label="Have you created and tested a prototype with potential users?"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="isMvpTested"
                          checked={values.isMvpTested}
                          onChange={(e) => setFieldValue('isMvpTested', e.target.checked)}
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