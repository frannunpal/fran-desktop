import type { FileSystemNodeType } from '@/Shared/Types/FileSystemTypes';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileSystemNodeType;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
