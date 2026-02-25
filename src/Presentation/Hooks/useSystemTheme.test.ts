// @vitest-environment jsdom
import '@application/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createLocalStorageMock } from '@application/__mocks__/localStorage.mock';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore } = await import('@presentation/Store/desktopStore');
const { useSystemTheme } = await import('./useSystemTheme');

const makeMatchMedia = (dark: boolean) =>
  ({
    matches: dark,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }) as unknown as MediaQueryList;

describe('useSystemTheme', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    useDesktopStore.getState().setThemeMode('light');
    useDesktopStore.setState({ windows: [], icons: [], fsNodes: [] });
  });

  it('should set dark mode when system prefers dark', () => {
    // Arrange
    vi.stubGlobal('matchMedia', vi.fn(() => makeMatchMedia(true)));

    // Act
    renderHook(() => useSystemTheme());

    // Assert
    expect(useDesktopStore.getState().theme.mode).toBe('dark');
  });

  it('should set light mode when system prefers light', () => {
    // Arrange
    vi.stubGlobal('matchMedia', vi.fn(() => makeMatchMedia(false)));

    // Act
    renderHook(() => useSystemTheme());

    // Assert
    expect(useDesktopStore.getState().theme.mode).toBe('light');
  });

  it('should add a change event listener on mount', () => {
    // Arrange
    const mq = makeMatchMedia(false);
    vi.stubGlobal('matchMedia', vi.fn(() => mq));

    // Act
    renderHook(() => useSystemTheme());

    // Assert
    expect(mq.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should remove the change event listener on unmount', () => {
    // Arrange
    const mq = makeMatchMedia(false);
    vi.stubGlobal('matchMedia', vi.fn(() => mq));

    // Act
    const { unmount } = renderHook(() => useSystemTheme());
    unmount();

    // Assert
    expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should switch to dark when a change event fires with dark match', () => {
    // Arrange
    let listener: ((e: MediaQueryListEvent) => void) | null = null;
    const mq = {
      matches: false,
      addEventListener: vi.fn((_: string, fn: (e: MediaQueryListEvent) => void) => { listener = fn; }),
      removeEventListener: vi.fn(),
    } as unknown as MediaQueryList;
    vi.stubGlobal('matchMedia', vi.fn(() => mq));

    renderHook(() => useSystemTheme());

    // Act — simulate OS switching to dark
    listener!({ matches: true } as MediaQueryListEvent);

    // Assert
    expect(useDesktopStore.getState().theme.mode).toBe('dark');
  });
});
