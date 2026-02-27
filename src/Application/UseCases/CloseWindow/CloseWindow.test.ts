import { describe, it, expect, beforeEach } from 'vitest';
import { closeWindow } from './CloseWindow';
import { createMockWindowManager } from '@/Shared/Testing/__mocks__/IWindowManager.mock';
import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';

describe('closeWindow use case', () => {
  let manager: IWindowManager;

  beforeEach(() => {
    manager = createMockWindowManager();
  });

  it('should call manager.close with the given id', () => {
    // Arrange
    const id = 'window-42';

    // Act
    closeWindow(manager, id);

    // Assert
    expect(manager.close).toHaveBeenCalledWith(id);
  });

  it('should call manager.close exactly once', () => {
    // Arrange
    const id = 'window-42';

    // Act
    closeWindow(manager, id);

    // Assert
    expect(manager.close).toHaveBeenCalledTimes(1);
  });
});
