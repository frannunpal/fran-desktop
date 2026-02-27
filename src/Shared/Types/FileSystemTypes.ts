import type { FileNode } from '@/Shared/Interfaces/FileNode';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';

export type FileSystemNodeType = 'file' | 'folder';

export type FSNode = FileNode | FolderNode;
