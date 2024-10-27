import { useState } from 'react';
import { Formik, Form, FormikHelpers, Field } from 'formik';
import * as Yup from 'yup';
import {
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
} from '@mui/material';
import Meta from '@/components/Meta';
import { useNavigate } from 'react-router-dom';
import { FullSizeCenteredFlexBox } from '@/components/styled';
import { Add, Remove } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

const steps = [
  'Core Info',
  'Idea Description',
  'Product Type',
  'Industry',
  'Target Market',
  'Phase',
  'Problem Validation',
  'Prototype Validation',
  'MVP Testing',
];

const stepValidationSchemas = [
  // Step 0: Core Info
  Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(8, 'Must be at least 8 characters').required('Required'),
    firstName: Yup.string().required('Required'),
    lastName: Yup.string().required('Required'),
    startupName: Yup.string().required('Required'),
    startDate: Yup.date().required('Required'),
    coFoundersCount: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
    coFoundersBackground: Yup.string().required('Required'),
  }),

  // Step 1: Idea Description
  Yup.object().shape({
    ideaDescription: Yup.string().max(200, 'Must be 200 characters or less').required('Required'),
  }),

  // Step 2: Product Type
  Yup.object().shape({
    productType: Yup.string()
      .oneOf(['product', 'service', 'platform'], 'Invalid product type')
      .required('Required'),
  }),

  // Step 3: Industry
  Yup.object().shape({
    industry: Yup.string().required('Required'),
  }),

  // Step 4: Target Market
  Yup.object().shape({
    targetMarket: Yup.string()
      .oneOf(['B2B', 'B2C'], 'Must be either B2B or B2C')
      .required('Required'),
  }),

  // Step 5: Phase
  Yup.object().shape({
    phase: Yup.string()
      .oneOf(['Start', 'Discovery', 'Transform', 'Create', 'Implement'], 'Invalid phase')
      .required('Required'),
  }),

  // Step 6: Problem Validation
  Yup.object().shape({
    problemValidated: Yup.boolean().required('Required'),
    qualifiedConversations: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
    coreTargetGroupDefined: Yup.boolean().required('Required'),
  }),

  // Step 7: Prototype Validation
  Yup.object().shape({
    prototypeValidated: Yup.boolean().required('Required'),
  }),

  // Step 8: MVP Testing
  Yup.object().shape({
    mvpTested: Yup.boolean().required('Required'),
  }),
];

interface RegisterFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  startupName: string;
  startDate: string;
  coFoundersCount: number;
  coFoundersBackground: string;
  ideaDescription: string;
  productType: string;
  industry: string;
  industryOther?: string;
  targetMarket: string;
  phase: string;
  problemValidated: boolean;
  qualifiedConversations: number;
  coreTargetGroupDefined: boolean;
  prototypeValidated: boolean;
  mvpTested: boolean;
}

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting, setErrors }: FormikHelpers<RegisterFormValues>,
  ): Promise<void> => {
    try {
      const result = await register(
        {
          username: values.email,
          email: values.email,
          password: values.password,
        },
        {
          given_name: values.firstName,
          family_name: values.lastName,
        },
        {
          startup_name: values.startupName,
          start_date: values.startDate,
          co_founders_count: values.coFoundersCount,
          co_founders_background: values.coFoundersBackground,
          idea_description: values.ideaDescription,
          product_type: values.productType,
          industry: values.industry,
          industry_other: values.industry === 'other' ? values.industryOther : null,
          target_market: values.targetMarket,
          phase: values.phase,
          problem_validated: values.problemValidated,
          qualified_conversations: values.qualifiedConversations,
          core_target_group_defined: values.coreTargetGroupDefined,
          prototype_validated: values.prototypeValidated,
          mvp_tested: values.mvpTested,
        },
      );

      // Store user data
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...result.auth.user,
          profile: result.profile,
        }),
      );

      navigate('/dashboard');
    } catch (err) {
      const error = err as Error;
      console.error('Registration error:', error);
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step, errors, touched, setFieldValue, values) => {
    switch (step) {
      case 0: // Core Info
        return (
          <>
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="email"
              label="Email"
              error={touched.email && errors.email}
              helperText={touched.email && errors.email}
            />
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="password"
              label="Password"
              type="password"
              error={touched.password && errors.password}
              helperText={touched.password && errors.password}
            />
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="firstName"
              label="First Name"
              error={touched.firstName && errors.firstName}
              helperText={touched.firstName && errors.firstName}
            />
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="lastName"
              label="Last Name"
              error={touched.lastName && errors.lastName}
              helperText={touched.lastName && errors.lastName}
            />
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="startupName"
              label="Startup Name"
              error={touched.startupName && errors.startupName}
              helperText={touched.startupName && errors.startupName}
            />
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="startDate"
              label="Start Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              error={touched.startDate && errors.startDate}
              helperText={touched.startDate && errors.startDate}
            />
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="coFoundersCount"
              label="Number of Co-Founders"
              type="number"
              InputProps={{
                endAdornment: (
                  <>
                    <IconButton
                      onClick={() =>
                        setFieldValue(
                          'coFoundersCount',
                          Math.max(0, Number(values.coFoundersCount) - 1),
                        )
                      }
                    >
                      <Remove />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        setFieldValue('coFoundersCount', Number(values.coFoundersCount) + 1)
                      }
                    >
                      <Add />
                    </IconButton>
                  </>
                ),
              }}
              error={touched.coFoundersCount && errors.coFoundersCount}
              helperText={touched.coFoundersCount && errors.coFoundersCount}
            />
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="coFoundersBackground"
              label="Co-Founders Background"
              multiline
              rows={3}
              error={touched.coFoundersBackground && errors.coFoundersBackground}
              helperText={touched.coFoundersBackground && errors.coFoundersBackground}
            />
          </>
        );
      case 1: // Idea Description
        return (
          <Field
            as={TextField}
            fullWidth
            margin="normal"
            name="ideaDescription"
            label="Describe your idea (max 200 characters)"
            multiline
            rows={4}
            error={touched.ideaDescription && errors.ideaDescription}
            helperText={touched.ideaDescription && errors.ideaDescription}
          />
        );
      case 2: // Product Type
        return (
          <Field
            as={TextField}
            select
            fullWidth
            margin="normal"
            name="productType"
            label="Product Type"
            error={touched.productType && errors.productType}
            helperText={touched.productType && errors.productType}
          >
            <MenuItem value="product">Product</MenuItem>
            <MenuItem value="service">Service</MenuItem>
            <MenuItem value="platform">Platform</MenuItem>
          </Field>
        );
      case 3: // Industry
        return (
          <Field
            as={TextField}
            select
            fullWidth
            margin="normal"
            name="industry"
            label="Industry"
            error={touched.industry && errors.industry}
            helperText={touched.industry && errors.industry}
          >
            {/* Add your industry options here */}
            <MenuItem value="tech">Technology</MenuItem>
            <MenuItem value="health">Healthcare</MenuItem>
            <MenuItem value="finance">Finance</MenuItem>
            <MenuItem value="education">Education</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Field>
        );
      case 4: // Target Market
        return (
          <Field
            as={TextField}
            select
            fullWidth
            margin="normal"
            name="targetMarket"
            label="Target Market"
            error={touched.targetMarket && errors.targetMarket}
            helperText={touched.targetMarket && errors.targetMarket}
          >
            <MenuItem value="B2B">B2B</MenuItem>
            <MenuItem value="B2C">B2C</MenuItem>
          </Field>
        );
      case 5: // Phase
        return (
          <Field
            as={TextField}
            select
            fullWidth
            margin="normal"
            name="phase"
            label="Current Phase"
            error={touched.phase && errors.phase}
            helperText={touched.phase && errors.phase}
          >
            <MenuItem value="Start">Start</MenuItem>
            <MenuItem value="Discovery">Discovery</MenuItem>
            <MenuItem value="Transform">Transform</MenuItem>
            <MenuItem value="Create">Create</MenuItem>
            <MenuItem value="Implement">Implement</MenuItem>
          </Field>
        );
      case 6: // Problem Validation
        return (
          <>
            <FormControlLabel
              control={<Field as={Checkbox} name="problemValidated" color="primary" />}
              label="Problem Validated"
            />
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="qualifiedConversations"
              label="Number of Qualified Conversations"
              type="number"
              error={touched.qualifiedConversations && errors.qualifiedConversations}
              helperText={touched.qualifiedConversations && errors.qualifiedConversations}
            />
            <FormControlLabel
              control={<Field as={Checkbox} name="coreTargetGroupDefined" color="primary" />}
              label="Core Target Group Defined"
            />
          </>
        );
      case 7: // Prototype Validation
        return (
          <FormControlLabel
            control={<Field as={Checkbox} name="prototypeValidated" color="primary" />}
            label="Prototype Validated"
          />
        );
      case 8: // MVP Testing
        return (
          <FormControlLabel
            control={<Field as={Checkbox} name="mvpTested" color="primary" />}
            label="MVP Successfully Tested"
          />
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <>
      <Meta title="Register" />
      <FullSizeCenteredFlexBox sx={{ alignItems: 'start' }}>
        <Box sx={{ width: '100%', maxWidth: 600, p: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Sign Up
          </Typography>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{''}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Formik
            initialValues={{
              email: '',
              firstName: '',
              lastName: '',
              startupName: '',
              startDate: '',
              coFoundersCount: 0,
              coFoundersBackground: '',
              ideaDescription: '',
              productType: '',
              industry: '',
              targetMarket: '',
              phase: '',
              problemValidated: false,
              qualifiedConversations: 0,
              coreTargetGroupDefined: false,
              prototypeValidated: false,
              mvpTested: false,
            }}
            validationSchema={stepValidationSchemas[activeStep]}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isValid, setFieldValue, values, validateForm }) => (
              <Form>
                {renderStepContent(activeStep, errors, touched, setFieldValue, values)}
                <Box mt={2} display="flex" justifyContent="space-between">
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ color: 'primary.main' }}
                  >
                    BACK
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={!isValid}
                    type={activeStep === steps.length - 1 ? 'submit' : 'button'}
                    onClick={async () => {
                      const stepErrors = await validateForm();
                      const stepFields = Object.keys(stepValidationSchemas[activeStep].fields);
                      const hasStepErrors = stepFields.some((field) => stepErrors[field]);
                      if (!hasStepErrors) {
                        handleNext();
                      }
                    }}
                  >
                    {activeStep === steps.length - 1 ? 'SUBMIT' : 'NEXT'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default Register;
