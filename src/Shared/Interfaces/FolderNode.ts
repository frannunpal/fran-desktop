import type { FileSystemNode } from './FileSystemNode';

export interface FolderNode extends FileSystemNode {
  type: 'folder';
  children: string[];
  iconName?: string;
  iconColor?: string;
}
