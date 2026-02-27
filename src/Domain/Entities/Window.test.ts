import { describe, it, expect } from 'vitest';
import { createWindow } from './Window';
import { makeWindowInput } from '@/Shared/Testing/Utils/makeWindowInput';

const baseInput = makeWindowInput({ y: 150 });

describe('Window Entity', () => {
  describe('createWindow', () => {
    it('should create a window with the provided input values', () => {
      // Arrange & Act
      const window = createWindow(baseInput);

      // Assert
      expect(window.title).toBe('Test Window');
      expect(window.content).toBe('notepad');
      expect(window.x).toBe(100);
      expect(window.y).toBe(150);
      expect(window.width).toBe(800);
      expect(window.height).toBe(600);
      expect(window.minWidth).toBe(200);
      expect(window.minHeight).toBe(150);
    });

    it('should set isOpen to true by default', () => {
      // Arrange & Act
      const window = createWindow(baseInput);

      // Assert
      expect(window.isOpen).toBe(true);
    });

    it('should set state to "normal" by default', () => {
      // Arrange & Act
      const window = createWindow(baseInput);

      // Assert
      expect(window.state).toBe('normal');
    });

    it('should set zIndex to 0 by default', () => {
      // Arrange & Act
      const window = createWindow(baseInput);

      // Assert
      expect(window.zIndex).toBe(0);
    });

    it('should generate a unique id', () => {
      // Arrange & Act
      const window1 = createWindow(baseInput);
      const window2 = createWindow(baseInput);

      // Assert
      expect(window1.id).toBeTruthy();
      expect(window2.id).toBeTruthy();
      expect(window1.id).not.toBe(window2.id);
    });

    it('should accept an optional icon', () => {
      // Arrange
      const inputWithIcon = makeWindowInput({ y: 150, icon: 'notepad-icon.png' });

      // Act
      const window = createWindow(inputWithIcon);

      // Assert
      expect(window.icon).toBe('notepad-icon.png');
    });

    it('should have undefined icon when not provided', () => {
      // Arrange & Act
      const window = createWindow(baseInput);

      // Assert
      expect(window.icon).toBeUndefined();
    });
  });
});
