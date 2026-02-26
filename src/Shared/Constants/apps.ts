export type { AppEntry } from '@shared/Interfaces/AppEntry';
import type { AppEntry } from '@shared/Interfaces/AppEntry';

export const DEFAULT_WINDOW_DIMENSIONS = {
  defaultWidth: 600,
  defaultHeight: 400,
  minWidth: 300,
  minHeight: 200,
} as const;

export const APPS: AppEntry[] = [
  { id: 'notepad', name: 'Notepad', icon: '📝', ...DEFAULT_WINDOW_DIMENSIONS },
  { id: 'terminal', name: 'Terminal', icon: '💻', ...DEFAULT_WINDOW_DIMENSIONS },
  { id: 'files', name: 'Files', icon: '📁', ...DEFAULT_WINDOW_DIMENSIONS },
  { id: 'settings', name: 'Settings', icon: '⚙️', ...DEFAULT_WINDOW_DIMENSIONS },
];
