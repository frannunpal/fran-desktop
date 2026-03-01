import { vi } from 'vitest';
import type { StoreApi, UseBoundStore } from 'zustand';
import type { DesktopState } from '@/Shared/Interfaces/IDesktopState';

type LocalStorageMock = { clear: () => void };

export const resetDesktopStore = (
  store: UseBoundStore<StoreApi<DesktopState>>,
  localStorageMock: LocalStorageMock,
  extraReset?: () => void,
) => {
  localStorageMock.clear();
  vi.clearAllMocks();
  extraReset?.();
  store.setState({ windows: [], icons: [], fsNodes: [] });
};
