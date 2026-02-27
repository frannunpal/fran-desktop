import type { CreateFolderOptions } from '../../Shared/Interfaces/CreateFolderOptions';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
export type { FileSystemNodeType, FSNode } from '@/Shared/Types/FileSystemTypes';

export const createFolder = (
  name: string,
  parentId: string | null = null,
  options: CreateFolderOptions = {},
): FolderNode => ({
  id: crypto.randomUUID(),
  name,
  type: 'folder',
  parentId,
  children: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...options,
});

export const createFile = (
  name: string,
  content: string,
  parentId: string | null = null,
  mimeType = 'text/plain',
  url?: string,
): FileNode => ({
  id: crypto.randomUUID(),
  name,
  type: 'file',
  content,
  mimeType,
  parentId,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...(url !== undefined ? { url } : {}),
});
