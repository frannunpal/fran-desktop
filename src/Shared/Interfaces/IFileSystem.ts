import type { FSNode } from '@domain/Entities/FileSystem';
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
  delete(id: string): void;
  getRootNodes(): FSNode[];
  getAllNodes(): FSNode[];
}
