import { type FC, useCallback, useState } from 'react';
import { Text, Breadcrumbs, Anchor, Button, Group, UnstyledButton, TextInput } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import { sortNodes } from '@/Shared/Utils/sortNodes';
import { buildBreadcrumbs } from '@/Shared/Utils/buildBreadcrumbs';
import FileIcon from '@presentation/Components/Apps/FilesApp/components/FileIcon';
import classes from './FilePickerApp.module.css';

export interface FilePickerAppProps {
  /** Accepted mime types. Empty array or undefined means all files are accepted. */
  acceptedMimeTypes?: string[];
  /** Called with the selected FileNode when the user clicks Open */
  onConfirm: (node: FileNode) => void;
  /** Called when the user clicks Cancel */
  onCancel: () => void;
}

const FilePickerApp: FC<FilePickerAppProps> = ({ acceptedMimeTypes, onConfirm, onCancel }) => {
  const fsNodes = useDesktopStore(state => state.fsNodes);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);

  const currentNodes =
    currentFolderId === null
      ? fsNodes.filter(n => n.parentId === null)
      : fsNodes.filter(n => n.parentId === currentFolderId);

  const visibleNodes = currentNodes.filter(n => {
    if (n.type === 'folder') return true;
    const file = n as FileNode;
    if (!acceptedMimeTypes || acceptedMimeTypes.length === 0) return true;
    return acceptedMimeTypes.some(
      accepted =>
        file.mimeType === accepted ||
        (accepted.endsWith('/*') && file.mimeType.startsWith(accepted.slice(0, -1))),
    );
  });

  const rootFolders = fsNodes.filter(
    n => n.parentId === null && n.type === 'folder',
  ) as FolderNode[];

  const handleNavigate = useCallback((id: string | null) => {
    setCurrentFolderId(id);
    setSelectedNode(null);
  }, []);

  const handleItemClick = useCallback((node: (typeof visibleNodes)[number]) => {
    if (node.type === 'file') {
      setSelectedNode(node as FileNode);
    }
  }, []);

  const handleItemDoubleClick = useCallback(
    (node: (typeof visibleNodes)[number]) => {
      if (node.type === 'folder') {
        handleNavigate(node.id);
      } else {
        onConfirm(node as FileNode);
      }
    },
    [handleNavigate, onConfirm],
  );

  const crumbs = buildBreadcrumbs(currentFolderId, fsNodes);

  return (
    <div className={classes.root}>
      {/* Breadcrumb */}
      <div className={classes.breadcrumbBar}>
        <Breadcrumbs separator="›" classNames={{ separator: classes.breadcrumbSep }}>
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return isLast ? (
              <Text key={crumb.id ?? 'root'} size="xs" fw={500}>
                {crumb.name}
              </Text>
            ) : (
              <Anchor key={crumb.id ?? 'root'} size="xs" onClick={() => handleNavigate(crumb.id)}>
                {crumb.name}
              </Anchor>
            );
          })}
        </Breadcrumbs>
      </div>

      {/* Main layout */}
      <div className={classes.body}>
        {/* Sidebar */}
        <aside className={classes.sidebar}>
          <nav className={classes.folderTree} aria-label="Folder tree">
            <UnstyledButton
              className={classes.treeItem}
              data-active={currentFolderId === null || undefined}
              style={{ paddingLeft: 8 }}
              onClick={() => handleNavigate(null)}
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
                allNodes={fsNodes}
                currentFolderId={currentFolderId}
                depth={1}
                onNavigate={handleNavigate}
              />
            ))}
          </nav>
        </aside>

        {/* File list */}
        <main className={classes.content}>
          {visibleNodes.length === 0 ? (
            <div className={classes.empty}>
              <Text size="sm" c="dimmed">
                {currentNodes.length === 0 ? 'This folder is empty' : 'No matching files'}
              </Text>
            </div>
          ) : (
            <div className={classes.grid} role="listbox" aria-label="Files">
              {sortNodes(visibleNodes).map(node => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <UnstyledButton
                    key={node.id}
                    className={classes.item}
                    data-selected={isSelected || undefined}
                    data-type={node.type}
                    onClick={() => handleItemClick(node)}
                    onDoubleClick={() => handleItemDoubleClick(node)}
                    aria-label={
                      node.type === 'folder'
                        ? `Open folder ${node.name}`
                        : `Select file ${node.name}`
                    }
                    aria-selected={node.type === 'file' ? isSelected : undefined}
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
              })}
            </div>
          )}
        </main>
      </div>

      {/* Action bar */}
      <div className={classes.actionBar}>
        <Text size="xs" c="dimmed" truncate className={classes.selectedLabel}>
          {selectedNode ? selectedNode.name : 'No file selected'}
        </Text>
        <Group gap="xs">
          <Button variant="default" size="xs" onClick={onCancel} aria-label="Cancel">
            Cancel
          </Button>
          <Button
            size="xs"
            disabled={!selectedNode}
            onClick={() => selectedNode && onConfirm(selectedNode)}
            aria-label="Open selected file"
          >
            Open
          </Button>
        </Group>
      </div>
    </div>
  );
};

/* ── Internal FolderTreeItem (mirrors FilesApp's FolderTree, but inline) ── */
interface FolderTreeItemProps {
  node: FolderNode;
  allNodes: ReturnType<typeof useDesktopStore.getState>['fsNodes'];
  currentFolderId: string | null;
  depth: number;
  onNavigate: (id: string | null) => void;
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
        className={`${classes.treeItem}`}
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

/* ── FilePickerModal ──────────────────────────────────────────────────────
 * Drop-in overlay for any app content area (requires position:relative on
 * the parent container). Usage:
 *
 *   <FilePickerModal
 *     opened={pickerOpen}
 *     acceptedMimeTypes={['image/*']}
 *     onConfirm={node => { ... }}
 *     onCancel={() => setPickerOpen(false)}
 *   />
 * ─────────────────────────────────────────────────────────────────────── */
export interface FilePickerModalProps extends FilePickerAppProps {
  opened: boolean;
}

export const FilePickerModal: FC<FilePickerModalProps> = ({ opened, ...pickerProps }) => {
  if (!opened) return null;
  return (
    <div className={classes.overlay} role="dialog" aria-label="Open file">
      <div className={classes.panel}>
        <FilePickerApp {...pickerProps} />
      </div>
    </div>
  );
};

export default FilePickerApp;

/* ── FileSaveApp ──────────────────────────────────────────────────────────
 * Like FilePickerApp but for saving: lets the user pick a destination folder
 * and type a filename, then calls onConfirm({ parentId, name }).
 * ─────────────────────────────────────────────────────────────────────── */

export interface FileSaveResult {
  parentId: string | null;
  name: string;
}

export interface FileSaveAppProps {
  /** Initial filename shown in the input (e.g. current file name). */
  initialName?: string;
  /** Called when the user clicks Save */
  onConfirm: (result: FileSaveResult) => void;
  /** Called when the user clicks Cancel */
  onCancel: () => void;
}

const FileSaveApp: FC<FileSaveAppProps> = ({
  initialName = 'untitled.md',
  onConfirm,
  onCancel,
}) => {
  const fsNodes = useDesktopStore(state => state.fsNodes);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [fileName, setFileName] = useState(initialName);

  const currentFolderNodes = fsNodes.filter(n => n.parentId === currentFolderId);
  const visibleNodes = currentFolderNodes.filter(n => n.type === 'folder');

  const rootFolders = fsNodes.filter(
    n => n.parentId === null && n.type === 'folder',
  ) as FolderNode[];

  const handleNavigate = useCallback((id: string | null) => {
    setCurrentFolderId(id);
  }, []);

  const handleSave = useCallback(() => {
    const trimmed = fileName.trim();
    if (!trimmed) return;
    onConfirm({
      parentId: currentFolderId,
      name: trimmed.endsWith('.md') ? trimmed : `${trimmed}.md`,
    });
  }, [fileName, currentFolderId, onConfirm]);

  const crumbs = buildBreadcrumbs(currentFolderId, fsNodes);

  return (
    <div className={classes.root}>
      {/* Breadcrumb */}
      <div className={classes.breadcrumbBar}>
        <Breadcrumbs separator="›" classNames={{ separator: classes.breadcrumbSep }}>
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return isLast ? (
              <Text key={crumb.id ?? 'root'} size="xs" fw={500}>
                {crumb.name}
              </Text>
            ) : (
              <Anchor key={crumb.id ?? 'root'} size="xs" onClick={() => handleNavigate(crumb.id)}>
                {crumb.name}
              </Anchor>
            );
          })}
        </Breadcrumbs>
      </div>

      {/* Main layout */}
      <div className={classes.body}>
        {/* Sidebar */}
        <aside className={classes.sidebar}>
          <nav className={classes.folderTree} aria-label="Folder tree">
            <UnstyledButton
              className={classes.treeItem}
              data-active={currentFolderId === null || undefined}
              style={{ paddingLeft: 8 }}
              onClick={() => handleNavigate(null)}
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
                allNodes={fsNodes}
                currentFolderId={currentFolderId}
                depth={1}
                onNavigate={handleNavigate}
              />
            ))}
          </nav>
        </aside>

        {/* Folder content — only shows subfolders for navigation */}
        <main className={classes.content}>
          {visibleNodes.length === 0 ? (
            <div className={classes.empty}>
              <Text size="sm" c="dimmed">
                No subfolders
              </Text>
            </div>
          ) : (
            <div className={classes.grid} role="listbox" aria-label="Folders">
              {sortNodes(visibleNodes).map(node => (
                <UnstyledButton
                  key={node.id}
                  className={classes.item}
                  onDoubleClick={() => handleNavigate(node.id)}
                  aria-label={`Open folder ${node.name}`}
                  role="option"
                >
                  <div className={classes.icon}>
                    <FileIcon
                      type="folder"
                      name={node.name}
                      folderNode={node as FolderNode}
                      size={32}
                    />
                  </div>
                  <Text size="xs" className={classes.name} truncate>
                    {node.name}
                  </Text>
                </UnstyledButton>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Action bar with filename input */}
      <div className={classes.saveActionBar}>
        <TextInput
          size="xs"
          placeholder="filename.md"
          value={fileName}
          onChange={e => setFileName(e.currentTarget.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          aria-label="File name"
          className={classes.fileNameInput}
        />
        <Group gap="xs" style={{ flexShrink: 0 }}>
          <Button variant="default" size="xs" onClick={onCancel} aria-label="Cancel">
            Cancel
          </Button>
          <Button size="xs" disabled={!fileName.trim()} onClick={handleSave} aria-label="Save file">
            Save
          </Button>
        </Group>
      </div>
    </div>
  );
};

/* ── FileSaveModal ──────────────────────────────────────────────────────── */
export interface FileSaveModalProps extends FileSaveAppProps {
  opened: boolean;
}

export const FileSaveModal: FC<FileSaveModalProps> = ({ opened, ...saveProps }) => {
  if (!opened) return null;
  return (
    <div className={classes.overlay} role="dialog" aria-label="Save file">
      <div className={classes.panel}>
        <FileSaveApp {...saveProps} />
      </div>
    </div>
  );
};
