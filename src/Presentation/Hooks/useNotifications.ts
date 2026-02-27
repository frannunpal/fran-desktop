import { useDesktopStore } from '@presentation/Store/desktopStore';

export const useNotifications = () => {
  const notifications = useDesktopStore(state => state.notifications);
  const addNotification = useDesktopStore(state => state.addNotification);
  const removeNotification = useDesktopStore(state => state.removeNotification);
  return { notifications, addNotification, removeNotification };
};
