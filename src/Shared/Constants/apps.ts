export type { AppEntry } from '@/Shared/Interfaces/IAppEntry';
import type { AppEntry } from '@/Shared/Interfaces/IAppEntry';

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
    name: 'FilesApp',
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
    id: 'pdf',
    name: 'CV',
    icon: '📄',
    fcIcon: 'FcDocument',
    defaultWidth: 780,
    defaultHeight: 580,
    minWidth: 500,
    minHeight: 400,
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
  {
    id: 'createItem',
    name: 'Create',
    icon: '➕',
    fcIcon: 'FcAddDatabase',
    defaultWidth: 400,
    defaultHeight: 300,
    minWidth: 350,
    minHeight: 250,
    canMaximize: false,
    alwaysOnTop: true,
  },
];
