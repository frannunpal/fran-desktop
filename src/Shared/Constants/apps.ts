export type { AppEntry } from '@shared/Interfaces/AppEntry';
import type { AppEntry } from '@shared/Interfaces/AppEntry';

export const DEFAULT_WINDOW_DIMENSIONS = {
  defaultWidth: 600,
  defaultHeight: 400,
  minWidth: 300,
  minHeight: 200,
} as const;

export const APPS: AppEntry[] = [
  {
    id: 'notepad',
    name: 'Notepad',
    icon: '📝',
    fcIcon: 'FcEditImage',
    ...DEFAULT_WINDOW_DIMENSIONS,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    fcIcon: 'FcCommandLine',
    ...DEFAULT_WINDOW_DIMENSIONS,
  },
  {
    id: 'files',
    name: 'Files',
    icon: '📁',
    fcIcon: 'FcOpenedFolder',
    ...DEFAULT_WINDOW_DIMENSIONS,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    fcIcon: 'FcSettings',
    ...DEFAULT_WINDOW_DIMENSIONS,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: '📅',
    fcIcon: 'FcCalendar',
    defaultWidth: 340,
    defaultHeight: 380,
    minWidth: 320,
    minHeight: 360,
    canMaximize: false,
  },
];
