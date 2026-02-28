import { useCallback } from 'react';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { APPS, DEFAULT_WINDOW_DIMENSIONS } from '@shared/Constants/apps';
import { randomWindowPosition } from '@shared/Constants/Animations';

export type OpenAppOptions = {
  /** Extra data passed to the window's content component. */
  contentData?: Record<string, unknown>;
  /** Override position (e.g. for the initial seed window). */
  position?: { x: number; y: number };
};

/**
 * Returns a stable `openApp(appId, options?)` callback that looks up app
 * metadata, picks a random desktop position (unless overridden) and calls
 * `openWindow` on the desktop store.
 */
export const useOpenApp = () => {
  const openWindow = useDesktopStore(state => state.openWindow);

  return useCallback(
    (appId: string, { contentData, position }: OpenAppOptions = {}) => {
      const app = APPS.find(a => a.id === appId);
      const { x, y } = position ?? randomWindowPosition();
      openWindow({
        title: app?.name ?? appId.charAt(0).toUpperCase() + appId.slice(1),
        content: appId,
        icon: app?.icon,
        fcIcon: app?.fcIcon,
        canMaximize: app?.canMaximize,
        x,
        y,
        width: app?.defaultWidth ?? DEFAULT_WINDOW_DIMENSIONS.defaultWidth,
        height: app?.defaultHeight ?? DEFAULT_WINDOW_DIMENSIONS.defaultHeight,
        minWidth: app?.minWidth ?? DEFAULT_WINDOW_DIMENSIONS.minWidth,
        minHeight: app?.minHeight ?? DEFAULT_WINDOW_DIMENSIONS.minHeight,
        contentData,
      });
    },
    [openWindow],
  );
};
