import type { FC } from 'react';
import { Text, UnstyledButton } from '@mantine/core';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import FileIcon from './FileIcon';
import classes from './FileList.module.css';
import type { FileListProps, FileListItemProps } from '@/Shared/Interfaces/IFileListProps';

const FileListItem: FC<FileListItemProps> = ({ node, onNavigate, onOpenFile, onContextMenu }) => {
  const handleDoubleClick = () => {
    if (node.type === 'folder') {
      onNavigate(node.id);
    } else {
      onOpenFile(node as FileNode);
    }
  };

  const label = node.type === 'folder' ? `Open folder ${node.name}` : `Open file ${node.name}`;

  return (
    <UnstyledButton
      className={classes.item}
      onDoubleClick={handleDoubleClick}
      onContextMenu={e => onContextMenu(e, node.id)}
      aria-label={label}
      role="option"
    >
      <div className={classes.icon}>
        <FileIcon
          type={node.type}
          name={node.name}
          folderNode={node.type === 'folder' ? (node as FolderNode) : undefined}
          size={32}
        />
      </div>
      <Text size="xs" className={classes.name} truncate>
        {node.name}
      </Text>
    </UnstyledButton>
  );
};

const FileList: FC<FileListProps> = ({ nodes, onNavigate, onOpenFile, onNodeContextMenu }) => {
  if (nodes.length === 0) {
    return (
      <div className={classes.empty}>
        <Text size="sm" c="dimmed">
          This folder is empty
        </Text>
      </div>
    );
  }

  const folders = nodes.filter(n => n.type === 'folder');
  const files = nodes.filter(n => n.type === 'file');
  const sorted = [
    ...folders.sort((a, b) => a.name.localeCompare(b.name)),
    ...files.sort((a, b) => a.name.localeCompare(b.name)),
  ];

  return (
    <div className={classes.grid} role="listbox" aria-label="Files">
      {sorted.map(node => (
        <FileListItem
          key={node.id}
          node={node}
          onNavigate={onNavigate}
          onOpenFile={onOpenFile}
          onContextMenu={onNodeContextMenu}
        />
      ))}
    </div>
  );
};

export default FileList;
