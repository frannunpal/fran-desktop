import { describe, it, expect, beforeEach } from 'vitest';
import { minimizeWindow } from './MinimizeWindow';
import { createMockWindowManager } from '@/Shared/Testing/__mocks__/IWindowManager.mock';
import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';

describe('minimizeWindow use case', () => {
  let manager: IWindowManager;

  beforeEach(() => {
    manager = createMockWindowManager();
  });

  it('should call manager.minimize with the given id', () => {
    // Arrange
    const id = 'window-7';

    // Act
    minimizeWindow(manager, id);

    // Assert
    expect(manager.minimize).toHaveBeenCalledWith(id);
  });

  it('should call manager.minimize exactly once', () => {
    // Arrange
    const id = 'window-7';

    // Act
    minimizeWindow(manager, id);

    // Assert
    expect(manager.minimize).toHaveBeenCalledTimes(1);
  });
});
