import type { FSNode, FileNode, FolderNode } from '@domain/Entities/FileSystem';

export interface IFileSystem {
  getNode(id: string): FSNode | undefined;
  getChildren(folderId: string): FSNode[];
  createFile(name: string, content: string, parentId: string | null): FileNode;
  createFolder(name: string, parentId: string | null): FolderNode;
  updateFile(id: string, content: string): FileNode;
  delete(id: string): void;
  getRootNodes(): FSNode[];
}
