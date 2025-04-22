import { ThemeOptions } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

import { Themes } from './types';

const sharedTheme = {
  palette: {
    background: {
      default: '#fafafa',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: `'Source Sans Pro', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardWarning: {
          backgroundColor: '#07bce5', // Blue background
          color: '#ffffff', // White text
          '& .MuiAlert-icon': {
            color: '#ffffff', // White icon
          },
          '& .MuiButton-root': {
            color: '#ffffff', // White text for buttons
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        .notistack-MuiContent-warning {
          background-color: #07bce5 !important;
          color: #ffffff !important;
        }
        .notistack-MuiContent-warning .MuiButton-root {
          color: #ffffff !important;
        }
      `,
    },
    MuiDivider: {
      styleOverrides: {
        vertical: {
          marginRight: 10,
          marginLeft: 10,
        },
        // TODO: open issue for missing "horizontal" CSS rule
        // in Divider API - https://mui.com/material-ui/api/divider/#css
        middle: {
          marginTop: 10,
          marginBottom: 10,
          width: '80%',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          minHeight: '80px',
        },
      },
    },
  },
} as ThemeOptions; // the reason for this casting is deepmerge return type
// TODO (Suren): replace mui-utils-deepmerge with lodash or ramda deepmerge

const themes: Record<Themes, ThemeOptions> = {
  light: deepmerge(sharedTheme, {
    palette: {
      mode: 'light',
      background: {
        default: '#fafafa',
        paper: '#fff',
      },
      primary: {
        main: '#07bce5',
      },
    },
  }),

  dark: deepmerge(sharedTheme, {
    palette: {
      mode: 'dark',
      background: {
        default: '#111',
        paper: '#171717',
      },
      primary: {
        main: '#07bce5',
      },
    },
  }),
};

export default themes;
