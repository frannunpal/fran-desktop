import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useSettingsStore } = await import('./settingsStore');

const reset = () => {
  localStorageMock.clear();
  vi.clearAllMocks();
  useSettingsStore.setState({
    wallpaper: null,
    launcherIcon: 'FcElectronics',
    font: 'system-ui',
    downloadedFonts: [],
    themeSetManually: false,
  });
  useSettingsStore.getState().setThemeMode('light');
  useSettingsStore.setState({ themeSetManually: false });
};

describe('settingsStore', () => {
  beforeEach(reset);

  describe('initial state', () => {
    it('wallpaper is null', () => {
      expect(useSettingsStore.getState().wallpaper).toBeNull();
    });

    it('launcherIcon is FcElectronics', () => {
      expect(useSettingsStore.getState().launcherIcon).toBe('FcElectronics');
    });

    it('font is system-ui', () => {
      expect(useSettingsStore.getState().font).toBe('system-ui');
    });

    it('downloadedFonts is empty', () => {
      expect(useSettingsStore.getState().downloadedFonts).toHaveLength(0);
    });

    it('themeSetManually is false', () => {
      expect(useSettingsStore.getState().themeSetManually).toBe(false);
    });

    it('theme mode is light', () => {
      expect(useSettingsStore.getState().theme.mode).toBe('light');
    });
  });

  describe('setWallpaper', () => {
    it('updates wallpaper to a URL', () => {
      // Act
      useSettingsStore.getState().setWallpaper('https://example.com/bg.jpg');

      // Assert
      expect(useSettingsStore.getState().wallpaper).toBe('https://example.com/bg.jpg');
    });

    it('resets wallpaper to null', () => {
      // Arrange
      useSettingsStore.getState().setWallpaper('https://example.com/bg.jpg');

      // Act
      useSettingsStore.getState().setWallpaper(null);

      // Assert
      expect(useSettingsStore.getState().wallpaper).toBeNull();
    });
  });

  describe('setLauncherIcon', () => {
    it('updates launcherIcon', () => {
      // Act
      useSettingsStore.getState().setLauncherIcon('FcDebian');

      // Assert
      expect(useSettingsStore.getState().launcherIcon).toBe('FcDebian');
    });
  });

  describe('setFont', () => {
    it('updates font', () => {
      // Act
      useSettingsStore.getState().setFont('Hack');

      // Assert
      expect(useSettingsStore.getState().font).toBe('Hack');
    });
  });

  describe('markFontDownloaded', () => {
    it('adds a font name to downloadedFonts', () => {
      // Act
      useSettingsStore.getState().markFontDownloaded('Hack');

      // Assert
      expect(useSettingsStore.getState().downloadedFonts).toContain('Hack');
    });

    it('does not duplicate an already-added font', () => {
      // Arrange
      useSettingsStore.getState().markFontDownloaded('Hack');

      // Act
      useSettingsStore.getState().markFontDownloaded('Hack');

      // Assert
      const { downloadedFonts } = useSettingsStore.getState();
      expect(downloadedFonts.filter(f => f === 'Hack')).toHaveLength(1);
    });

    it('can track multiple different fonts', () => {
      // Act
      useSettingsStore.getState().markFontDownloaded('Hack');
      useSettingsStore.getState().markFontDownloaded('Fira Code');

      // Assert
      expect(useSettingsStore.getState().downloadedFonts).toContain('Hack');
      expect(useSettingsStore.getState().downloadedFonts).toContain('Fira Code');
    });
  });

  describe('setThemeMode', () => {
    it('switches to dark mode', () => {
      // Act
      useSettingsStore.getState().setThemeMode('dark');

      // Assert
      expect(useSettingsStore.getState().theme.mode).toBe('dark');
    });

    it('sets themeSetManually to true', () => {
      // Act
      useSettingsStore.getState().setThemeMode('dark');

      // Assert
      expect(useSettingsStore.getState().themeSetManually).toBe(true);
    });
  });

  describe('toggleTheme', () => {
    it('toggles from light to dark', () => {
      // Act
      useSettingsStore.getState().toggleTheme();

      // Assert
      expect(useSettingsStore.getState().theme.mode).toBe('dark');
    });

    it('toggles back to light after two toggles', () => {
      // Act
      useSettingsStore.getState().toggleTheme();
      useSettingsStore.getState().toggleTheme();

      // Assert
      expect(useSettingsStore.getState().theme.mode).toBe('light');
    });

    it('sets themeSetManually to true', () => {
      // Act
      useSettingsStore.getState().toggleTheme();

      // Assert
      expect(useSettingsStore.getState().themeSetManually).toBe(true);
    });
  });

  describe('setThemeAutomatic', () => {
    it('sets themeSetManually to false', () => {
      // Arrange
      useSettingsStore.getState().setThemeMode('dark');
      expect(useSettingsStore.getState().themeSetManually).toBe(true);

      // Act
      useSettingsStore.getState().setThemeAutomatic();

      // Assert
      expect(useSettingsStore.getState().themeSetManually).toBe(false);
    });
  });
});
