import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button, Snackbar, Alert } from '@mui/material';

function PWAUpdater() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swUrl, r) {
      console.log('Service Worker registered:', swUrl);
      if (r) {
        // Check for updates immediately on registration
        r.update();
        // Check for updates every 5 minutes
        setInterval(() => {
          console.log('Checking for SW updates...');
          r.update();
        }, 5 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });

  const handleClose = () => {
    setNeedRefresh(false);
  };

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  return (
    <Snackbar
      open={needRefresh}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      onClose={handleClose}
    >
      <Alert
        severity="info"
        action={
          <>
            <Button color="inherit" size="small" onClick={handleUpdate}>
              Update
            </Button>
            <Button color="inherit" size="small" onClick={handleClose}>
              Later
            </Button>
          </>
        }
      >
        A new version is available!
      </Alert>
    </Snackbar>
  );
}

export default PWAUpdater;