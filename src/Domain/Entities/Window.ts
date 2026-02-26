export type WindowState = 'normal' | 'minimized' | 'maximized';

export interface WindowEntity {
  id: string;
  title: string;
  content: string; // app identifier
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isOpen: boolean;
  state: WindowState;
  zIndex: number;
  icon?: string;
  fcIcon?: string;
  canMaximize?: boolean;
}

export type WindowInput = Omit<WindowEntity, 'id' | 'isOpen' | 'state' | 'zIndex'>;

export const createWindow = (input: WindowInput): WindowEntity => ({
  ...input,
  id: crypto.randomUUID(),
  isOpen: true,
  state: 'normal',
  zIndex: 0,
});
