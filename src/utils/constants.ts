import entrepreneurIcon from '/icon-entrepreneur.png';
import teamIcon from '/icon-team.png';
import stakeholdersIcon from '/icon-stakeholders.png';
import productIcon from '/icon-product.png';
import sustainabilityIcon from '/icon-sustainability.png';

export enum CategoryEnum {
  entrepreneur = 'entrepreneur',
  team = 'team',
  stakeholders = 'stakeholders',
  product = 'product',
  sustainability = 'sustainability',
}

export enum PhaseEnum {
  start = 'start',
  discover_explore = 'discover_explore',
  transform = 'transform',
  create = 'create',
  implement = 'implement',
}

export const categoryDisplayNames: Record<CategoryEnum, string> = {
  entrepreneur: 'Entrepreneur',
  team: 'Team',
  stakeholders: 'Stakeholders',
  product: 'Product',
  sustainability: 'Sustainability',
};

export const categoryColors: Record<CategoryEnum, string> = {
  entrepreneur: '#385da9',
  team: '#944191',
  stakeholders: '#ea5418',
  product: '#fbcd00',
  sustainability: '#8ec13d',
};

export const categoryIcons: Record<CategoryEnum, string> = {
  entrepreneur: entrepreneurIcon,
  team: teamIcon,
  stakeholders: stakeholdersIcon,
  product: productIcon,
  sustainability: sustainabilityIcon,
};

export const phaseNumbers: Record<PhaseEnum, number> = {
  start: 1,
  discover_explore: 2,
  transform: 3,
  create: 4,
  implement: 5,
};

export const phaseDisplayNames: { [key: string]: string } = {
  start: '(Re)Start',
  discover_explore: 'Discover & Explore',
  transform: 'Transform',
  create: 'Create',
  implement: 'Implement',
};
