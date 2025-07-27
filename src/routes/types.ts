import { FC } from 'react';
import { PathRouteProps } from 'react-router-dom';

import type { SvgIconProps } from '@mui/material/SvgIcon';

export enum Pages {
  Welcome,
  Register,
  CreateStartup,
  Login,
  Logout,
  Method,
  Explore,
  ExplorePattern,
  Progress,
  ProgressPattern,
  Dashboard,
  Coach,
  Startups,
  Analytics,
  Startup,
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
}

type PathRouteCustomProps = {
  title?: string;
  component: FC;
  icon?: FC<SvgIconProps>;
  requiresAuth?: boolean;
  visibleTo: ('coach' | 'startup')[];
  requiresStartup?: boolean;
};

export type AppRoute = PathRouteProps & PathRouteCustomProps;

export type AppRoutes = Record<Pages, AppRoute>;
export type Routes = Record<Pages, AppRoute | PathRouteProps>;
