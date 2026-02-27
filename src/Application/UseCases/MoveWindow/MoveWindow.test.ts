import { describe, it, expect, beforeEach } from 'vitest';
import { moveWindow } from './MoveWindow';
import { createMockWindowManager } from '@/Shared/Testing/__mocks__/IWindowManager.mock';
import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';

describe('moveWindow use case', () => {
  let manager: IWindowManager;

  beforeEach(() => {
    manager = createMockWindowManager();
  });

  it('should call manager.move with the given id and coordinates', () => {
    // Arrange
    const id = 'window-5';
    const x = 200;
    const y = 300;

    // Act
    moveWindow(manager, id, x, y);

    // Assert
    expect(manager.move).toHaveBeenCalledWith(id, x, y);
  });

  it('should call manager.move exactly once', () => {
    // Arrange
    const id = 'window-5';

    // Act
    moveWindow(manager, id, 0, 0);

    // Assert
    expect(manager.move).toHaveBeenCalledTimes(1);
  });

  it('should pass coordinates including zero values', () => {
    // Arrange
    const id = 'window-5';

    // Act
    moveWindow(manager, id, 0, 0);

    // Assert
    expect(manager.move).toHaveBeenCalledWith(id, 0, 0);
  });

  it('should pass negative coordinates', () => {
    // Arrange
    const id = 'window-5';

    // Act
    moveWindow(manager, id, -50, -100);

    // Assert
    expect(manager.move).toHaveBeenCalledWith(id, -50, -100);
  });
});
