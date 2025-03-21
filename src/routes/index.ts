import StyleIcon from '@mui/icons-material/Style';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SpeedIcon from '@mui/icons-material/Speed';
import ForumIcon from '@mui/icons-material/Forum';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '@/hooks/useAuth';

import asyncComponentLoader from '@/utils/loader';

import { Pages, Routes, AppRoutes } from './types';

export const useAppRoutes = (): Partial<AppRoutes> => {
  const { user } = useAuth();

  return {
    [Pages.Explore]: {
      component: asyncComponentLoader(() => import('@/pages/Explore')),
      path: '/explore',
      title: 'Explore',
      icon: StyleIcon,
      requiresAuth: true,
    },
    [Pages.Progress]: {
      component: asyncComponentLoader(() => import('@/pages/Progress')),
      path: '/progress',
      title: 'Progress',
      icon: BookmarkIcon,
      requiresAuth: true,
    },
    [Pages.Dashboard]: {
      component: asyncComponentLoader(() => import('@/pages/Dashboard')),
      path: '/dashboard',
      title: 'Dashboard',
      icon: SpeedIcon,
      requiresAuth: true,
    },
    [Pages.Coach]: {
      component: asyncComponentLoader(() => import('@/pages/Coach')),
      path: '/coach',
      title: 'Coach',
      icon: ForumIcon,
      requiresAuth: true,
    },
    [Pages.Profile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile')),
      path: '/profile',
      title: user ? user.givenName : 'Profile',
      icon: AccountCircleIcon,
      requiresAuth: true,
    },
    [Pages.NotFound]: {
      component: asyncComponentLoader(() => import('@/pages/NotFound')),
      path: '*',
      requiresAuth: false,
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
      requiresAuth: false,
    },
    [Pages.Register]: {
      component: asyncComponentLoader(() => import('@/pages/Register')),
      path: '/signup',
      title: 'Sign Up',
      requiresAuth: false,
    },
    [Pages.CreateStartup]: {
      component: asyncComponentLoader(() => import('@/pages/Register/CreateStartup')),
      path: '/create-startup',
      title: 'Create Startup',
      requiresAuth: false,
    },
    [Pages.NoStartup]: {
      component: asyncComponentLoader(() => import('@/pages/Register/NoStartup')),
      path: '/no-startup',
      title: 'No Startup associated with your account',
      requiresAuth: false,
    },
    [Pages.Login]: {
      component: asyncComponentLoader(() => import('@/pages/Login')),
      path: '/login',
      title: 'Login',
      requiresAuth: false,
    },
    [Pages.Logout]: {
      component: asyncComponentLoader(() => import('@/pages/Logout')),
      path: '/logout',
      title: 'Logout',
      requiresAuth: true,
    },
    [Pages.UserProfile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/UserProfile')),
      path: '/profile/user',
      title: 'User Profile',
      requiresAuth: true,
    },
    [Pages.UserProfileField]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/UserProfileField')),
      path: '/profile/user/:key',
      title: 'User Profile Field',
      requiresAuth: true,
    },
    [Pages.UpdateProfile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/UpdateProfile')),
      path: '/profile/edit/:field?',
      title: 'Update Profile',
      requiresAuth: true,
    },
    [Pages.StartupProfile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/StartupProfile')),
      path: '/profile/startup/:id',
      title: 'Startup Profile',
      requiresAuth: true,
    },
    [Pages.StartupProfileStep]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/StartupProfileStep')),
      path: '/profile/startup/:startupId/:stepId',
      title: 'Startup Profile Step',
      requiresAuth: true,
    },
    [Pages.StartupEdit]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/StartupEdit')),
      path: '/profile/startup/:id/edit',
      title: 'Edit Startup',
      requiresAuth: true,
    },
    [Pages.StartupInvitations]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/StartupTeam')),
      path: '/profile/startup/:startupId/team',
      title: 'Manage Team',
      requiresAuth: true,
    },
    [Pages.AcceptInvitation]: {
      component: asyncComponentLoader(() => import('@/pages/AcceptInvitation')),
      path: '/accept-invitation',
      title: 'Accept Invitation',
      requiresAuth: true,
    },
    [Pages.ExplorePattern]: {
      component: asyncComponentLoader(() => import('@/pages/Explore/ExplorePattern')),
      path: '/explore/:id',
      title: 'Explore Pattern',
      requiresAuth: true,
    },
    [Pages.ProgressPattern]: {
      component: asyncComponentLoader(() => import('@/pages/Progress/ProgressPattern')),
      path: '/progress/:id',
      title: 'Progress Pattern',
      requiresAuth: true,
    },
    [Pages.Exercise]: {
      component: asyncComponentLoader(() => import('@/pages/Progress/Exercise')),
      path: '/progress/:patternId/exercise',
      title: 'Exercise',
      requiresAuth: true,
    },
    [Pages.Survey]: {
      component: asyncComponentLoader(() => import('@/pages/Progress/Survey')),
      path: '/progress/:patternId/survey',
      title: 'Survey',
      requiresAuth: true,
    },
    [Pages.SelfAssessment]: {
      component: asyncComponentLoader(() => import('@/pages/SelfAssessment')),
      path: '/self-assessment',
      title: 'Self Assessment',
      requiresAuth: true,
    },
    [Pages.CoachChat]: {
      component: asyncComponentLoader(() => import('@/pages/Coach/CoachChat')),
      path: '/coach/:id',
      title: 'Coach Chat',
      requiresAuth: true,
    },
  };
};

export default useRoutes;
