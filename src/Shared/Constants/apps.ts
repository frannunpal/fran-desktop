export type { AppEntry } from '@/Shared/Interfaces/IAppEntry';
import type { AppEntry } from '@/Shared/Interfaces/IAppEntry';

export const DEFAULT_WINDOW_DIMENSIONS = {
  defaultWidth: 800,
  defaultHeight: 600,
  minWidth: 640,
  minHeight: 480,
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
    name: 'PDF Viewer',
    icon: '📄',
    fcIcon: 'FcDocument',
    defaultWidth: 780,
    defaultHeight: 580,
    minWidth: 640,
    minHeight: 480,
  },
  {
    id: 'calendar',
    name: 'Calendar',
    icon: '📅',
    fcIcon: 'FcCalendar',
    defaultWidth: 640,
    defaultHeight: 480,
    minWidth: 640,
    minHeight: 480,
    canMaximize: false,
  },
  {
    id: 'storybook',
    name: 'Storybook',
    icon: '📖',
    fcIcon: 'FcReading',
    defaultWidth: 1100,
    defaultHeight: 700,
    minWidth: 640,
    minHeight: 480,
  },
  {
    id: 'image-viewer',
    name: 'Image Viewer',
    icon: '🖼️',
    fcIcon: 'FcPicture',
    defaultWidth: 700,
    defaultHeight: 520,
    minWidth: 640,
    minHeight: 480,
  },
];
