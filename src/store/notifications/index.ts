import { useMemo } from 'react';
import { create } from 'zustand';
import type { SnackbarKey } from 'notistack';

import { notifications as notificationsDefaults } from '@/config';
import { Actions, Notification } from './types';

const useNotificationStore = create<{
  notifications: Notification[];
  push: (notification: Partial<Notification>) => string;
  close: (key: SnackbarKey, dismissAll: boolean) => void;
  remove: (key: SnackbarKey) => void;
}>((set) => ({
  notifications: [],

  push: (notification) => {
    const id = Math.random().toString();
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          message: notification.message,
          dismissed: false,
          options: {
            ...notificationsDefaults.options,
            ...notification.options,
            key: id,
          },
        },
      ],
    }));
    return id;
  },

  close: (key, dismissAll = !key) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        dismissAll || notification.options.key === key
          ? { ...notification, dismissed: true }
          : notification,
      ),
    }));
  },

  remove: (key) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.options.key !== key),
    }));
  },
}));

function useNotifications(): [Notification[], Actions] {
  const notifications = useNotificationStore((state) => state.notifications);
  const push = useNotificationStore((state) => state.push);
  const close = useNotificationStore((state) => state.close);
  const remove = useNotificationStore((state) => state.remove);

  const actions = useMemo(() => ({ push, close, remove }), [push, close, remove]);

  return [notifications, actions];
}

export default useNotifications;
