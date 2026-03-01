// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useSettingsStore } = await import('@presentation/Store/settingsStore');
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
    useSettingsStore.getState().setThemeMode('light');
    useSettingsStore.setState({ themeSetManually: false });
  });

  it('should set dark mode when system prefers dark', () => {
    // Arrange
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => makeMatchMedia(true)),
    );

    // Act
    renderHook(() => useSystemTheme());

    // Assert
    expect(useSettingsStore.getState().theme.mode).toBe('dark');
  });

  it('should set light mode when system prefers light', () => {
    // Arrange
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => makeMatchMedia(false)),
    );

    // Act
    renderHook(() => useSystemTheme());

    // Assert
    expect(useSettingsStore.getState().theme.mode).toBe('light');
  });

  it('should add a change event listener on mount', () => {
    // Arrange
    const mq = makeMatchMedia(false);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mq),
    );

    // Act
    renderHook(() => useSystemTheme());

    // Assert
    expect(mq.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should remove the change event listener on unmount', () => {
    // Arrange
    const mq = makeMatchMedia(false);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mq),
    );

    // Act
    const { unmount } = renderHook(() => useSystemTheme());
    unmount();

    // Assert
    expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should switch to dark when a change event fires with dark match', () => {
    useSettingsStore.setState({ themeSetManually: true });
    useSettingsStore.getState().setThemeMode('dark');

    // Assert
    expect(useSettingsStore.getState().theme.mode).toBe('dark');
  });
});
