// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

vi.mock('@shared/Constants/Animations', () => ({
  randomWindowPosition: () => ({ x: 100, y: 200 }),
  panelVariants: {},
}));

const { useDesktopStore } = await import('@presentation/Store/desktopStore');
const { useOpenApp } = await import('./useOpenApp');

describe('useOpenApp', () => {
  beforeEach(() => {
    resetDesktopStore(useDesktopStore, localStorageMock);
  });

  it('should open a window with app metadata when a known appId is provided', () => {
    // Arrange
    const { result } = renderHook(() => useOpenApp());

    // Act
    act(() => result.current('notepad'));

    // Assert
    const windows = useDesktopStore.getState().windows;
    expect(windows).toHaveLength(1);
    expect(windows[0].title).toBe('Notepad');
    expect(windows[0].content).toBe('notepad');
  });

  it('should use a capitalised appId as title when the appId is unknown', () => {
    // Arrange
    const { result } = renderHook(() => useOpenApp());

    // Act
    act(() => result.current('unknown'));

    // Assert
    const windows = useDesktopStore.getState().windows;
    expect(windows[0].title).toBe('Unknown');
  });

  it('should pass contentData to the window', () => {
    // Arrange
    const { result } = renderHook(() => useOpenApp());
    const contentData = { initialFolderId: 'folder-1' };

    // Act
    act(() => result.current('files', { contentData }));

    // Assert
    const windows = useDesktopStore.getState().windows;
    expect(windows[0].contentData).toEqual(contentData);
  });

  it('should use the provided position instead of a random one', () => {
    // Arrange
    const { result } = renderHook(() => useOpenApp());

    // Act
    act(() => result.current('notepad', { position: { x: 50, y: 75 } }));

    // Assert
    const windows = useDesktopStore.getState().windows;
    expect(windows[0].x).toBe(50);
    expect(windows[0].y).toBe(75);
  });
});
