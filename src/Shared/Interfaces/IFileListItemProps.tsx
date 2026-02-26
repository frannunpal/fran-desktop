import type { FSNode, FileNode } from '@/Domain';

export interface FileListItemProps {
  node: FSNode;
  onNavigate: ( id: string ) => void;
  onOpenFile: ( node: FileNode ) => void;
}
