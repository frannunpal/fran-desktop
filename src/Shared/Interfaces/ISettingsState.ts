import type { Theme, ThemeMode } from '@/Shared/Interfaces/IThemeProvider';

export interface CustomThemeColors {
  taskbar: string;
  window: string;
  accent: string;
}

export interface ISettingsState {
  // Appearance
  wallpaper: string | null;
  launcherIcon: string;
  font: string;
  downloadedFonts: string[];
  // Theme
  theme: Theme;
  themeSetManually: boolean;
  customThemeColors: CustomThemeColors | null;

  setWallpaper: (url: string | null) => void;
  setLauncherIcon: (icon: string) => void;
  setFont: (font: string) => void;
  markFontDownloaded: (fontName: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setThemeAutomatic: () => void;
  applySystemTheme: (mode: ThemeMode) => void;
  setCustomThemeColors: (colors: CustomThemeColors | null) => void;
}
