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
  CoachStartup,
  Coach,
  Settings,
  User,
  Logout,
  Startups,
  Analytics,
  Profile,
  UserProfile,
  UserProfileField,
  StartupProfile,
  StartupProfileStep,
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
  TeamValues,
  InterviewAnalyzer,
  PitchDeckAnalyzer,
  FinancialPlan,
  Capture,
  StakeholderMap,
  Persona,
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
