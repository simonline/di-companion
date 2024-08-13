import type { Theme } from '@mui/material';

function getPageHeight(theme: Theme) {
  const topSpacing = Number(theme.mixins.toolbar.minHeight) + parseInt(theme.spacing(1));
  const bottomSpacing = parseInt(
    theme.components?.MuiBottomNavigation?.styleOverrides?.root?.minHeight,
  );
  return `calc(100vh - ${topSpacing}px - ${bottomSpacing}px)`;
}

export { getPageHeight };
