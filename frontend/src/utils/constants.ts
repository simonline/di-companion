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


export enum QuestionType {
  radio = 'radio',
  select = 'select',
  select_multiple = 'select_multiple',
  checkbox = 'checkbox',
  checkbox_multiple = 'checkbox_multiple',
  text_short = 'text_short',
  text_long = 'text_long',
  email = 'email',
  number = 'number',
  rank = 'rank',
  scale = 'scale',
}

export interface QuestionOption {
  value: string;
  label: string;
  points?: number;
  position?: number;
}

export interface ScaleOptions {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export enum ResponseTypeEnum {
  accept = 'accept',
  reject = 'reject',
}

export enum ResponseEnum {
  share_reflection = 'share_reflection',
  perform_exercise = 'perform_exercise',
  think_later = 'think_later',
  already_addressed = 'already_addressed',
  maybe_later = 'maybe_later',
  no_value = 'no_value',
  dont_understand = 'dont_understand',
}

export enum InvitationStatusEnum {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
}