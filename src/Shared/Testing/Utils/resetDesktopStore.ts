import { vi } from 'vitest';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { DesktopState } from '@shared/Interfaces/DesktopState';

type LocalStorageMock = { clear: () => void };

export const resetDesktopStore = (
  store: UseBoundStore<StoreApi<DesktopState>>,
  localStorageMock: LocalStorageMock,
) => {
  localStorageMock.clear();
  vi.clearAllMocks();
  store.getState().setThemeMode('light');
  store.setState({ windows: [], icons: [], fsNodes: [] });
};
