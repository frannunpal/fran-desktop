import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openWindow } from './OpenWindow';
import { createMockWindowManager } from '@application/__mocks__/IWindowManager.mock';
import type { IWindowManager } from '@application/Ports/IWindowManager';
import type { WindowEntity, WindowInput } from '@domain/Entities/Window';

const mockWindow: WindowEntity = {
  id: 'abc-123',
  title: 'Notepad',
  content: 'notepad',
  x: 100,
  y: 100,
  width: 800,
  height: 600,
  minWidth: 200,
  minHeight: 150,
  isOpen: true,
  state: 'normal',
  zIndex: 1,
};

const input: WindowInput = {
  title: 'Notepad',
  content: 'notepad',
  x: 100,
  y: 100,
  width: 800,
  height: 600,
  minWidth: 200,
  minHeight: 150,
};

describe('openWindow use case', () => {
  let manager: IWindowManager;

  beforeEach(() => {
    manager = createMockWindowManager();
    vi.mocked(manager.open).mockReturnValue(mockWindow);
  });

  it('should call manager.open with the provided input', () => {
    // Act
    openWindow(manager, input);

    // Assert
    expect(manager.open).toHaveBeenCalledWith(input);
  });

  it('should return the window created by the manager', () => {
    // Act
    const result = openWindow(manager, input);

    // Assert
    expect(result).toBe(mockWindow);
  });
});
