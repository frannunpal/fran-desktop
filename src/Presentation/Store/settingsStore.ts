import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DefaultThemeProvider } from '@infrastructure/Adapters/DefaultThemeProvider';
import type { ISettingsState, CustomThemeColors } from '@/Shared/Interfaces/ISettingsState';
import type { ThemeMode } from '@/Shared/Interfaces/IThemeProvider';

const persistedMode = (() => {
  try {
    return (JSON.parse(localStorage.getItem('fran-desktop:settings') ?? '{}')?.state?.theme?.mode ??
      null) as ThemeMode | null;
  } catch {
    return null;
  }
})();

const themeProvider = new DefaultThemeProvider(persistedMode ?? 'light');

export const useSettingsStore = create<ISettingsState>()(
  persist(
    set => ({
      wallpaper: null as string | null,
      launcherIcon: 'FcElectronics',
      font: 'system-ui',
      downloadedFonts: [] as string[],
      theme: themeProvider.getTheme(),
      themeSetManually: persistedMode !== null,
      customThemeColors: null as CustomThemeColors | null,

      setWallpaper: url => set({ wallpaper: url }),
      setLauncherIcon: icon => set({ launcherIcon: icon }),
      setFont: font => set({ font }),
      markFontDownloaded: fontName =>
        set(state => ({
          downloadedFonts: state.downloadedFonts.includes(fontName)
            ? state.downloadedFonts
            : [...state.downloadedFonts, fontName],
        })),
      setThemeMode: mode => {
        themeProvider.setMode(mode);
        set({ theme: themeProvider.getTheme(), themeSetManually: true });
      },
      toggleTheme: () => {
        themeProvider.toggle();
        set({ theme: themeProvider.getTheme(), themeSetManually: true });
      },
      setThemeAutomatic: () => set({ themeSetManually: false }),
      applySystemTheme: mode => {
        themeProvider.setMode(mode);
        set({ theme: themeProvider.getTheme() });
      },
      setCustomThemeColors: colors => {
        if (colors === null) {
          themeProvider.clearCustomColors();
        } else {
          themeProvider.setCustomColors({
            taskbar: colors.taskbar,
            window: colors.window,
            accent: colors.accent,
          });
        }
        set({ customThemeColors: colors, theme: themeProvider.getTheme() });
      },
    }),
    {
      name: 'fran-desktop:settings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
