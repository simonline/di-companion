import StyleIcon from '@mui/icons-material/Style';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SpeedIcon from '@mui/icons-material/Speed';
import ForumIcon from '@mui/icons-material/Forum';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import asyncComponentLoader from '@/utils/loader';

import { Pages, Routes } from './types';

const routes: Routes = {
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
    title: 'Profile',
    icon: AccountCircleIcon,
  },
  [Pages.NotFound]: {
    component: asyncComponentLoader(() => import('@/pages/NotFound')),
    path: '*',
  },
};

export default routes;
