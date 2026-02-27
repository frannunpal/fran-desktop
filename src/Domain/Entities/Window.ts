import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';
export type { WindowState, WindowInput } from '@/Shared/Types/WindowTypes';
import type { WindowInput } from '@/Shared/Types/WindowTypes';

export const createWindow = (input: WindowInput): WindowEntity => ({
  alwaysOnTop: false,
  ...input,
  id: crypto.randomUUID(),
  isOpen: true,
  state: 'normal',
  zIndex: 0,
});
