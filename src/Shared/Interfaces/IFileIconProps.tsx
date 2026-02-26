import type { FolderNode } from '@/Domain';

export interface FileIconProps {
  type: 'file' | 'folder';
  name?: string;
  folderNode?: FolderNode;
  size?: number;
}
