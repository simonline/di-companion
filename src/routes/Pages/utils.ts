import type { Theme } from '@mui/material';

function getPageHeight(theme: Theme) {
  const topSpacing = Number(theme.mixins.toolbar.minHeight) + parseInt(theme.spacing(1));
  const bottomSpacing = parseInt(
    // @ts-expect-error minHeight is not in the type definition
    theme.components?.MuiBottomNavigation?.styleOverrides?.root?.minHeight || '0',
  );
  return `calc(100vh - ${topSpacing}px - ${bottomSpacing}px)`;
}

export { getPageHeight };
