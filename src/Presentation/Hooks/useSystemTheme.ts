import { useEffect } from 'react';
import type { ThemeMode } from '@/Shared/Interfaces/IThemeProvider';
import { useDesktopStore } from '@presentation/Store/desktopStore';

const getSystemMode = (): ThemeMode =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

export const useSystemTheme = (): void => {
  const setThemeMode = useDesktopStore(state => state.setThemeMode);
  const themeSetManually = useDesktopStore(state => state.themeSetManually);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!themeSetManually) {
      setThemeMode(getSystemMode());
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!useDesktopStore.getState().themeSetManually) {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setThemeMode, themeSetManually]);
};
