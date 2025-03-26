import { FC } from 'react';
import { PathRouteProps } from 'react-router-dom';

import type { SvgIconProps } from '@mui/material/SvgIcon';

export enum Pages {
  Welcome,
  Register,
  CreateStartup,
  Login,
  Logout,
  Exercise,
  Explore,
  ExplorePattern,
  Progress,
  ProgressPattern,
  Dashboard,
  Coach,
  CoachChat,
  Startups,
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
  StartupInvitations,
  AcceptInvitation,
  UpdateProfile,
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
