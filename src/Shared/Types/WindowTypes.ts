import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';

export type WindowState = 'normal' | 'minimized' | 'maximized';

export type WindowInput = Omit<WindowEntity, 'id' | 'isOpen' | 'state' | 'zIndex'>;
