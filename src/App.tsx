import '@mantine/core/styles.css';
import { useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MantineProvider } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { toMantineTheme } from '@infrastructure/Adapters/MantineThemeAdapter';
import DesktopArea from '@presentation/Components/DesktopArea/DesktopArea';
import Window from '@presentation/Components/Window/Window';
import Taskbar from '@presentation/Components/Taskbar/Taskbar';
import DesktopIcon from '@presentation/Components/DesktopIcon/DesktopIcon';
import CalendarApp from '@/Presentation/Components/Apps/CalendarApp/CalendarApp';
import PdfApp from '@/Presentation/Components/Apps/PdfApp/PdfApp';
import FilesApp from '@presentation/Components/Apps/FilesApp/FilesApp';
import CreateItemApp from '@presentation/Components/Shared/CreateItemApp/CreateItemApp';
import StorybookApp from '@/Presentation/Components/Apps/StorybookApp/StorybookApp';
import CreateItemContextMenu from '@presentation/Components/ContextMenu/CreateItemContextMenu';
import { useSystemTheme } from '@presentation/Hooks/useSystemTheme';
import { useAppVersion } from '@presentation/Hooks/useAppVersion';
import { useOpenApp } from '@presentation/Hooks/useOpenApp';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';

let seedStarted = false;

function App() {
  const theme = useDesktopStore(state => state.theme);
  const windows = useDesktopStore(state => state.windows);
  const icons = useDesktopStore(state => state.icons);
  const initFs = useDesktopStore(state => state.initFs);
  const fsNodes = useDesktopStore(state => state.fsNodes);
  const openContextMenu = useDesktopStore(state => state.openContextMenu);
  const filesCurrentFolderId = useDesktopStore(state => state.filesCurrentFolderId);
  const desktopFolderId = useDesktopStore(state => state.desktopFolderId);
  const openApp = useOpenApp();

  const handleDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      openContextMenu(e.clientX, e.clientY, 'desktop');
    },
    [openContextMenu],
  );

  const handleIconContextMenu = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenu(e.clientX, e.clientY, 'desktop', nodeId);
    },
    [openContextMenu],
  );

  useSystemTheme();
  useAppVersion();

  // Seed demo data and filesystem on first mount
  useEffect(() => {
    if (seedStarted) return;
    seedStarted = true;
    initFs();
    if (windows.length === 0) {
      openApp('pdf', { position: { x: 120, y: 80 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenApp = useCallback(
    (appId: string, nodeId?: string) => {
      const contentData: Record<string, unknown> | undefined =
        appId === 'files' && nodeId ? { initialFolderId: nodeId } : undefined;
      openApp(appId, { contentData });
    },
    [openApp],
  );

  const buildFilesPath = (): string => {
    const crumbs: string[] = ['/home'];
    let id: string | null = filesCurrentFolderId;
    const trail: string[] = [];
    while (id !== null) {
      const node = fsNodes.find(n => n.id === id);
      if (!node) break;
      trail.unshift(node.name);
      id = node.parentId;
    }
    return [...crumbs, ...trail].join('/');
  };

  return (
    <WindowButtonRegistryProvider>
      <MantineProvider theme={toMantineTheme(theme)} forceColorScheme={theme.mode}>
        <DesktopArea onContextMenu={handleDesktopContextMenu}>
          {icons.map(icon => (
            <DesktopIcon
              key={icon.id}
              icon={icon}
              onDoubleClick={handleOpenApp}
              onContextMenu={handleIconContextMenu}
            />
          ))}
          <AnimatePresence>
            {windows.map(win => (
              <Window key={win.id} window={win}>
                {win.content === 'calendar' && <CalendarApp />}
                {win.content === 'pdf' && (
                  <PdfApp src={win.contentData?.src as string | undefined} />
                )}
                {win.content === 'files' && (
                  <FilesApp
                    initialFolderId={win.contentData?.initialFolderId as string | null | undefined}
                  />
                )}
                {win.content === 'createItem' && (
                  <CreateItemApp
                    windowId={win.id}
                    mode={win.contentData?.mode as 'file' | 'folder'}
                    parentId={win.contentData?.parentId as string | null}
                    currentPath={win.contentData?.currentPath as string}
                  />
                )}
                {win.content === 'storybook' && <StorybookApp />}
              </Window>
            ))}
          </AnimatePresence>
        </DesktopArea>
        <Taskbar />
        <CreateItemContextMenu owner="desktop" parentId={desktopFolderId} currentPath="/home" />
        <CreateItemContextMenu
          owner="files"
          parentId={filesCurrentFolderId}
          currentPath={buildFilesPath()}
        />
      </MantineProvider>
    </WindowButtonRegistryProvider>
  );
}

export default App;
