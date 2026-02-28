import type { FSNode } from '@/Shared/Types/FileSystemTypes';
import type { FileNode } from '@/Shared/Interfaces/FileNode';

export interface FileListItemProps {
  node: FSNode;
  onNavigate: (id: string) => void;
  onOpenFile: (node: FileNode) => void;
}
