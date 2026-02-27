import type { FolderNode } from '@/Shared/Interfaces/FolderNode';

export interface FileIconProps {
  type: 'file' | 'folder';
  name?: string;
  folderNode?: FolderNode;
  size?: number;
}
