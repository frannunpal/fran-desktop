export type FileSystemNodeType = 'file' | 'folder';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileSystemNodeType;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileNode extends FileSystemNode {
  type: 'file';
  content: string;
  mimeType: string;
}

export interface FolderNode extends FileSystemNode {
  type: 'folder';
  children: string[]; // child node ids
}

export type FSNode = FileNode | FolderNode;

export const createFolder = (name: string, parentId: string | null = null): FolderNode => ({
  id: crypto.randomUUID(),
  name,
  type: 'folder',
  parentId,
  children: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createFile = (
  name: string,
  content: string,
  parentId: string | null = null,
  mimeType = 'text/plain',
): FileNode => ({
  id: crypto.randomUUID(),
  name,
  type: 'file',
  content,
  mimeType,
  parentId,
  createdAt: new Date(),
  updatedAt: new Date(),
});
