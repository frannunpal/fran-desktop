import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultThemeProvider } from './DefaultThemeProvider';

describe('DefaultThemeProvider', () => {
  let provider: DefaultThemeProvider;

  beforeEach(() => {
    provider = new DefaultThemeProvider();
  });

  describe('getTheme', () => {
    it('should return light theme by default', () => {
      // Act
      const theme = provider.getTheme();

      // Assert
      expect(theme.mode).toBe('light');
    });

    it('should return the correct light theme colors', () => {
      // Act
      const theme = provider.getTheme();

      // Assert
      expect(theme.desktop).toBe('#f0f4f8');
      expect(theme.window).toBe('#ffffff');
      expect(theme.accent).toBe('#339af0');
    });

    it('should return dark theme when initialized with dark mode', () => {
      // Arrange
      const darkProvider = new DefaultThemeProvider('dark');

      // Act
      const theme = darkProvider.getTheme();

      // Assert
      expect(theme.mode).toBe('dark');
      expect(theme.desktop).toBe('#1a1b1e');
      expect(theme.window).toBe('#25262b');
      expect(theme.accent).toBe('#4dabf7');
    });
  });

  describe('setMode', () => {
    it('should switch to dark mode', () => {
      // Act
      provider.setMode('dark');

      // Assert
      expect(provider.getTheme().mode).toBe('dark');
    });

    it('should switch back to light mode', () => {
      // Arrange
      provider.setMode('dark');

      // Act
      provider.setMode('light');

      // Assert
      expect(provider.getTheme().mode).toBe('light');
    });
  });

  describe('toggle', () => {
    it('should switch from light to dark', () => {
      // Act
      provider.toggle();

      // Assert
      expect(provider.getTheme().mode).toBe('dark');
    });

    it('should switch from dark to light', () => {
      // Arrange
      provider.setMode('dark');

      // Act
      provider.toggle();

      // Assert
      expect(provider.getTheme().mode).toBe('light');
    });

    it('should return to original mode after two toggles', () => {
      // Arrange
      const initial = provider.getTheme().mode;

      // Act
      provider.toggle();
      provider.toggle();

      // Assert
      expect(provider.getTheme().mode).toBe(initial);
    });
  });
});
