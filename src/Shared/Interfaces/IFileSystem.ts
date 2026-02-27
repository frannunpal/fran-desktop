import type { FSNode } from '@/Shared/Types/FileSystemTypes';
import type { FileNode } from './FileNode';
import type { FolderNode } from './FolderNode';

export interface IFileSystem {
  getNode(id: string): FSNode | undefined;
  getChildren(folderId: string): FSNode[];
  createFile(name: string, content: string, parentId: string | null): FileNode;
  createFolder(
    name: string,
    parentId: string | null,
    iconName?: string,
    iconColor?: string,
  ): FolderNode;
  updateFile(id: string, content: string): FileNode;
  move(id: string, newParentId: string | null): FSNode;
  delete(id: string): void;
  getRootNodes(): FSNode[];
  getAllNodes(): FSNode[];
}
