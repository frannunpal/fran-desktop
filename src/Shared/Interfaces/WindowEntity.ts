import type { WindowState } from '@/Shared/Types/WindowTypes';

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
  contentData?: Record<string, unknown>;
}
