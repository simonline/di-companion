import timeSpaceIcon from '/icon-time-space.svg';
import entrepreneurIcon from '/icon-entrepreneur.svg';
import teamIcon from '/icon-team.svg';
import stakeholdersIcon from '/icon-stakeholders.svg';
import productIcon from '/icon-product.svg';
import sustainabilityIcon from '/icon-sustainability.svg';

export enum CategoryEnum {
  entrepreneur = 'entrepreneur',
  team = 'team',
  stakeholders = 'stakeholders',
  product = 'product',
  sustainability = 'sustainability',
  time_space = 'time_space',
}

export enum PhaseEnum {
  start = 'start',
  discover_explore = 'discover_explore',
  transform = 'transform',
  create = 'create',
  implement = 'implement',
}

export const categoryDisplayNames: Record<CategoryEnum, string> = {
  entrepreneur: 'The Entrepreneur',
  team: 'Team & Collaboration',
  stakeholders: 'Customers, Stakeholders, and Systems',
  product: 'Truly, the best solution',
  sustainability: 'Sustainability and responsibility',
  time_space: 'Time and space',
};

export const categoryColors: Record<CategoryEnum, string> = {
  time_space: '#8d207a',
  entrepreneur: '#ec661c',
  team: '#d2132a',
  stakeholders: '#0075bc',
  product: '#53c0d8',
  sustainability: '#50ae3d',
};

export const categoryIcons: Record<CategoryEnum, string> = {
  entrepreneur: entrepreneurIcon,
  team: teamIcon,
  stakeholders: stakeholdersIcon,
  product: productIcon,
  sustainability: sustainabilityIcon,
  time_space: timeSpaceIcon,
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
