import { type FC, useCallback, useState, useEffect } from 'react';
import { Text, Breadcrumbs, Anchor } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import { useOpenApp } from '@presentation/Hooks/useOpenApp';
import { getAppIdForMime } from '@/Shared/Utils/getAppIdForMime';
import FolderTree from './components/FolderTree';
import FileList from './components/FileList';
import classes from './FilesApp.module.css';

interface FilesAppProps {
  initialFolderId?: string | null;
}

const FilesApp: FC<FilesAppProps> = ({ initialFolderId = null }) => {
  const fsNodes = useDesktopStore(state => state.fsNodes);
  const openContextMenu = useDesktopStore(state => state.openContextMenu);
  const setFilesCurrentFolderId = useDesktopStore(state => state.setFilesCurrentFolderId);
  const openApp = useOpenApp();
  const [currentFolderId, setCurrentFolderIdLocal] = useState<string | null>(initialFolderId);

  const setCurrentFolderId = useCallback(
    (id: string | null) => {
      setCurrentFolderIdLocal(id);
      setFilesCurrentFolderId(id);
    },
    [setFilesCurrentFolderId],
  );

  useEffect(() => {
    setFilesCurrentFolderId(initialFolderId);
  }, [initialFolderId, setFilesCurrentFolderId]);

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
      const appId = getAppIdForMime(node.mimeType);
      if (appId !== 'files') {
        openApp(appId, { contentData: { src: node.url ?? node.name } });
      }
    },
    [openApp],
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
