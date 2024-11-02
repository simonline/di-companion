import React from 'react';
import { ListItem, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';

interface MenuItemProps {
  label: string;
  value?: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export const MenuItem: React.FC<MenuItemProps> = ({ label, value, onClick, icon }) => (
  <ListItem disablePadding>
    <ListItemButton onClick={onClick}>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText
        primary={label}
        secondary={value}
        primaryTypographyProps={{ variant: 'subtitle1' }}
        secondaryTypographyProps={{ variant: 'body2' }}
      />
      <ChevronRight color="action" />
    </ListItemButton>
  </ListItem>
);
