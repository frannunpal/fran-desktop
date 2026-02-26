import type { WindowEntity, WindowInput } from '@domain/Entities/Window';
import type { FSNode, FileNode, FolderNode } from '@domain/Entities/FileSystem';
import type { Theme, ThemeMode } from '@application/Ports/IThemeProvider';
import type { DesktopIconEntity, DesktopIconInput } from '@domain/Entities/DesktopIcon';

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
  createFolder: (name: string, parentId: string | null) => FolderNode;
  updateFile: (id: string, content: string) => void;
  deleteNode: (id: string) => void;

  // Theme slice
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}
