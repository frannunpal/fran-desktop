import type { FSNode } from '@/Shared/Types/FileSystemTypes';
import type { FileNode } from '@/Shared/Interfaces/FileNode';

export interface FileListProps {
  nodes: FSNode[];
  onNavigate: (id: string) => void;
  onOpenFile: (node: FileNode) => void;
}
