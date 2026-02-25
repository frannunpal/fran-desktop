import { describe, it, expect, beforeEach } from 'vitest';
import { resizeWindow } from './ResizeWindow';
import { createMockWindowManager } from '@application/__mocks__/IWindowManager.mock';
import type { IWindowManager } from '@application/Ports/IWindowManager';

describe('resizeWindow use case', () => {
  let manager: IWindowManager;

  beforeEach(() => {
    manager = createMockWindowManager();
  });

  it('should call manager.resize with the given id, width and height', () => {
    // Arrange
    const id = 'window-9';
    const width = 1024;
    const height = 768;

    // Act
    resizeWindow(manager, id, width, height);

    // Assert
    expect(manager.resize).toHaveBeenCalledWith(id, width, height);
  });

  it('should call manager.resize exactly once', () => {
    // Arrange
    const id = 'window-9';

    // Act
    resizeWindow(manager, id, 800, 600);

    // Assert
    expect(manager.resize).toHaveBeenCalledTimes(1);
  });
});
