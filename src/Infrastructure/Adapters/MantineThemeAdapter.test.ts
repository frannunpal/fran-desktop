import { describe, it, expect } from 'vitest';
import { toMantineTheme } from './MantineThemeAdapter';
import type { Theme } from '@application/Ports/IThemeProvider';

const lightTheme: Theme = {
  mode: 'light',
  desktop: '#f0f4f8',
  taskbar: 'rgba(255, 255, 255, 0.9)',
  window: '#ffffff',
  accent: '#339af0',
};

const darkTheme: Theme = {
  mode: 'dark',
  desktop: '#1a1b1e',
  taskbar: 'rgba(26, 27, 30, 0.9)',
  window: '#25262b',
  accent: '#4dabf7',
};

describe('MantineThemeAdapter', () => {
  describe('toMantineTheme', () => {
    it('should map theme colors to Mantine other tokens', () => {
      // Act
      const result = toMantineTheme(lightTheme);

      // Assert
      expect(result.other?.desktop).toBe('#f0f4f8');
      expect(result.other?.taskbar).toBe('rgba(255, 255, 255, 0.9)');
      expect(result.other?.window).toBe('#ffffff');
      expect(result.other?.accent).toBe('#339af0');
    });

    it('should map dark theme colors correctly', () => {
      // Act
      const result = toMantineTheme(darkTheme);

      // Assert
      expect(result.other?.desktop).toBe('#1a1b1e');
      expect(result.other?.window).toBe('#25262b');
      expect(result.other?.accent).toBe('#4dabf7');
    });

    it('should always set primaryColor to blue', () => {
      // Act
      const result = toMantineTheme(lightTheme);

      // Assert
      expect(result.primaryColor).toBe('blue');
    });
  });
});
