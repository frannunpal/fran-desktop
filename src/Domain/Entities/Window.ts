import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';

export type WindowState = 'normal' | 'minimized' | 'maximized';

export type WindowInput = Omit<WindowEntity, 'id' | 'isOpen' | 'state' | 'zIndex'>;

export const createWindow = (input: WindowInput): WindowEntity => ({
  ...input,
  id: crypto.randomUUID(),
  isOpen: true,
  state: 'normal',
  zIndex: 0,
});
