import type { IThemeProvider, Theme, ThemeMode } from '@/Shared/Interfaces/IThemeProvider';

const THEMES: Record<ThemeMode, Theme> = {
  light: {
    mode: 'light',
    desktop: '#f0f4f8',
    taskbar: 'rgba(255, 255, 255, 0.9)',
    window: '#ffffff',
    accent: '#339af0',
  },
  dark: {
    mode: 'dark',
    desktop: '#1a1b1e',
    taskbar: 'rgba(26, 27, 30, 0.9)',
    window: '#25262b',
    accent: '#4dabf7',
  },
};

export class DefaultThemeProvider implements IThemeProvider {
  private mode: ThemeMode;
  private customColors: Partial<Theme> = {};

  constructor(initialMode: ThemeMode = 'light') {
    this.mode = initialMode;
  }

  getTheme(): Theme {
    const baseTheme = THEMES[this.mode];
    return {
      ...baseTheme,
      ...this.customColors,
    };
  }

  setMode(mode: ThemeMode): void {
    this.mode = mode;
  }

  toggle(): void {
    this.mode = this.mode === 'light' ? 'dark' : 'light';
  }

  setCustomColors(colors: Partial<Theme>): void {
    this.customColors = { ...this.customColors, ...colors };
  }

  clearCustomColors(): void {
    this.customColors = {};
  }
}
