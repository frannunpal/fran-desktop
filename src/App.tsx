import '@mantine/core/styles.css';
import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MantineProvider, Menu } from '@mantine/core';
import { VscNewFolder, VscNewFile } from 'react-icons/vsc';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { toMantineTheme } from '@infrastructure/Adapters/MantineThemeAdapter';
import DesktopArea from '@presentation/Components/DesktopArea/DesktopArea';
import Window from '@presentation/Components/Window/Window';
import Taskbar from '@presentation/Components/Taskbar/Taskbar';
import DesktopIcon from '@presentation/Components/DesktopIcon/DesktopIcon';
import CalendarApp from '@presentation/Components/CalendarApp/CalendarApp';
import PdfApp from '@presentation/Components/PdfApp/PdfApp';
import FilesApp from '@presentation/Components/FilesApp/FilesApp';
import CreateItemModal from '@presentation/Components/Shared/CreateItemModal/CreateItemModal';
import ContextMenuAnchor from '@presentation/Components/ContextMenu/ContextMenuAnchor';
import { useSystemTheme } from '@presentation/Hooks/useSystemTheme';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';
import { APPS, DEFAULT_WINDOW_DIMENSIONS } from '@shared/Constants/apps';
import { randomWindowPosition } from '@shared/Constants/Animations';
import type { FSNode } from '@domain/Entities/FileSystem';

const buildFilesPath = (folderId: string | null, nodes: FSNode[]): string => {
  const crumbs: string[] = ['/home'];
  let id: string | null = folderId;
  const trail: string[] = [];
  while (id !== null) {
    const node = nodes.find(n => n.id === id);
    if (!node) break;
    trail.unshift(node.name);
    id = node.parentId;
  }
  return [...crumbs, ...trail].join('/');
};

const DESKTOP_ICON_POSITIONS: Record<string, { x: number; y: number }> = {
  notepad: { x: 20, y: 20 },
  terminal: { x: 20, y: 120 },
  files: { x: 20, y: 220 },
};

function App() {
  const theme = useDesktopStore(state => state.theme);
  const windows = useDesktopStore(state => state.windows);
  const icons = useDesktopStore(state => state.icons);
  const openWindow = useDesktopStore(state => state.openWindow);
  const addIcon = useDesktopStore(state => state.addIcon);
  const initFs = useDesktopStore(state => state.initFs);
  const fsNodes = useDesktopStore(state => state.fsNodes);
  const createFile = useDesktopStore(state => state.createFile);
  const createFolder = useDesktopStore(state => state.createFolder);
  const contextMenu = useDesktopStore(state => state.contextMenu);
  const openContextMenu = useDesktopStore(state => state.openContextMenu);
  const closeContextMenu = useDesktopStore(state => state.closeContextMenu);
  const filesCurrentFolderId = useDesktopStore(state => state.filesCurrentFolderId);

  const [createModal, setCreateModal] = useState<{ opened: boolean; mode: 'file' | 'folder' }>({
    opened: false,
    mode: 'folder',
  });
  const [filesCreateModal, setFilesCreateModal] = useState<{
    opened: boolean;
    mode: 'file' | 'folder';
  }>({ opened: false, mode: 'folder' });

  const handleDesktopContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      openContextMenu(e.clientX, e.clientY, 'desktop');
    },
    [openContextMenu],
  );

  const openCreateModal = (mode: 'file' | 'folder') => {
    closeContextMenu();
    setCreateModal({ opened: true, mode });
  };

  const handleCreateConfirm = (name: string, iconName?: string, iconColor?: string) => {
    if (createModal.mode === 'folder') {
      createFolder(name, null, iconName, iconColor);
    } else {
      createFile(name, '', null);
    }
  };

  const openFilesCreateModal = (mode: 'file' | 'folder') => {
    closeContextMenu();
    setFilesCreateModal({ opened: true, mode });
  };

  const handleFilesCreateConfirm = (name: string, iconName?: string, iconColor?: string) => {
    if (filesCreateModal.mode === 'folder') {
      createFolder(name, filesCurrentFolderId, iconName, iconColor);
    } else {
      createFile(name, '', filesCurrentFolderId);
    }
  };

  useSystemTheme();

  // Seed demo data and filesystem on first mount
  useEffect(() => {
    initFs();
    const notepad = APPS.find(a => a.id === 'notepad')!;
    if (windows.length === 0) {
      openWindow({
        title: notepad.name,
        content: notepad.id,
        icon: notepad.icon,
        fcIcon: notepad.fcIcon,
        x: 120,
        y: 80,
        width: notepad.defaultWidth ?? DEFAULT_WINDOW_DIMENSIONS.defaultWidth,
        height: notepad.defaultHeight ?? DEFAULT_WINDOW_DIMENSIONS.defaultHeight,
        minWidth: notepad.minWidth ?? DEFAULT_WINDOW_DIMENSIONS.minWidth,
        minHeight: notepad.minHeight ?? DEFAULT_WINDOW_DIMENSIONS.minHeight,
      });
    }
    if (icons.length === 0) {
      APPS.filter(a => DESKTOP_ICON_POSITIONS[a.id]).forEach(a => {
        const pos = DESKTOP_ICON_POSITIONS[a.id];
        addIcon({ name: a.name, icon: a.icon, x: pos.x, y: pos.y, appId: a.id });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenApp = (appId: string) => {
    const app = APPS.find(a => a.id === appId);
    const { x, y } = randomWindowPosition();
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
    });
  };

  return (
    <WindowButtonRegistryProvider>
      <MantineProvider theme={toMantineTheme(theme)} forceColorScheme={theme.mode}>
        <DesktopArea onContextMenu={handleDesktopContextMenu}>
          {icons.map(icon => (
            <DesktopIcon key={icon.id} icon={icon} onDoubleClick={handleOpenApp} />
          ))}
          <AnimatePresence>
            {windows.map(win => (
              <Window key={win.id} window={win}>
                {win.content === 'calendar' && <CalendarApp />}
                {win.content === 'pdf' && (
                  <PdfApp src={win.contentData?.src as string | undefined} />
                )}
                {win.content === 'files' && <FilesApp />}
              </Window>
            ))}
          </AnimatePresence>
        </DesktopArea>
        <Taskbar />
        <Menu
          opened={contextMenu.owner === 'desktop'}
          onClose={closeContextMenu}
          closeOnClickOutside
          closeOnEscape
          closeOnItemClick
          withinPortal
          position="bottom-start"
        >
          <ContextMenuAnchor x={contextMenu.x} y={contextMenu.y} />
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<VscNewFolder size={14} />}
              onClick={() => openCreateModal('folder')}
            >
              Create folder
            </Menu.Item>
            <Menu.Item
              leftSection={<VscNewFile size={14} />}
              onClick={() => openCreateModal('file')}
            >
              Create new file
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <CreateItemModal
          opened={createModal.opened}
          mode={createModal.mode}
          currentPath="/home"
          onClose={() => setCreateModal(m => ({ ...m, opened: false }))}
          onConfirm={handleCreateConfirm}
        />
        <Menu
          opened={contextMenu.owner === 'files'}
          onClose={closeContextMenu}
          closeOnClickOutside
          closeOnEscape
          closeOnItemClick
          withinPortal
          position="bottom-start"
        >
          <ContextMenuAnchor x={contextMenu.x} y={contextMenu.y} />
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<VscNewFolder size={14} />}
              onClick={() => openFilesCreateModal('folder')}
            >
              Create folder
            </Menu.Item>
            <Menu.Item
              leftSection={<VscNewFile size={14} />}
              onClick={() => openFilesCreateModal('file')}
            >
              Create new file
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <CreateItemModal
          opened={filesCreateModal.opened}
          mode={filesCreateModal.mode}
          currentPath={buildFilesPath(filesCurrentFolderId, fsNodes)}
          onClose={() => setFilesCreateModal(m => ({ ...m, opened: false }))}
          onConfirm={handleFilesCreateConfirm}
        />
      </MantineProvider>
    </WindowButtonRegistryProvider>
  );
}

export default App;
