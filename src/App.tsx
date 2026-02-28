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
import CalendarApp from '@presentation/Components/CalendarApp/CalendarApp';
import PdfApp from '@presentation/Components/PdfApp/PdfApp';
import FilesApp from '@presentation/Components/FilesApp/FilesApp';
import CreateItemApp from '@presentation/Components/Shared/CreateItemApp/CreateItemApp';
import StorybookApp from '@presentation/Components/StorybookApp/StorybookApp';
import CreateItemContextMenu from '@presentation/Components/ContextMenu/CreateItemContextMenu';
import { useSystemTheme } from '@presentation/Hooks/useSystemTheme';
import { useAppVersion } from '@presentation/Hooks/useAppVersion';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';
import { APPS, DEFAULT_WINDOW_DIMENSIONS } from '@shared/Constants/apps';
import { randomWindowPosition } from '@shared/Constants/Animations';

let seedStarted = false;

function App() {
  const theme = useDesktopStore(state => state.theme);
  const windows = useDesktopStore(state => state.windows);
  const icons = useDesktopStore(state => state.icons);
  const openWindow = useDesktopStore(state => state.openWindow);
  const initFs = useDesktopStore(state => state.initFs);
  const fsNodes = useDesktopStore(state => state.fsNodes);
  const openContextMenu = useDesktopStore(state => state.openContextMenu);
  const filesCurrentFolderId = useDesktopStore(state => state.filesCurrentFolderId);
  const desktopFolderId = useDesktopStore(state => state.desktopFolderId);

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
    const pdf = APPS.find(a => a.id === 'pdf')!;
    if (windows.length === 0) {
      openWindow({
        title: pdf.name,
        content: pdf.id,
        icon: pdf.icon,
        fcIcon: pdf.fcIcon,
        x: 120,
        y: 80,
        width: pdf.defaultWidth ?? DEFAULT_WINDOW_DIMENSIONS.defaultWidth,
        height: pdf.defaultHeight ?? DEFAULT_WINDOW_DIMENSIONS.defaultHeight,
        minWidth: pdf.minWidth ?? DEFAULT_WINDOW_DIMENSIONS.minWidth,
        minHeight: pdf.minHeight ?? DEFAULT_WINDOW_DIMENSIONS.minHeight,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenApp = useCallback(
    (appId: string, nodeId?: string) => {
      const app = APPS.find(a => a.id === appId);
      const { x, y } = randomWindowPosition();
      const contentData: Record<string, unknown> | undefined =
        appId === 'files' && nodeId ? { initialFolderId: nodeId } : undefined;
      openWindow({
        title: app?.name ?? appId.charAt(0).toUpperCase() + appId.slice(1),
        content: appId,
        icon: app?.icon,
        fcIcon: app?.fcIcon,
        canMaximize: app?.canMaximize,
        x,
        y,
        width: app?.defaultWidth ?? DEFAULT_WINDOW_DIMENSIONS.defaultWidth,
        height: app?.defaultHeight ?? DEFAULT_WINDOW_DIMENSIONS.defaultHeight,
        minWidth: app?.minWidth ?? DEFAULT_WINDOW_DIMENSIONS.minWidth,
        minHeight: app?.minHeight ?? DEFAULT_WINDOW_DIMENSIONS.minHeight,
        contentData,
      });
    },
    [openWindow],
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
