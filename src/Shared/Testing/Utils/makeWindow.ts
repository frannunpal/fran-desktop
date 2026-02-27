import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';

export const makeWindow = (overrides: Partial<WindowEntity> = {}): WindowEntity => ({
  id: 'win-1',
  title: 'Test Window',
  content: 'notepad',
  x: 100,
  y: 100,
  width: 800,
  height: 600,
  minWidth: 200,
  minHeight: 150,
  isOpen: true,
  state: 'normal',
  zIndex: 1,
  ...overrides,
});
