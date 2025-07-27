import type { Theme } from '@mui/material';

function getPageHeight(theme: Theme, withHeader: boolean = false) {
  const topSpacing = Number(theme.mixins.toolbar.minHeight) + parseInt(theme.spacing(1));

  const bottomSpacing = parseInt(
    // @ts-expect-error minHeight is not in the type definition
    theme.components?.MuiBottomNavigation?.styleOverrides?.root?.minHeight || '0',
  );
  return `calc(100vh - ${bottomSpacing}px - ${withHeader ? topSpacing : 0}px)`;
}

export { getPageHeight };
