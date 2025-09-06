import '@mui/material/styles';
import '@mui/material/Chip';
import '@mui/material/Button';

declare module '@mui/material/styles' {
  interface Palette {
    entrepreneur: Palette['primary'];
    team: Palette['primary'];
    stakeholders: Palette['primary'];
    product: Palette['primary'];
    sustainability: Palette['primary'];
    time_space: Palette['primary'];
  }

  interface PaletteOptions {
    entrepreneur?: PaletteOptions['primary'];
    team?: PaletteOptions['primary'];
    stakeholders?: PaletteOptions['primary'];
    product?: PaletteOptions['primary'];
    sustainability?: PaletteOptions['primary'];
    time_space?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    entrepreneur: true;
    team: true;
    stakeholders: true;
    product: true;
    sustainability: true;
    time_space: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    entrepreneur: true;
    team: true;
    stakeholders: true;
    product: true;
    sustainability: true;
    time_space: true;
  }
}