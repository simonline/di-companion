import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function PrivacyPolicy() {
  const navigate = useNavigate();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to settings page if no history
      navigate('/settings');
    }
  };

  return (
    <>
      <Header title="Privacy Policy" />
      
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Back
        </Button>

        <Paper elevation={1} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Privacy Policy
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              1. Information We Collect
            </Typography>
            <Typography variant="body1" paragraph>
              We collect information you provide directly to us, such as when you create an account, 
              update your profile, participate in surveys, or communicate with us. This information may include:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Name and contact information (email address, phone number)</li>
              <li>Profile information (bio, position, LinkedIn profile)</li>
              <li>Startup information (name, description, team members)</li>
              <li>Survey responses and assessment data</li>
              <li>Communication preferences</li>
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              2. How We Use Your Information
            </Typography>
            <Typography variant="body1" paragraph>
              We use the information we collect to:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Provide, maintain, and improve our services</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices and support messages</li>
              <li>Provide personalized recommendations and coaching</li>
              <li>Respond to your comments and questions</li>
              <li>Analyze usage patterns to improve user experience</li>
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              3. Information Sharing
            </Typography>
            <Typography variant="body1" paragraph>
              We do not sell, trade, or otherwise transfer your personal information to third parties. 
              We may share your information only in the following circumstances:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>With your consent or at your direction</li>
              <li>With team members you invite to your startup</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              4. Data Security
            </Typography>
            <Typography variant="body1" paragraph>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, 
              no internet transmission is ever fully secure or error-free.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              5. Your Rights
            </Typography>
            <Typography variant="body1" paragraph>
              You have the right to:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to our use of your personal information</li>
              <li>Export your data in a portable format</li>
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              6. Cookies and Tracking
            </Typography>
            <Typography variant="body1" paragraph>
              We use cookies and similar tracking technologies to track activity on our service and 
              hold certain information. You can instruct your browser to refuse all cookies or to 
              indicate when a cookie is being sent.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              7. Children's Privacy
            </Typography>
            <Typography variant="body1" paragraph>
              Our service is not intended for individuals under the age of 16. We do not knowingly 
              collect personal information from children under 16.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              8. Changes to This Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update our Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              9. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions about this Privacy Policy, please contact us at:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Email: privacy@di-companion.com</li>
              <li>Address: Dynamic Innovation GmbH, Innovation Street 1, 12345 Berlin, Germany</li>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default PrivacyPolicy;