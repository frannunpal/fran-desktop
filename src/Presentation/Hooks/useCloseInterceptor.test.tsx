// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';

const localStorageMock = createLocalStorageMock();

vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore, resetWindowManager } = await import('@presentation/Store/desktopStore');
const { useCloseModalStore } = await import('@presentation/Store/closeModalStore');
const { useCloseInterceptor, getCloseInterceptor } =
  await import('@presentation/Hooks/useCloseInterceptor');

describe('useCloseInterceptor with modal store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    resetDesktopStore(useDesktopStore, localStorageMock, resetWindowManager);
    useCloseModalStore.getState().closeModal();
  });

  it('should register a close interceptor when window is mounted', () => {
    // Arrange
    const win = makeWindow({ id: 'win1', isOpen: true });
    const windowId = win.id;
    const isDirtyGetter = vi.fn(() => true);

    // Act
    renderHook(() =>
      useCloseInterceptor({
        isDirtyGetter,
        windowId,
        onDiscard: () => {},
      }),
    );

    // Assert
    const interceptor = getCloseInterceptor(windowId);
    expect(interceptor).toBeDefined();
  });

  it('should call openModal when close interceptor returns false (isDirty)', () => {
    // Arrange
    const win = makeWindow({ id: 'win1', isOpen: true });
    useDesktopStore.getState().openWindow(win);
    const windowId = win.id;
    const isDirtyGetter = vi.fn(() => true);
    const handleDiscard = vi.fn();

    renderHook(() =>
      useCloseInterceptor({
        isDirtyGetter,
        windowId,
        onDiscard: handleDiscard,
      }),
    );

    // Act - trigger the close interceptor
    const interceptor = getCloseInterceptor(windowId);
    if (interceptor) {
      const result = interceptor();
      // Should return false because isDirty is true
      expect(result).toBe(false);
    }

    // Assert - modal should be open
    const state = useCloseModalStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.windowId).toBe(windowId);
    expect(state.onSave).toBeDefined();
    expect(state.onDiscard).toBeDefined();
  });

  it('should not open modal when close interceptor returns true (not dirty)', () => {
    // Arrange
    const win = makeWindow({ id: 'win1', isOpen: true });
    useDesktopStore.getState().openWindow(win);
    const windowId = win.id;
    const isDirtyGetter = vi.fn(() => false);

    renderHook(() =>
      useCloseInterceptor({
        isDirtyGetter,
        windowId,
        onDiscard: () => {},
      }),
    );

    // Act - trigger the close interceptor
    const interceptor = getCloseInterceptor(windowId);
    if (interceptor) {
      const result = interceptor();
      // Should return true because isDirty is false
      expect(result).toBe(true);
    }

    // Assert - modal should NOT be open
    const state = useCloseModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.windowId).toBeNull();
  });

  it('should close modal when closeModal is called', () => {
    // Arrange - open the modal first
    useCloseModalStore.getState().openModal(
      'win1',
      () => {},
      () => {},
    );

    // Act
    useCloseModalStore.getState().closeModal();

    // Assert
    const state = useCloseModalStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.windowId).toBeNull();
    expect(state.onSave).toBeNull();
    expect(state.onDiscard).toBeNull();
  });
});
