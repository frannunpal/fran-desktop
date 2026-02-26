export type { AppEntry } from '@shared/Interfaces/AppEntry';
import type { AppEntry } from '@shared/Interfaces/AppEntry';

export const APPS: AppEntry[] = [
  { id: 'notepad', name: 'Notepad', icon: '📝', defaultWidth: 600, defaultHeight: 400, minWidth: 300, minHeight: 200 },
  { id: 'terminal', name: 'Terminal', icon: '💻', defaultWidth: 600, defaultHeight: 400, minWidth: 300, minHeight: 200 },
  { id: 'files', name: 'Files', icon: '📁', defaultWidth: 600, defaultHeight: 400, minWidth: 300, minHeight: 200 },
  { id: 'settings', name: 'Settings', icon: '⚙️', defaultWidth: 600, defaultHeight: 400, minWidth: 300, minHeight: 200 },
];
