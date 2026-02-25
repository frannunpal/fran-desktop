import { describe, it, expect } from 'vitest';
import { createDesktopIcon } from './DesktopIcon';
import type { DesktopIconInput } from './DesktopIcon';

const baseInput: DesktopIconInput = {
  name: 'Notepad',
  icon: 'notepad.png',
  x: 50,
  y: 80,
  appId: 'notepad',
};

describe('DesktopIcon Entity', () => {
  describe('createDesktopIcon', () => {
    it('should create a desktop icon with the provided input values', () => {
      // Arrange & Act
      const icon = createDesktopIcon(baseInput);

      // Assert
      expect(icon.name).toBe('Notepad');
      expect(icon.icon).toBe('notepad.png');
      expect(icon.x).toBe(50);
      expect(icon.y).toBe(80);
      expect(icon.appId).toBe('notepad');
    });

    it('should generate a unique id', () => {
      // Arrange & Act
      const icon1 = createDesktopIcon(baseInput);
      const icon2 = createDesktopIcon(baseInput);

      // Assert
      expect(icon1.id).toBeTruthy();
      expect(icon2.id).toBeTruthy();
      expect(icon1.id).not.toBe(icon2.id);
    });

    it('should generate a non-empty id string', () => {
      // Arrange & Act
      const icon = createDesktopIcon(baseInput);

      // Assert
      expect(typeof icon.id).toBe('string');
      expect(icon.id.length).toBeGreaterThan(0);
    });
  });
});
