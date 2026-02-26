import type { FileSystemNodeType } from '@/Domain/Entities/FileSystem';

export interface FileSystemNode {
  id: string;
  name: string;
  type: FileSystemNodeType;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
