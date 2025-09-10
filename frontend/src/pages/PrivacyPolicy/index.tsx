import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from '@/sections/Header';
import ArrowBack from '@mui/icons-material/ArrowBack';

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
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ color: 'text.secondary' }}
        >
          Back
        </Button>

        <Paper elevation={1} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            PRIVACY POLICY
          </Typography>
          <Typography variant="h5" gutterBottom>
            AI COMPANION
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            Last updated: 11 September 2025
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" paragraph>
              We, the SCE – Strascheg Center for Entrepreneurship, Heßstraße 89, 80797 Munich, Germany, as the operator of the Startup App (hereinafter "we", "SCE", "us" or "our"), provide you with this privacy information on data processing for users of the Startup App in order to give you an overview of our procedures regarding the collection, storage, use, disclosure or deletion (collectively "processing" or "process") of any kind of information about you (e.g., name, address, etc.) (collectively "personal data") in connection with the use of the Startup App.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              I. Overview
            </Typography>
            <Typography variant="body1" paragraph>
              We process your personal data solely to provide our startup advisory app. The app is hosted on servers of Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, Germany.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              II. Categories of Personal Data
            </Typography>
            <Typography variant="body1" paragraph>
              We process the following personal data about you:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>First name, last name, email address, phone number ("registration and basic data");</li>
              <li>Self-reflection details, ratings and assessments, selected top 7 values ("personality profile data");</li>
              <li>Profile and values information, team affiliation, interactions within the team ("collaboration data");</li>
              <li>Pitch decks, business documents, upload time, file size ("business data");</li>
              <li>Anonymized usage data, in-app interactions, device type, operating system ("analytics data").</li>
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              III. Purpose of Processing
            </Typography>
            <Typography variant="body1" paragraph>
              We process your personal data for the following purposes:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Registration and use of the Startup App ("registration purposes");</li>
              <li>Creation of the personality profile and values analysis (together the "analysis purposes");</li>
              <li>Collaboration between app users of a startup team, analysis of profiles for team members, analysis of team dynamics ("collaboration purposes");</li>
              <li>Analysis of and feedback on business concepts ("feedback purposes");</li>
              <li>Improving app functionality, troubleshooting ("usage analytics purposes").</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Use of Artificial Intelligence
            </Typography>
            <Typography variant="body1" paragraph>
              We may use artificial intelligence (AI) to support the processing of personal data for the purposes stated in this privacy policy. All such AI technologies are rigorously assessed beforehand to ensure they meet applicable ethical, legal, and contractual requirements, including data protection and information security. We have adopted appropriate policies and training governing the responsible use of AI technology to ensure that personal data remains adequately protected. The use of AI technology to make decisions that affect individuals solely by automated means is strictly prohibited.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              IV. Legal Basis for Processing Your Personal Data
            </Typography>
            <Typography variant="body1" paragraph>
              Processing your data is required for the use of the Startup App. Specifically, we rely on the following legal bases:
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              PROCESSED DATA
            </Typography>

            <Box sx={{ overflowX: 'auto', mt: 2, mb: 3 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Processing purpose</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Data categories</th>
                    <th style={{ textAlign: 'left', padding: '12px' }}>Legal basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>Registration purposes</td>
                    <td style={{ padding: '12px' }}>• First name • Last name • Email address • Phone number</td>
                    <td style={{ padding: '12px' }}>• Consent, Art. 6(1)(a) GDPR</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>Analysis purposes</td>
                    <td style={{ padding: '12px' }}>• Self-reflection details • Selected top 7 values • Ratings • Assessments</td>
                    <td style={{ padding: '12px' }}>• Explicit consent, Art. 9(2)(a) GDPR</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>Collaboration purposes</td>
                    <td style={{ padding: '12px' }}>• Profile • Values information • Team affiliation • Interactions within the team</td>
                    <td style={{ padding: '12px' }}>• Consent, Art. 6(1)(a) GDPR</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>Feedback purposes</td>
                    <td style={{ padding: '12px' }}>• Pitch decks, team contract, interviews (anonymized) • Business documents (e.g., business plan, financial plan, go-to-market plan, and others) • Metadata (upload time, file size)</td>
                    <td style={{ padding: '12px' }}>• Contract performance, consent, Art. 6(1)(b) GDPR</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>Usage analytics purposes</td>
                    <td style={{ padding: '12px' }}>• Anonymized usage data • App interactions • Technical information (device type, operating system)</td>
                    <td style={{ padding: '12px' }}>• Consent, Art. 6(1)(a) GDPR</td>
                  </tr>
                </tbody>
              </table>
            </Box>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              V. Data Transfers and Recipients
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              1. Recipients
            </Typography>
            <Typography variant="body1" paragraph>
              We transmit your personal data to other team members of your startup, provided you have given your consent.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              2. Cross-border Data Transfers
            </Typography>
            <Typography variant="body1" paragraph>
              We transmit anonymized usage data for usage analysis to Amplitude Inc., 201 3rd Street, Suite 200, San Francisco, USA. The USA is a country for which the European Commission has not yet adopted an adequacy decision confirming an adequate level of data protection.
            </Typography>
            <Typography variant="body1" paragraph>
              By concluding appropriate data transfer agreements based on the standard contractual clauses referred to in Art. 46(2)(c) GDPR (2010/87/EU and/or 2004/915/EC), or other appropriate measures available via the contact details set out above, we have established that we will ensure an adequate level of protection for personal data and that appropriate technical and organizational security measures are in place to protect personal data against accidental or unlawful destruction, accidental loss or alteration, unauthorized disclosure or access, and against all other unlawful forms of processing.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              VI. Retention Periods and Deletion of Your Personal Data
            </Typography>
            <Typography variant="body1" paragraph>
              Personal data processed for the purposes set out herein will be stored only until you withdraw your consent or delete your account yourself.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              VII. Cookies
            </Typography>
            <Typography variant="body1" paragraph>
              We use, and engage certain providers to use, cookies, web beacons and similar tracking technologies (collectively "cookies") on our websites.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              1. What are cookies?
            </Typography>
            <Typography variant="body1" paragraph>
              Cookies are small amounts of data stored on your browser, device, or the page you visit. Some cookies are deleted once you close your browser, while others are retained after you close it so you can be recognized when you return to a website. For more information about cookies and how they work, see "All About Cookies."
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              2. How do we use cookies?
            </Typography>
            <Typography variant="body1" paragraph>
              We use cookies, and allow certain third parties to place cookies on our websites, to provide the websites and services, to collect information about your usage patterns as you navigate the websites to enhance your personalized experience, and to understand usage patterns so we can improve our websites, products, and services. You can also view our cookie list.
            </Typography>
            <Typography variant="body1" paragraph>
              Cookies on our websites are generally grouped into the following categories:
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li><strong>Strictly necessary cookies:</strong> These cookies are required for the website to function and cannot be switched off in our systems. They are usually set only in response to actions you take that constitute a request for services, such as setting your privacy preferences, logging in, or filling in forms. You can set your browser to block or alert you about these cookies, but some parts of the site will then not work. These cookies do not store any personal data.</li>
              <li><strong>Functional cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. If you do not allow these cookies, some or all of these services may not function properly.</li>
              <li><strong>Performance cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our website. They help us understand which pages are most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies, we will not know when you have visited our website and will not be able to monitor its performance.</li>
              <li><strong>Targeting cookies:</strong> These cookies may be set through our website by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other websites. They do not store personal data directly but are based on uniquely identifying your browser and internet device. If you do not allow these cookies, you will experience less targeted advertising.</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              3. What options do you have if you do not want cookies on your computer?
            </Typography>
            <Typography variant="body1" paragraph>
              When you visit our websites for the first time, you will be asked for your consent to the use of cookies that are not classified as strictly necessary. You can manage your choices using the provided consent management tool. If you change your mind, you can adjust your settings at any time via the "Manage Cookies" link in the footer of our websites.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              VIII. Your Legal Rights
            </Typography>
            <Typography variant="body1" paragraph>
              Under the conditions set out by applicable law (i.e., the GDPR), you have the following rights:
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>1. Right of access:</strong> You have the right to request information about whether personal data concerning you is being processed; if so, you have the right to request access to that personal data. Information you may request includes, among others, the purposes of processing, the categories of personal data concerned, and the recipients or categories of recipients to whom the personal data has been or will be disclosed.
            </Typography>
            <Typography variant="body1" paragraph sx={{ pl: 3 }}>
              You also have the right to receive a copy of the personal data undergoing processing. For any further copies requested, we may charge a reasonable fee based on administrative costs.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>2. Right to rectification:</strong> You have the right to obtain from us without undue delay the correction of inaccurate personal data concerning you. Taking into account the purposes of processing, you have the right to have incomplete personal data completed, including by means of providing a supplementary statement.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>3. Right to erasure ("right to be forgotten"):</strong> You have the right to obtain from us the deletion of your personal data.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>4. Right to restriction of processing:</strong> You have the right to request the restriction of processing your personal data. In this case, the relevant data will be marked and may only be processed by us for certain purposes.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>5. Right to data portability:</strong> You have the right to receive the personal data concerning you, which you have provided to us, in a structured, commonly used, and machine-readable format, and you have the right to transmit that data to another entity without hindrance from us.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>6. Right to object:</strong> You have the right to object at any time, on grounds relating to your particular situation, to the processing of your personal data by us, and we may be required to stop processing your personal data. If you exercise your right to object, we will no longer process your personal data for these purposes. The exercise of this right will not incur any costs.
            </Typography>

            <Typography variant="body1" paragraph>
              <strong>7. Withdrawal of consent:</strong>
            </Typography>
            <Typography variant="body1" paragraph sx={{ pl: 3 }}>
              If you have given consent to the processing of your personal data, you have the right to withdraw that consent at any time free of charge.
            </Typography>

            <Typography variant="body1" paragraph>
              In case of complaints, you also have the right to lodge a complaint with the competent supervisory authority, in particular in the Member State of your habitual residence or the alleged violation of the GDPR.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              IX. Data Security
            </Typography>
            <Typography variant="body1" paragraph>
              We have implemented technical and organizational measures to protect the personal data in our custody and control. These measures include:
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              1. Technical measures
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>SSL/TLS encryption of all data transmissions</li>
              <li>Encrypted database storage of sensitive data</li>
              <li>Regular security updates</li>
              <li>Daily encrypted backups</li>
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              2. Organizational measures
            </Typography>
            <Typography variant="body1" component="ul" sx={{ pl: 4 }}>
              <li>Restricting access to personal data to employees and service providers on a "need-to-know" basis</li>
              <li>Regular data protection training</li>
              <li>Incident response procedures</li>
              <li>Regular security audits</li>
            </Typography>

            <Typography variant="body1" paragraph>
              While we strive to always protect our systems, websites, processes, and information from unauthorized access, use, alteration, and disclosure, due to the inherent nature of the internet as an open global communication vehicle and other risk factors, we cannot guarantee that any information transmitted or stored on our systems will be absolutely safe from intrusion by others.
            </Typography>

            <Typography variant="body1" paragraph>
              You also play an important role in protecting personal data. You should not share any username, password, or other authentication data provided to you with anyone, and we recommend that you do not reuse passwords across more than one website or application. If you believe your username or password has been compromised, please contact us as described below.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              X. Changes to this Privacy Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We reserve the right to update this privacy policy as necessary. The current version is always available at this link. In case of significant changes, we will notify you by email.
            </Typography>

            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              XI. Contact
            </Typography>
            <Typography variant="body1" paragraph>
              If you wish to exercise your rights as a data subject or have any other questions regarding this information, please contact our Data Protection Officer, Madeleine Shinada, at: <strong>datenschutz@sce.de</strong>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default PrivacyPolicy;