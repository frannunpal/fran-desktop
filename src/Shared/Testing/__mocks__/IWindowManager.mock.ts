import { vi } from 'vitest';
import type { IWindowManager } from '@/Shared/Interfaces/IWindowManager';

export const createMockWindowManager = (): IWindowManager => ({
  getAll: vi.fn(),
  getById: vi.fn(),
  open: vi.fn(),
  close: vi.fn(),
  minimize: vi.fn(),
  maximize: vi.fn(),
  restore: vi.fn(),
  focus: vi.fn(),
  move: vi.fn(),
  resize: vi.fn(),
  loadWindows: vi.fn(),
});
