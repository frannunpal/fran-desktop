export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  desktop: string;
  taskbar: string;
  window: string;
  accent: string;
}

export interface IThemeProvider {
  getTheme(): Theme;
  setMode(mode: ThemeMode): void;
  toggle(): void;
}
