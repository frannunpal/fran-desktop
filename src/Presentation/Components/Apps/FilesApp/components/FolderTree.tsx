import type { FC } from 'react';
import { Text, UnstyledButton } from '@mantine/core';
import type { FSNode } from '@domain/Entities/FileSystem';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import FileIcon from './FileIcon';
import classes from './FolderTree.module.css';

interface FolderTreeItemProps {
  node: FolderNode;
  allNodes: FSNode[];
  currentFolderId: string | null;
  depth: number;
  onNavigate: (id: string) => void;
}

const FolderTreeItem: FC<FolderTreeItemProps> = ({
  node,
  allNodes,
  currentFolderId,
  depth,
  onNavigate,
}) => {
  const children = allNodes.filter(
    n => n.parentId === node.id && n.type === 'folder',
  ) as FolderNode[];

  return (
    <>
      <UnstyledButton
        className={classes.item}
        data-active={currentFolderId === node.id || undefined}
        style={{ paddingLeft: 8 + depth * 14 }}
        onClick={() => onNavigate(node.id)}
        aria-label={node.name}
        aria-current={currentFolderId === node.id ? 'page' : undefined}
      >
        <FileIcon type="folder" folderNode={node} size={14} />
        <Text size="xs" ml={6} truncate>
          {node.name}
        </Text>
      </UnstyledButton>
      {children.map(child => (
        <FolderTreeItem
          key={child.id}
          node={child}
          allNodes={allNodes}
          currentFolderId={currentFolderId}
          depth={depth + 1}
          onNavigate={onNavigate}
        />
      ))}
    </>
  );
};

interface FolderTreeProps {
  allNodes: FSNode[];
  currentFolderId: string | null;
  onNavigate: (id: string | null) => void;
}

const FolderTree: FC<FolderTreeProps> = ({ allNodes, currentFolderId, onNavigate }) => {
  const rootFolders = allNodes.filter(
    n => n.parentId === null && n.type === 'folder',
  ) as FolderNode[];

  return (
    <nav className={classes.root} aria-label="Folder tree">
      <UnstyledButton
        className={classes.item}
        data-active={currentFolderId === null || undefined}
        style={{ paddingLeft: 8 }}
        onClick={() => onNavigate(null)}
        aria-label="Home"
        aria-current={currentFolderId === null ? 'page' : undefined}
      >
        <FileIcon type="folder" size={14} />
        <Text size="xs" ml={6} fw={500}>
          Home
        </Text>
      </UnstyledButton>
      {rootFolders.map(folder => (
        <FolderTreeItem
          key={folder.id}
          node={folder}
          allNodes={allNodes}
          currentFolderId={currentFolderId}
          depth={1}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
};

export default FolderTree;
