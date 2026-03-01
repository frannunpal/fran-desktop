import type { WindowInput } from '@/Shared/Types/WindowTypes';
import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';
import type { FSNode } from '@/Shared/Types/FileSystemTypes';
import type { FileNode } from './FileNode';
import type { FolderNode } from './FolderNode';
import type { DesktopIconInput } from '@/Shared/Types/DesktopIconTypes';
import type { DesktopIconEntity } from '@/Shared/Interfaces/IDesktopIcon';
import type { FsManifest } from '@/Infrastructure/Adapters/LocalStorageFileSystem';

export type ClipboardAction = 'copy' | 'cut' | null;

export interface ClipboardState {
  content: FSNode[];
  action: ClipboardAction;
}

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
  desktopFolderId: string | null;
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
  moveNode: (id: string, newParentId: string | null) => void;

  // Clipboard slice
  clipboard: ClipboardState;
  copyToClipboard: (nodes: FSNode[]) => void;
  cutToClipboard: (nodes: FSNode[]) => void;
  clearClipboard: () => void;

  // Context menu slice
  contextMenu: { x: number; y: number; owner: string | null; targetNodeId?: string };
  openContextMenu: (x: number, y: number, owner: string, targetNodeId?: string) => void;
  closeContextMenu: () => void;

  // Files app slice
  filesCurrentFolderId: string | null;
  setFilesCurrentFolderId: (id: string | null) => void;

  // Update slice
  mergeSeed: (manifest: FsManifest) => void;
  mergeDesktopApps: (appIds: string[]) => void;

  // Notifications slice
  notifications: NotificationItem[];
  addNotification: (item: NotificationItem) => void;
  removeNotification: (id: string) => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  onClose?: () => void;
  fcIcon?: string;
}
