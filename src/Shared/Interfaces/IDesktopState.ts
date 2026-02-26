import type { WindowInput } from '@domain/Entities/Window';
import type { WindowEntity } from "@/Shared/Interfaces/WindowEntity";
import type { FSNode } from '@domain/Entities/FileSystem';
import type { FileNode } from './FileNode';
import type { FolderNode } from './FolderNode';
import type { Theme, ThemeMode } from '@/Shared/Interfaces/IThemeProvider';
import type { DesktopIconInput } from '@domain/Entities/DesktopIcon';
import type { DesktopIconEntity } from '@/Shared/Interfaces/IDesktopIcon';

export interface DesktopState {
  // Window slice
  windows: WindowEntity[];
  openWindow: (input: WindowInput) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;

  // Desktop icons slice
  icons: DesktopIconEntity[];
  addIcon: (input: DesktopIconInput) => void;
  removeIcon: (id: string) => void;

  // FileSystem slice
  fsNodes: FSNode[];
  createFile: (name: string, content: string, parentId: string | null) => FileNode;
  createFolder: (
    name: string,
    parentId: string | null,
    iconName?: string,
    iconColor?: string,
  ) => FolderNode;
  initFs: () => Promise<void>;
  updateFile: (id: string, content: string) => void;
  deleteNode: (id: string) => void;

  // Theme slice
  theme: Theme;
  themeSetManually: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}
