import { useState } from 'react';
import { Form, Formik, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, Box, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import Meta from '@/components/Meta';
import { useNavigate } from 'react-router-dom';
import { CenteredFlexBox } from '@/components/styled';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/sections/Header';

interface RegisterFormValues {
  email: string;
  password: string;
  givenName: string;
  familyName: string;
  startupId?: string;
  createNewStartup: boolean;
  submit?: string;
}

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(8, 'Must be at least 8 characters').required('Required'),
  givenName: Yup.string().required('Required'),
  familyName: Yup.string().required('Required'),
  startupId: Yup.string().when('createNewStartup', {
    is: false,
    then: (schema) => schema.required('Please select a startup'),
    otherwise: (schema) => schema.optional(),
  }),
  createNewStartup: Yup.boolean(),
});

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [existingStartups] = useState([
    { id: '1', name: 'Startup 1' },
    { id: '2', name: 'Startup 2' },
    // In real application, fetch this from API
  ]);

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting, setErrors }: FormikHelpers<RegisterFormValues>,
  ): Promise<void> => {
    try {
      const result = await register({
        username: values.email,
        email: values.email,
        password: values.password,
        givenName: values.givenName,
        familyName: values.familyName,
      });

      // Store user data
      localStorage.setItem('user', JSON.stringify(result));

      // Navigate based on user selection
      if (values.createNewStartup) {
        navigate('/create-startup');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const error = err as Error;
      console.error('Registration error:', error);
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Meta title="Register" />
      <Header title="Register" />
      <CenteredFlexBox>
        <Box sx={{ width: '100%', maxWidth: 400, p: 2 }}>
          <Formik
            initialValues={{
              email: '',
              password: '',
              givenName: '',
              familyName: '',
              startupId: '',
              createNewStartup: false,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, values, setFieldValue }) => (
              <Form>
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
                  name="givenName"
                  label="First Name"
                  error={touched.givenName && errors.givenName}
                  helperText={touched.givenName && errors.givenName}
                />
                <Field
                  as={TextField}
                  fullWidth
                  margin="normal"
                  name="familyName"
                  label="Last Name"
                  error={touched.familyName && errors.familyName}
                  helperText={touched.familyName && errors.familyName}
                />

                <FormControlLabel
                  control={
                    <Field
                      as={Checkbox}
                      name="createNewStartup"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFieldValue('createNewStartup', e.target.checked);
                        if (e.target.checked) {
                          setFieldValue('startupId', '');
                        }
                      }}
                    />
                  }
                  label="Create new startup"
                />

                {!values.createNewStartup ? (
                  <Field
                    as={TextField}
                    select
                    fullWidth
                    margin="normal"
                    name="startupId"
                    label="Select Startup"
                    error={touched.startupId && errors.startupId}
                    helperText={touched.startupId && errors.startupId}
                  >
                    {existingStartups.map((startup) => (
                      <MenuItem key={startup.id} value={startup.id}>
                        {startup.name}
                      </MenuItem>
                    ))}
                  </Field>
                ) : null}

                <Box mt={2}>
                  <Button fullWidth variant="contained" color="primary" type="submit">
                    Sign Up
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </Box>
      </CenteredFlexBox>
    </>
  );
}

export default Register;
