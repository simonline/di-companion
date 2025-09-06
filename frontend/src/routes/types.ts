import { FC } from 'react';
import { PathRouteProps } from 'react-router-dom';

import type { SvgIconProps } from '@mui/material/SvgIcon';

export enum Pages {
  Welcome,
  Register,
  CreateStartup,
  Login,
  Method,
  Explore,
  ExplorePattern,
  Progress,
  ProgressPattern,
  Startup,
  StartupCreate,
  CoachStartup,
  Coach,
  Settings,
  User,
  Logout,
  Startups,
  Analytics,
  Profile,
  UserProfile,
  StartupForm,
  StartupFormStep,
  StartupEdit,
  Survey,
  SelfAssessment,
  NotFound,
  NoStartup,
  StartupTeam,
  AcceptInvitation,
  UpdateProfile,
  ResetPassword,
  TeamContract,
  TeamAssessment,
  TeamValues,
  UserValues,
  Interviews,
  PitchDeck,
  FinancialPlan,
  Capture,
  StakeholderMap,
  Persona,
  ConfirmEmail,
  EmailConfirmed,
  PrivacyPolicy,
}

type PathRouteCustomProps = {
  title?: string;
  component: FC;
  icon?: FC<SvgIconProps>;
  iconOutlined?: FC<SvgIconProps>;
  requiresAuth?: boolean;
  visibleTo: ('coach' | 'startup')[];
  requiresStartup?: boolean;
  order?: number;
  agent?: string;
};

export type AppRoute = PathRouteProps & PathRouteCustomProps;

export type AppRoutes = Record<Pages, AppRoute>;
export type Routes = Record<Pages, AppRoute | PathRouteProps>;
