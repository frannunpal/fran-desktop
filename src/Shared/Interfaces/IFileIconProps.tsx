import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import type { FileNode } from '@/Shared/Interfaces/FileNode';

export interface FileIconProps {
  type: 'file' | 'folder';
  name?: string;
  folderNode?: FolderNode;
  fileNode?: FileNode;
  size?: number;
  iconName: string;
}
