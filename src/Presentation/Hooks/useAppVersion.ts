import { useEffect } from 'react';
import { useDesktopStore } from '@presentation/Store/desktopStore';

const VERSION_STORAGE_KEY = 'fran-desktop:version';
const DESKTOP_APPS = ['notepad', 'terminal', 'files', 'storybook'];

interface AppVersion {
  sha: string;
  buildAt: string;
}

let appVersionCheckStarted = false;

export const resetAppVersionFlag = (): void => {
  appVersionCheckStarted = false;
};

export const useAppVersion = (): void => {
  const mergeSeed = useDesktopStore(state => state.mergeSeed);
  const mergeDesktopApps = useDesktopStore(state => state.mergeDesktopApps);
  const addNotification = useDesktopStore(state => state.addNotification);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (appVersionCheckStarted) return;
    appVersionCheckStarted = true;

    const check = async () => {
      try {
        const stored = localStorage.getItem(VERSION_STORAGE_KEY);
        const storedVersion: AppVersion | null = stored ? (JSON.parse(stored) as AppVersion) : null;

        const fetched: AppVersion = await fetch(`${import.meta.env.BASE_URL}version.json`).then(r =>
          r.json(),
        );

        if (storedVersion?.sha === fetched.sha) return;

        const manifest = await fetch(`${import.meta.env.BASE_URL}fs-manifest.json`).then(r =>
          r.json(),
        );

        mergeSeed(manifest);
        mergeDesktopApps(DESKTOP_APPS);
        localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(fetched));
        addNotification({
          id: 'app-update',
          title: 'New version available!',
          message: 'Close this notification to install it.',
          onClose: () => window.location.reload(),
          fcIcon: 'FcEngineering',
        });
      } catch {
        appVersionCheckStarted = false;
      }
    };

    check();
  }, [mergeSeed, mergeDesktopApps, addNotification]);
};
