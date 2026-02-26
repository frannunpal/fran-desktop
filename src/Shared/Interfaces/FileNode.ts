import type { FileSystemNode } from './FileSystemNode';

export interface FileNode extends FileSystemNode {
  type: 'file';
  content: string;
  mimeType: string;
  url?: string;
}
