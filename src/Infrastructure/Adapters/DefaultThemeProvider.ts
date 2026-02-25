import type { IThemeProvider, Theme, ThemeMode } from '@application/Ports/IThemeProvider';

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

  constructor(initialMode: ThemeMode = 'light') {
    this.mode = initialMode;
  }

  getTheme(): Theme {
    return THEMES[this.mode];
  }

  setMode(mode: ThemeMode): void {
    this.mode = mode;
  }

  toggle(): void {
    this.mode = this.mode === 'light' ? 'dark' : 'light';
  }
}
