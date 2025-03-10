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
    },
    [Pages.Progress]: {
      component: asyncComponentLoader(() => import('@/pages/Progress')),
      path: '/progress',
      title: 'Progress',
      icon: BookmarkIcon,
    },
    [Pages.Dashboard]: {
      component: asyncComponentLoader(() => import('@/pages/Dashboard')),
      path: '/dashboard',
      title: 'Dashboard',
      icon: SpeedIcon,
    },
    [Pages.Coach]: {
      component: asyncComponentLoader(() => import('@/pages/Coach')),
      path: '/coach',
      title: 'Coach',
      icon: ForumIcon,
    },
    [Pages.Profile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile')),
      path: '/profile',
      title: user ? user.givenName : 'Profile',
      icon: AccountCircleIcon,
    },
    [Pages.NotFound]: {
      component: asyncComponentLoader(() => import('@/pages/NotFound')),
      path: '*',
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
    },
    [Pages.Register]: {
      component: asyncComponentLoader(() => import('@/pages/Register')),
      path: '/signup',
      title: 'Sign Up',
    },
    [Pages.CreateStartup]: {
      component: asyncComponentLoader(() => import('@/pages/Register/CreateStartup')),
      path: '/create-startup',
      title: 'Create Startup',
    },
    [Pages.Login]: {
      component: asyncComponentLoader(() => import('@/pages/Login')),
      path: '/login',
      title: 'Login',
    },
    [Pages.Logout]: {
      component: asyncComponentLoader(() => import('@/pages/Logout')),
      path: '/logout',
      title: 'Logout',
    },
    [Pages.UserProfile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/UserProfile')),
      path: '/profile/user',
      title: 'User Profile',
    },
    [Pages.UserProfileField]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/UserProfileField')),
      path: '/profile/user/:key',
      title: 'User Profile Field',
    },
    [Pages.StartupProfile]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/StartupProfile')),
      path: '/profile/startup/:id',
      title: 'Startup Profile',
    },
    [Pages.StartupProfileStep]: {
      component: asyncComponentLoader(() => import('@/pages/Profile/StartupProfileStep')),
      path: '/profile/startup/:startupId/:stepId',
      title: 'Startup Profile Step',
    },
    [Pages.ExplorePattern]: {
      component: asyncComponentLoader(() => import('@/pages/Explore/ExplorePattern')),
      path: '/explore/:id',
      title: 'Explore Pattern',
    },
    [Pages.ProgressPattern]: {
      component: asyncComponentLoader(() => import('@/pages/Progress/ProgressPattern')),
      path: '/progress/:id',
      title: 'Progress Pattern',
    },
    [Pages.Exercise]: {
      component: asyncComponentLoader(() => import('@/pages/Progress/Exercise')),
      path: '/progress/:patternId/exercise',
      title: 'Exercise',
    },
    [Pages.Survey]: {
      component: asyncComponentLoader(() => import('@/pages/Progress/Survey')),
      path: '/progress/:patternId/survey',
      title: 'Survey',
    },
    [Pages.SelfAssessment]: {
      component: asyncComponentLoader(() => import('@/pages/SelfAssessment')),
      path: '/self-assessment',
      title: 'Self Assessment',
    },
    [Pages.CoachChat]: {
      component: asyncComponentLoader(() => import('@/pages/Coach/CoachChat')),
      path: '/coach/:id',
      title: 'Coach Chat',
    },
  };
};

export default useRoutes;
