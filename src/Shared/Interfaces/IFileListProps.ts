import type { FSNode, FileNode } from '@/Domain';

export interface FileListProps {
  nodes: FSNode[];
  onNavigate: (id: string) => void;
  onOpenFile: (node: FileNode) => void;
}
