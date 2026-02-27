// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';

const VERSION_KEY = 'fran-desktop:version';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore, clearFileSystem } = await import('@presentation/Store/desktopStore');
const { useAppVersion, resetAppVersionFlag } = await import('./useAppVersion');

const makeFetchMock = (remoteSha: string, manifestFolders: string[] = []) =>
  vi.fn((url: string) => {
    if ((url as string).includes('version.json')) {
      return Promise.resolve({
        json: () => Promise.resolve({ sha: remoteSha, buildAt: '2026-02-27T00:00:00Z' }),
      });
    }
    if ((url as string).includes('fs-manifest.json')) {
      return Promise.resolve({
        json: () => Promise.resolve({ folders: manifestFolders, files: [] }),
      });
    }
    return Promise.reject(new Error(`Unknown URL: ${url}`));
  });

describe('useAppVersion', () => {
  beforeEach(() => {
    resetAppVersionFlag();
    localStorageMock.clear();
    vi.clearAllMocks();
    clearFileSystem();
    useDesktopStore.setState({ windows: [], icons: [], fsNodes: [], notifications: [] });
  });

  it('should do nothing when remote sha matches stored version', async () => {
    // Arrange
    localStorageMock.setItem(
      VERSION_KEY,
      JSON.stringify({ sha: 'abc123', buildAt: '2026-01-01T00:00:00Z' }),
    );
    vi.stubGlobal('fetch', makeFetchMock('abc123'));

    // Act
    await act(async () => {
      renderHook(() => useAppVersion());
    });

    // Assert
    expect(useDesktopStore.getState().notifications).toHaveLength(0);
  });

  it('should add update notification on first load (no stored version)', async () => {
    // Arrange — no stored version
    vi.stubGlobal('fetch', makeFetchMock('abc123'));

    // Act
    await act(async () => {
      renderHook(() => useAppVersion());
    });

    // Assert
    expect(useDesktopStore.getState().notifications.some(n => n.id === 'app-update')).toBe(true);
  });

  it('should add update notification when sha differs from stored version', async () => {
    // Arrange
    localStorageMock.setItem(
      VERSION_KEY,
      JSON.stringify({ sha: 'old111', buildAt: '2026-01-01T00:00:00Z' }),
    );
    vi.stubGlobal('fetch', makeFetchMock('new999'));

    // Act
    await act(async () => {
      renderHook(() => useAppVersion());
    });

    // Assert
    expect(useDesktopStore.getState().notifications.some(n => n.id === 'app-update')).toBe(true);
  });

  it('should not fetch fs-manifest when sha matches', async () => {
    // Arrange
    localStorageMock.setItem(
      VERSION_KEY,
      JSON.stringify({ sha: 'same', buildAt: '2026-01-01T00:00:00Z' }),
    );
    const fetchMock = makeFetchMock('same');
    vi.stubGlobal('fetch', fetchMock);

    // Act
    await act(async () => {
      renderHook(() => useAppVersion());
    });

    // Assert — only version.json was fetched, not fs-manifest.json
    const calls = fetchMock.mock.calls.map(c => c[0] as string);
    expect(calls.some(url => url.includes('fs-manifest.json'))).toBe(false);
  });

  it('should call mergeSeed and mergeDesktopApps when sha differs', async () => {
    // Arrange
    localStorageMock.setItem(
      VERSION_KEY,
      JSON.stringify({ sha: 'old', buildAt: '2026-01-01T00:00:00Z' }),
    );
    vi.stubGlobal('fetch', makeFetchMock('new', ['Desktop']));
    const mergeSeedSpy = vi.fn();
    const mergeDesktopAppsSpy = vi.fn();
    const addNotificationSpy = vi.fn();
    useDesktopStore.setState({
      mergeSeed: mergeSeedSpy,
      mergeDesktopApps: mergeDesktopAppsSpy,
      addNotification: addNotificationSpy,
    } as unknown as Parameters<typeof useDesktopStore.setState>[0]);

    // Act
    await act(async () => {
      renderHook(() => useAppVersion());
    });

    // Assert
    expect(mergeSeedSpy).toHaveBeenCalledOnce();
    expect(mergeDesktopAppsSpy).toHaveBeenCalledOnce();
    expect(addNotificationSpy).toHaveBeenCalledOnce();
  });

  it('should write the new version to localStorage after a successful update', async () => {
    // Arrange
    vi.stubGlobal('fetch', makeFetchMock('newsha'));

    // Act
    await act(async () => {
      renderHook(() => useAppVersion());
    });

    // Assert
    const stored = JSON.parse(localStorageMock.getItem(VERSION_KEY) ?? 'null') as {
      sha: string;
    } | null;
    expect(stored?.sha).toBe('newsha');
  });

  it('should handle fetch errors silently (no notification added)', async () => {
    // Arrange
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network error'))),
    );

    // Act
    await act(async () => {
      renderHook(() => useAppVersion());
    });

    // Assert
    expect(useDesktopStore.getState().notifications).toHaveLength(0);
  });

  it('should not run the check twice when mounted again (module-level guard)', async () => {
    // Arrange
    const fetchMock = makeFetchMock('abc');
    vi.stubGlobal('fetch', fetchMock);

    // Act — mount the hook twice (same module instance, flag already set after first run)
    await act(async () => {
      renderHook(() => useAppVersion());
    });
    await act(async () => {
      renderHook(() => useAppVersion());
    });

    // Assert — version.json was fetched only once
    const versionFetchCalls = fetchMock.mock.calls.filter(c =>
      (c[0] as string).includes('version.json'),
    );
    expect(versionFetchCalls).toHaveLength(1);
  });
});
