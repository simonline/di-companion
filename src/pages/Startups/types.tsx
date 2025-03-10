import { Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  Typography,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import { Add, Remove, HelpOutline } from '@mui/icons-material';
import { CategoryEnum } from '@/utils/constants';

export const steps = ['About Your Startup', 'Product & Market', 'Validation & Progress'];

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
  scores?: Record<CategoryEnum, number>;
  submit?: { message: string };
}

export const stepValidationSchemas = [
  // Step 1: About Your Startup
  Yup.object().shape({
    name: Yup.string().required('Startup name is required'),
    startDate: Yup.date().required('Start date is required'),
    foundersCount: Yup.number()
      .min(0, 'Must be 0 or greater')
      .required('Number of founders is required'),
    background: Yup.string().required('Founder background information is required'),
    idea: Yup.string()
      .max(200, 'Must be 200 characters or less')
      .required('Idea description is required'),
  }),

  // Step 2: Product & Market
  Yup.object().shape({
    productType: Yup.string()
      .oneOf(['product', 'service', 'platform'], 'Please select a valid product type')
      .required('Product type is required'),
    industry: Yup.string().required('Industry is required'),
    targetMarket: Yup.string()
      .oneOf(['b2b', 'b2c'], 'Must be either B2B or B2C')
      .required('Target market is required'),
    phase: Yup.string()
      .oneOf(
        ['start', 'discovery', 'transform', 'create', 'implement'],
        'Please select a valid phase',
      )
      .required('Current phase is required'),
  }),

  // Step 3: Validation & Progress
  Yup.object().shape({
    isProblemValidated: Yup.boolean(),
    qualifiedConversationsCount: Yup.number().min(0, 'Must be 0 or greater'),
    isTargetGroupDefined: Yup.boolean(),
    isPrototypeValidated: Yup.boolean(),
    isMvpTested: Yup.boolean(),
  }),
];

const FieldWithTooltip = ({ tooltip, ...props }: { tooltip: string; [key: string]: any }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
    <Field {...props} />
    <Tooltip title={tooltip} placement="right">
      <IconButton size="small" sx={{ ml: 1 }}>
        <HelpOutline fontSize="small" />
      </IconButton>
    </Tooltip>
  </Box>
);

export const renderStepContent = (
  step: number,
  errors: Record<string, string>,
  touched: Record<string, boolean>,
  setFieldValue: FormikHelpers<Partial<StartupFormValues>>['setFieldValue'],
  values: Partial<StartupFormValues>,
) => {
  switch (step) {
    case 0: // About Your Startup
      return (
        <>
          <Typography variant="h6" gutterBottom>
            Let&apos;s get to know your startup
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Tell us about your startup and founding team. This information helps us understand your
            background and vision.
          </Typography>

          <FieldWithTooltip
            as={TextField}
            fullWidth
            margin="normal"
            name="name"
            label="Startup Name"
            error={touched.name && Boolean(errors.name)}
            helperText={touched.name && errors.name}
            tooltip="The name of your startup or project"
          />

          <FieldWithTooltip
            as={TextField}
            fullWidth
            margin="normal"
            name="startDate"
            label="When did you start working on this idea?"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            error={touched.startDate && Boolean(errors.startDate)}
            helperText={touched.startDate && errors.startDate}
            tooltip="When you first started working on this startup idea"
          />

          <FieldWithTooltip
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
            error={touched.foundersCount && Boolean(errors.foundersCount)}
            helperText={touched.foundersCount && errors.foundersCount}
            tooltip="How many co-founders are working on this startup"
          />

          <FieldWithTooltip
            as={TextField}
            fullWidth
            margin="normal"
            name="background"
            label="Tell us about your team's background"
            multiline
            rows={3}
            error={touched.background && Boolean(errors.background)}
            helperText={touched.background && errors.background}
            tooltip="Brief description of the founders' experience and expertise"
          />

          <FieldWithTooltip
            as={TextField}
            fullWidth
            margin="normal"
            name="idea"
            label="Describe your startup idea in a few sentences"
            multiline
            rows={4}
            error={touched.idea && Boolean(errors.idea)}
            helperText={touched.idea && errors.idea}
            tooltip="A concise description of your startup idea (max 200 characters)"
          />
        </>
      );

    case 1: // Product & Market
      return (
        <>
          <Typography variant="h6" gutterBottom>
            Product and Market Details
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Help us understand what you&apos;re building and who you&apos;re building it for.
          </Typography>

          <FieldWithTooltip
            as={TextField}
            select
            fullWidth
            margin="normal"
            name="productType"
            label="What are you building?"
            error={touched.productType && Boolean(errors.productType)}
            helperText={touched.productType && errors.productType}
            tooltip="Select the type that best describes what you're building"
          >
            <MenuItem value="product">Physical Product</MenuItem>
            <MenuItem value="service">Service</MenuItem>
            <MenuItem value="platform">Software Platform</MenuItem>
          </FieldWithTooltip>

          <FieldWithTooltip
            as={TextField}
            select
            fullWidth
            margin="normal"
            name="industry"
            label="Which industry are you in?"
            error={touched.industry && Boolean(errors.industry)}
            helperText={touched.industry && errors.industry}
            tooltip="The primary industry your startup operates in"
          >
            <MenuItem value="tech">Technology</MenuItem>
            <MenuItem value="health">Healthcare</MenuItem>
            <MenuItem value="finance">Finance</MenuItem>
            <MenuItem value="education">Education</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </FieldWithTooltip>

          {values.industry === 'other' && (
            <Field
              as={TextField}
              fullWidth
              margin="normal"
              name="industryOther"
              label="Please specify your industry"
              error={touched.industryOther && Boolean(errors.industryOther)}
              helperText={touched.industryOther && errors.industryOther}
            />
          )}

          <FieldWithTooltip
            as={TextField}
            select
            fullWidth
            margin="normal"
            name="targetMarket"
            label="Who are your customers?"
            error={touched.targetMarket && Boolean(errors.targetMarket)}
            helperText={touched.targetMarket && errors.targetMarket}
            tooltip="Are you selling to businesses (B2B) or consumers (B2C)?"
          >
            <MenuItem value="b2b">Business to Business (B2B)</MenuItem>
            <MenuItem value="b2c">Business to Consumer (B2C)</MenuItem>
          </FieldWithTooltip>

          <FieldWithTooltip
            as={TextField}
            select
            fullWidth
            margin="normal"
            name="phase"
            label="What phase is your startup in?"
            error={touched.phase && Boolean(errors.phase)}
            helperText={touched.phase && errors.phase}
            tooltip="The current development stage of your startup"
          >
            <MenuItem value="start">Just Starting (Idea Phase)</MenuItem>
            <MenuItem value="discovery">Discovery & Research</MenuItem>
            <MenuItem value="transform">Transforming Idea to Product</MenuItem>
            <MenuItem value="create">Creating MVP</MenuItem>
            <MenuItem value="implement">Implementing & Scaling</MenuItem>
          </FieldWithTooltip>
        </>
      );

    case 2: // Validation & Progress
      return (
        <>
          <Typography variant="h6" gutterBottom>
            Validation & Progress
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Tell us about your progress in validating your idea and building your product.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Problem Validation
            </Typography>

            <FormControlLabel
              control={
                <Field
                  as={Checkbox}
                  name="isProblemValidated"
                  checked={values.isProblemValidated}
                />
              }
              label="Have you validated that your target market has the problem you're solving?"
            />

            <FieldWithTooltip
              as={TextField}
              fullWidth
              margin="normal"
              name="qualifiedConversationsCount"
              label="How many customer interviews have you conducted?"
              type="number"
              error={
                touched.qualifiedConversationsCount && Boolean(errors.qualifiedConversationsCount)
              }
              helperText={touched.qualifiedConversationsCount && errors.qualifiedConversationsCount}
              tooltip="Number of in-depth conversations with potential customers"
            />

            <FormControlLabel
              control={
                <Field
                  as={Checkbox}
                  name="isTargetGroupDefined"
                  checked={values.isTargetGroupDefined}
                />
              }
              label="Have you clearly defined your target customer segment?"
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Product Development
            </Typography>

            <FormControlLabel
              control={
                <Field
                  as={Checkbox}
                  name="isPrototypeValidated"
                  checked={values.isPrototypeValidated}
                />
              }
              label="Have you created and tested a prototype with potential users?"
            />

            <FormControlLabel
              control={<Field as={Checkbox} name="isMvpTested" checked={values.isMvpTested} />}
              label="Have you built and tested a Minimum Viable Product (MVP)?"
            />
          </Box>
        </>
      );
    default:
      return null;
  }
};
