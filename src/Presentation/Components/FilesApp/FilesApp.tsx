import { type FC, useCallback, useState } from 'react';
import { Text, Breadcrumbs, Anchor } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import { APPS, DEFAULT_WINDOW_DIMENSIONS } from '@shared/Constants/apps';
import { randomWindowPosition } from '@shared/Constants/Animations';
import FolderTree from './components/FolderTree';
import FileList from './components/FileList';
import classes from './FilesApp.module.css';

interface FilesAppProps {
  initialFolderId?: string | null;
}

const FilesApp: FC<FilesAppProps> = ({ initialFolderId = null }) => {
  const fsNodes = useDesktopStore(state => state.fsNodes);
  const openWindow = useDesktopStore(state => state.openWindow);
  const openContextMenu = useDesktopStore(state => state.openContextMenu);
  const setFilesCurrentFolderId = useDesktopStore(state => state.setFilesCurrentFolderId);
  const [currentFolderId, setCurrentFolderIdLocal] = useState<string | null>(initialFolderId);

  const setCurrentFolderId = useCallback(
    (id: string | null) => {
      setCurrentFolderIdLocal(id);
      setFilesCurrentFolderId(id);
    },
    [setFilesCurrentFolderId],
  );

  const currentNodes =
    currentFolderId === null
      ? fsNodes.filter(n => n.parentId === null)
      : fsNodes.filter(n => n.parentId === currentFolderId);

  const buildBreadcrumbs = (): Array<{ id: string | null; name: string }> => {
    const crumbs: Array<{ id: string | null; name: string }> = [{ id: null, name: 'Home' }];
    let id: string | null = currentFolderId;
    const trail: typeof crumbs = [];
    while (id !== null) {
      const node = fsNodes.find(n => n.id === id);
      if (!node) break;
      trail.unshift({ id: node.id, name: node.name });
      id = node.parentId;
    }
    return [...crumbs, ...trail];
  };

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenu(e.clientX, e.clientY, 'files');
    },
    [openContextMenu],
  );

  const handleNodeContextMenu = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenu(e.clientX, e.clientY, 'files', nodeId);
    },
    [openContextMenu],
  );

  const handleOpenFile = useCallback(
    (node: FileNode) => {
      if (node.mimeType === 'application/pdf') {
        const app = APPS.find(a => a.id === 'pdf');
        const { x, y } = randomWindowPosition();
        openWindow({
          title: node.name,
          content: 'pdf',
          icon: app?.icon,
          fcIcon: app?.fcIcon,
          x,
          y,
          width: app?.defaultWidth ?? DEFAULT_WINDOW_DIMENSIONS.defaultWidth,
          height: app?.defaultHeight ?? DEFAULT_WINDOW_DIMENSIONS.defaultHeight,
          minWidth: app?.minWidth ?? DEFAULT_WINDOW_DIMENSIONS.minWidth,
          minHeight: app?.minHeight ?? DEFAULT_WINDOW_DIMENSIONS.minHeight,
          contentData: { src: node.url ?? node.name },
        });
      }
    },
    [openWindow],
  );

  const crumbs = buildBreadcrumbs();

  return (
    <div className={classes.root} onContextMenu={handleContextMenu}>
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
              <Anchor
                key={crumb.id ?? 'root'}
                size="xs"
                onClick={() => setCurrentFolderId(crumb.id)}
              >
                {crumb.name}
              </Anchor>
            );
          })}
        </Breadcrumbs>
      </div>

      {/* Main layout */}
      <div className={classes.body}>
        <aside className={classes.sidebar}>
          <FolderTree
            allNodes={fsNodes}
            currentFolderId={currentFolderId}
            onNavigate={setCurrentFolderId}
          />
        </aside>
        <main className={classes.content}>
          <FileList
            nodes={currentNodes}
            onNavigate={setCurrentFolderId}
            onOpenFile={handleOpenFile}
            onNodeContextMenu={handleNodeContextMenu}
          />
        </main>
      </div>
    </div>
  );
};

export default FilesApp;
