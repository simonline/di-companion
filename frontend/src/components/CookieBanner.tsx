import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const CookieBanner: React.FC = () => {
  const theme = useTheme();

  const handleAcceptCookies = () => {
    // Enable analytics and other cookies
    if (window.amplitude) {
      window.amplitude.track('Cookie Consent Accepted');
    }
  };

  const handleDeclineCookies = () => {
    // Disable analytics and other non-essential cookies
    if (window.amplitude) {
      window.amplitude.track('Cookie Consent Declined');
      // Optionally disable tracking
      window.amplitude.setOptOut(true);
    }
  };

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept"
      declineButtonText="Decline"
      cookieName="di-companion-cookie-consent"
      onAccept={handleAcceptCookies}
      onDecline={handleDeclineCookies}
      enableDeclineButton
      flipButtons
      style={{
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        padding: '16px',
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        borderTop: `1px solid ${theme.palette.divider}`,
        zIndex: 1100,
      }}
      buttonStyle={{
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontSize: '16px',
        padding: '10px 20px',
        borderRadius: theme.shape.borderRadius,
        fontWeight: 500,
        marginLeft: '12px',
        cursor: 'pointer',
        border: 'none',
        fontFamily: theme.typography.fontFamily,
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: theme.palette.text.secondary,
        fontSize: '16px',
        padding: '10px 20px',
        borderRadius: theme.shape.borderRadius,
        fontWeight: 500,
        marginLeft: '12px',
        cursor: 'pointer',
        border: `1px solid ${theme.palette.divider}`,
        fontFamily: theme.typography.fontFamily,
      }}
      expires={365}
      overlay={false}
      disableStyles={false}
    >
      <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
        We use cookies to improve your experience. See our{' '}
        <Link to="/privacy-policy" style={{ color: theme.palette.primary.main, marginLeft: '4px' }}>
          Privacy Policy
        </Link>
      </span>
    </CookieConsent>
  );
};

export default CookieBanner;