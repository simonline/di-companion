import StyleIcon from '@mui/icons-material/Style';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SpeedIcon from '@mui/icons-material/Speed';
import ForumIcon from '@mui/icons-material/Forum';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ListIcon from '@mui/icons-material/List';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useAuthContext } from '@/hooks/useAuth';

import asyncComponentLoader from '@/utils/loader';

import { Pages, Routes, AppRoutes } from './types';

export const useAppRoutes = (): Partial<AppRoutes> => {
  const { user } = useAuthContext();

  return {
    [Pages.Explore]: {
      component: asyncComponentLoader(() => import('@/pages/Explore')),
      path: '/explore',
      title: 'Explore',
      icon: StyleIcon,
      requiresAuth: true,
      visibleTo: ['startup'],
      requiresStartup: true,
    },
    [Pages.Progress]: {
      component: asyncComponentLoader(() => import('@/pages/Progress')),
      path: '/progress',
      title: 'Progress',
      icon: BookmarkIcon,
      requiresAuth: true,
      visibleTo: ['startup'],
      requiresStartup: true,
    },
    [Pages.Dashboard]: {
      component: asyncComponentLoader(() => import('@/pages/Dashboard')),
      path: '/dashboard',
      title: 'Dashboard',
      icon: SpeedIcon,
      requiresAuth: true,
      visibleTo: ['startup'],
      requiresStartup: true,
    },
    [Pages.Coach]: {
      component: asyncComponentLoader(() => import('@/pages/Coach')),
      path: '/coach',
      title: 'Coach',
      icon: ForumIcon,
      requiresAuth: true,
      visibleTo: ['startup'],
      requiresStartup: true,
    },
    [Pages.Startups]: {
      component: asyncComponentLoader(() => import('@/pages/Startups/Overview')),
      path: '/startups',
      title: 'Startups',
      icon: ListIcon,
      requiresAuth: true,
      visibleTo: ['coach'],
      requiresStartup: false,
    },
    [Pages.Analytics]: {
      component: asyncComponentLoader(() => import('@/pages/Startups/Analytics')),
      path: '/analytics',
      title: 'Analytics',
      icon: AnalyticsIcon,
      requiresAuth: true,
      visibleTo: ['coach'],
      requiresStartup: false,
    },
    [Pages.Profile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile')),
      path: '/profile',
      title: user ? user.givenName : 'Profile',
      icon: AccountCircleIcon,
      requiresAuth: true,
      visibleTo: ['startup', 'coach'],
      requiresStartup: false,
    },
    [Pages.NotFound]: {
      component: asyncComponentLoader(() => import('@/pages/NotFound')),
      path: '*',
      requiresAuth: false,
      visibleTo: ['startup', 'coach'],
      requiresStartup: false,
    },
  };
};

const useRoutes = (): Partial<Routes> => {
  return {
    ...useAppRoutes(),
    [Pages.Welcome]: {
      component: asyncComponentLoader(() => import('@/pages/Welcome')),
      path: '/',
      title: 'Welcome',
      visibleTo: ['startup', 'coach'],
      requiresAuth: false,
      requiresStartup: false,
    },
    [Pages.Register]: {
      component: asyncComponentLoader(() => import('@/pages/Register')),
      path: '/signup',
      title: 'Sign Up',
      visibleTo: ['startup', 'coach'],
      requiresAuth: false,
      requiresStartup: false,
    },
    [Pages.ResetPassword]: {
      component: asyncComponentLoader(() => import('@/pages/ResetPassword')),
      path: '/reset-password',
      title: 'Reset Password',
      visibleTo: ['startup', 'coach'],
      requiresAuth: false,
      requiresStartup: false,
    },
    [Pages.CreateStartup]: {
      component: asyncComponentLoader(() => import('@/pages/Register/CreateStartup')),
      path: '/create-startup',
      title: 'Create Startup',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: false,
    },
    [Pages.NoStartup]: {
      component: asyncComponentLoader(() => import('@/pages/Register/NoStartup')),
      path: '/no-startup',
      title: 'No Startup associated with your account',
      visibleTo: ['startup'],
      requiresAuth: false,
      requiresStartup: false,
    },
    [Pages.Login]: {
      component: asyncComponentLoader(() => import('@/pages/Login')),
      path: '/login',
      title: 'Login',
      visibleTo: ['startup', 'coach'],
      requiresAuth: false,
      requiresStartup: false,
    },
    [Pages.Logout]: {
      component: asyncComponentLoader(() => import('@/pages/Logout')),
      path: '/logout',
      title: 'Logout',
      visibleTo: ['startup', 'coach'],
      requiresAuth: true,
      requiresStartup: false,
    },
    [Pages.UserProfile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/UserProfile')),
      path: '/profile/user',
      title: 'User Profile',
      visibleTo: ['startup', 'coach'],
      requiresAuth: true,
      requiresStartup: false,
    },
    [Pages.UpdateProfile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/UpdateProfile')),
      path: '/profile/edit/:field?',
      title: 'Update Profile',
      visibleTo: ['startup', 'coach'],
      requiresAuth: true,
      requiresStartup: false,
    },
    [Pages.StartupProfile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/StartupProfile')),
      path: '/profile/startup/:id',
      title: 'Startup Profile',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: true,
    },
    [Pages.StartupProfileStep]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/StartupProfileStep')),
      path: '/profile/startup/:startupId/:stepId',
      title: 'Startup Profile Step',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: true,
    },
    [Pages.StartupEdit]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/StartupEdit')),
      path: '/profile/startup/:id/edit',
      title: 'Edit Startup',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: true,
    },
    [Pages.StartupTeam]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/StartupTeam')),
      path: '/profile/startup/:startupId/team',
      title: 'Manage Team',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: true,
    },
    [Pages.AcceptInvitation]: {
      component: asyncComponentLoader(() => import('@/pages/AcceptInvitation')),
      path: '/accept-invitation',
      title: 'Accept Invitation',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: false,
    },
    [Pages.ExplorePattern]: {
      component: asyncComponentLoader(() => import('@/pages/Explore/ExplorePattern')),
      path: '/explore/:id',
      title: 'Explore Pattern',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: true,
    },
    [Pages.ProgressPattern]: {
      component: asyncComponentLoader(() => import('@/pages/Progress/ProgressPattern')),
      path: '/progress/:id',
      title: 'Progress Pattern',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: true,
    },
    [Pages.Method]: {
      component: asyncComponentLoader(() => import('@/pages/Progress/Methods')),
      path: '/progress/:patternId/methods',
      title: 'Methods',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: true,
    },
    [Pages.Survey]: {
      component: asyncComponentLoader(() => import('@/pages/Progress/Survey')),
      path: '/progress/:patternId/survey',
      title: 'Survey',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: true,
    },
    [Pages.SelfAssessment]: {
      component: asyncComponentLoader(() => import('@/pages/SelfAssessment')),
      path: '/self-assessment',
      title: 'Self Assessment',
      visibleTo: ['startup'],
      requiresAuth: true,
      requiresStartup: true,
    },
    [Pages.Startup]: {
      component: asyncComponentLoader(() => import('@/pages/Startups/Startup')),
      path: '/startups/:id',
      title: 'Startup',
      requiresAuth: true,
      visibleTo: ['coach'],
      requiresStartup: false,
    },
  };
};

export default useRoutes;
