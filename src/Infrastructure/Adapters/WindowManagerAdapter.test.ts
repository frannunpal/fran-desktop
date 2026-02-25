import { describe, it, expect, beforeEach } from 'vitest';
import { WindowManagerAdapter } from './WindowManagerAdapter';
import type { WindowInput } from '@domain/Entities/Window';

const baseInput: WindowInput = {
  title: 'Test Window',
  content: 'notepad',
  x: 100,
  y: 100,
  width: 800,
  height: 600,
  minWidth: 200,
  minHeight: 150,
};

describe('WindowManagerAdapter', () => {
  let manager: WindowManagerAdapter;

  beforeEach(() => {
    manager = new WindowManagerAdapter();
  });

  describe('open', () => {
    it('should create and store a new window', () => {
      // Act
      const window = manager.open(baseInput);

      // Assert
      expect(manager.getById(window.id)).toBeDefined();
      expect(manager.getById(window.id)?.title).toBe('Test Window');
    });

    it('should set isOpen to true', () => {
      // Act
      const window = manager.open(baseInput);

      // Assert
      expect(window.isOpen).toBe(true);
    });

    it('should assign an incrementing zIndex', () => {
      // Act
      const w1 = manager.open(baseInput);
      const w2 = manager.open(baseInput);

      // Assert
      expect(w2.zIndex).toBeGreaterThan(w1.zIndex);
    });

    it('should return unique ids for each window', () => {
      // Act
      const w1 = manager.open(baseInput);
      const w2 = manager.open(baseInput);

      // Assert
      expect(w1.id).not.toBe(w2.id);
    });
  });

  describe('getAll', () => {
    it('should return empty array when no windows are open', () => {
      // Assert
      expect(manager.getAll()).toEqual([]);
    });

    it('should return all open windows', () => {
      // Arrange
      manager.open(baseInput);
      manager.open(baseInput);

      // Assert
      expect(manager.getAll()).toHaveLength(2);
    });
  });

  describe('getById', () => {
    it('should return undefined for unknown id', () => {
      // Assert
      expect(manager.getById('non-existent')).toBeUndefined();
    });

    it('should return the correct window by id', () => {
      // Arrange
      const window = manager.open({ ...baseInput, title: 'Finder' });

      // Act
      const found = manager.getById(window.id);

      // Assert
      expect(found?.title).toBe('Finder');
    });
  });

  describe('close', () => {
    it('should remove the window from the manager', () => {
      // Arrange
      const window = manager.open(baseInput);

      // Act
      manager.close(window.id);

      // Assert
      expect(manager.getById(window.id)).toBeUndefined();
      expect(manager.getAll()).toHaveLength(0);
    });

    it('should do nothing for unknown id', () => {
      // Arrange
      manager.open(baseInput);

      // Act & Assert (no throw)
      expect(() => manager.close('non-existent')).not.toThrow();
      expect(manager.getAll()).toHaveLength(1);
    });
  });

  describe('minimize', () => {
    it('should set state to minimized', () => {
      // Arrange
      const window = manager.open(baseInput);

      // Act
      manager.minimize(window.id);

      // Assert
      expect(manager.getById(window.id)?.state).toBe('minimized');
    });

    it('should do nothing for unknown id', () => {
      // Act & Assert (no throw)
      expect(() => manager.minimize('non-existent')).not.toThrow();
    });
  });

  describe('maximize', () => {
    it('should set state to maximized', () => {
      // Arrange
      const window = manager.open(baseInput);

      // Act
      manager.maximize(window.id);

      // Assert
      expect(manager.getById(window.id)?.state).toBe('maximized');
    });

    it('should do nothing for unknown id', () => {
      // Act & Assert (no throw)
      expect(() => manager.maximize('non-existent')).not.toThrow();
    });
  });

  describe('restore', () => {
    it('should set state back to normal', () => {
      // Arrange
      const window = manager.open(baseInput);
      manager.minimize(window.id);

      // Act
      manager.restore(window.id);

      // Assert
      expect(manager.getById(window.id)?.state).toBe('normal');
    });

    it('should do nothing for unknown id', () => {
      // Act & Assert (no throw)
      expect(() => manager.restore('non-existent')).not.toThrow();
    });
  });

  describe('focus', () => {
    it('should give the window the highest zIndex', () => {
      // Arrange
      const w1 = manager.open(baseInput);
      const w2 = manager.open(baseInput);

      // Act
      manager.focus(w1.id);

      // Assert
      const focused = manager.getById(w1.id)!;
      const other = manager.getById(w2.id)!;
      expect(focused.zIndex).toBeGreaterThan(other.zIndex);
    });

    it('should do nothing for unknown id', () => {
      // Act & Assert (no throw)
      expect(() => manager.focus('non-existent')).not.toThrow();
    });
  });

  describe('move', () => {
    it('should update x and y of the window', () => {
      // Arrange
      const window = manager.open(baseInput);

      // Act
      manager.move(window.id, 250, 350);

      // Assert
      const moved = manager.getById(window.id)!;
      expect(moved.x).toBe(250);
      expect(moved.y).toBe(350);
    });

    it('should do nothing for unknown id', () => {
      // Act & Assert (no throw)
      expect(() => manager.move('non-existent', 0, 0)).not.toThrow();
    });
  });

  describe('resize', () => {
    it('should update width and height of the window', () => {
      // Arrange
      const window = manager.open(baseInput);

      // Act
      manager.resize(window.id, 1024, 768);

      // Assert
      const resized = manager.getById(window.id)!;
      expect(resized.width).toBe(1024);
      expect(resized.height).toBe(768);
    });

    it('should do nothing for unknown id', () => {
      // Act & Assert (no throw)
      expect(() => manager.resize('non-existent', 100, 100)).not.toThrow();
    });
  });
});
