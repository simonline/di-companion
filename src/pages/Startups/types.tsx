import { Field } from 'formik';
import * as Yup from 'yup';
import {
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

export const steps = [
  'Startup Info',
  'Idea Description',
  'Product Type',
  'Industry',
  'Target Market',
  'Phase',
  'Problem Validation',
  'Prototype Validation',
  'MVP Testing',
];

export interface StartupFormValues {
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

export const stepValidationSchemas = [
  // Step 0: Startup Info
  Yup.object().shape({
    name: Yup.string().required('Required'),
    startDate: Yup.date().required('Required'),
    foundersCount: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
    background: Yup.string().required('Required'),
  }),

  // Step 1: Idea Description
  Yup.object().shape({
    idea: Yup.string().max(200, 'Must be 200 characters or less').required('Required'),
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
      .oneOf(['b2b', 'b2c'], 'Must be either B2B or B2C')
      .required('Required'),
  }),

  // Step 5: Phase
  Yup.object().shape({
    phase: Yup.string()
      .oneOf(['start', 'discovery', 'transform', 'create', 'implement'], 'Invalid phase')
      .required('Required'),
  }),

  // Step 6: Problem Validation
  Yup.object().shape({
    isProblemValidated: Yup.boolean().required('Required'),
    qualifiedConversationsCount: Yup.number().min(0, 'Must be 0 or greater').required('Required'),
    isTargetGroupDefined: Yup.boolean().required('Required'),
  }),

  // Step 7: Prototype Validation
  Yup.object().shape({
    isPrototypeValidated: Yup.boolean().required('Required'),
  }),

  // Step 8: MVP Testing
  Yup.object().shape({
    isMvpTested: Yup.boolean().required('Required'),
  }),
];

export const renderStepContent = (step, errors, touched, setFieldValue, values) => {
  switch (step) {
    case 0: // Startup Info
      return (
        <>
          <Field
            as={TextField}
            fullWidth
            margin="normal"
            name="name"
            label="Startup Name"
            error={touched.name && errors.name}
            helperText={touched.name && errors.name}
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
            name="foundersCount"
            label="Number of Founders"
            type="number"
            InputProps={{
              endAdornment: (
                <>
                  <IconButton
                    onClick={() =>
                      setFieldValue('foundersCount', Math.max(0, Number(values.foundersCount) - 1))
                    }
                  >
                    <Remove />
                  </IconButton>
                  <IconButton
                    onClick={() => setFieldValue('foundersCount', Number(values.foundersCount) + 1)}
                  >
                    <Add />
                  </IconButton>
                </>
              ),
            }}
            error={touched.foundersCount && errors.foundersCount}
            helperText={touched.foundersCount && errors.foundersCount}
          />
          <Field
            as={TextField}
            fullWidth
            margin="normal"
            name="background"
            label="Founders Background"
            multiline
            rows={3}
            error={touched.background && errors.background}
            helperText={touched.background && errors.background}
          />
        </>
      );
    case 1: // Idea Description
      return (
        <Field
          as={TextField}
          fullWidth
          margin="normal"
          name="idea"
          label="Describe your idea (max 200 characters)"
          multiline
          rows={4}
          error={touched.idea && errors.idea}
          helperText={touched.idea && errors.idea}
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
          <MenuItem value="b2b">B2B</MenuItem>
          <MenuItem value="b2c">B2C</MenuItem>
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
          <MenuItem value="start">Start</MenuItem>
          <MenuItem value="discovery">Discovery</MenuItem>
          <MenuItem value="transform">Transform</MenuItem>
          <MenuItem value="create">Create</MenuItem>
          <MenuItem value="implement">Implement</MenuItem>
        </Field>
      );
    case 6: // Problem Validation
      return (
        <>
          <FormControlLabel
            control={<Field as={Checkbox} name="isProblemValidated" color="primary" />}
            label="Problem Validated"
          />
          <Field
            as={TextField}
            fullWidth
            margin="normal"
            name="qualifiedConversationsCount"
            label="Number of Qualified Conversations"
            type="number"
            error={touched.qualifiedConversationsCount && errors.qualifiedConversationsCount}
            helperText={touched.qualifiedConversationsCount && errors.qualifiedConversationsCount}
          />
          <FormControlLabel
            control={<Field as={Checkbox} name="isTargetGroupDefined" color="primary" />}
            label="Core Target Group Defined"
          />
        </>
      );
    case 7: // Prototype Validation
      return (
        <FormControlLabel
          control={<Field as={Checkbox} name="isPrototypeValidated" color="primary" />}
          label="Prototype Validated"
        />
      );
    case 8: // MVP Testing
      return (
        <FormControlLabel
          control={<Field as={Checkbox} name="isMvpTested" color="primary" />}
          label="MVP Successfully Tested"
        />
      );
    default:
      return <Typography>Unknown step</Typography>;
  }
};
