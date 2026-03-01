import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import TaskbarContextMenu from './TaskbarContextMenu';
import { useDesktopStore } from '@/Presentation/Store/desktopStore';
import { useSettingsStore } from '@/Presentation/Store/settingsStore';
import { WindowButtonRegistryProvider } from '@/Presentation/Hooks/useWindowButtonRegistry';
import { useFcIconElement } from '@/Presentation/Hooks/useFcIcon';
import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';

const meta: Meta<typeof TaskbarContextMenu> = {
  title: 'Common components/TaskbarContextMenu',
  component: TaskbarContextMenu,
  parameters: { layout: 'fullscreen' },
  args: {
    menuPosition: { x: 200, y: 350 },
    targetWindowId: 'win-1',
    targetWindowState: 'normal',
    onCloseWindow: () => {},
    onMinimizeWindow: () => {},
    onMaximizeWindow: () => {},
    onRestoreWindow: () => {},
    onWindowMenuClose: () => {},
    onPanelMenuClose: () => {},
  },
  decorators: [
    Story => (
      <WindowButtonRegistryProvider>
        <div style={{ height: '100vh' }}>
          <Story />
        </div>
      </WindowButtonRegistryProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TaskbarContextMenu>;

export const WindowMenuNormal: Story = {
  name: 'Window menu — normal',
  args: {
    windowMenuOpened: true,
    panelMenuOpened: false,
    targetWindowState: 'normal',
  },
};

export const WindowMenuMinimized: Story = {
  name: 'Window menu — minimized',
  args: {
    windowMenuOpened: true,
    panelMenuOpened: false,
    targetWindowState: 'minimized',
  },
};

export const WindowMenuMaximized: Story = {
  name: 'Window menu — maximized',
  args: {
    windowMenuOpened: true,
    panelMenuOpened: false,
    targetWindowState: 'maximized',
  },
};

export const PanelMenu: Story = {
  args: {
    windowMenuOpened: false,
    panelMenuOpened: true,
  },
};

export const BothClosed: Story = {
  args: {
    windowMenuOpened: false,
    panelMenuOpened: false,
  },
};

const STORY_WINDOWS = [
  {
    title: 'Notepad',
    content: 'notepad',
    icon: '📝',
    fcIcon: 'FcEditImage',
    x: 0,
    y: 0,
    width: 600,
    height: 400,
    minWidth: 200,
    minHeight: 150,
  },
  {
    title: 'Terminal',
    content: 'terminal',
    icon: '💻',
    fcIcon: 'FcCommandLine',
    x: 0,
    y: 0,
    width: 600,
    height: 400,
    minWidth: 200,
    minHeight: 150,
  },
] as const;

const TaskbarButton = ({
  window,
  onContextMenu,
}: {
  window: WindowEntity;
  onContextMenu: (e: React.MouseEvent) => void;
}) => {
  const icon = useFcIconElement(window.fcIcon ?? '', { size: 16 });
  return (
    <button
      key={window.id}
      style={{
        height: 36,
        padding: '0 12px',
        background: 'var(--mantine-color-default)',
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 6,
        color: 'var(--mantine-color-text)',
        cursor: 'pointer',
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
      onContextMenu={onContextMenu}
    >
      {icon}
      {window.title}
    </button>
  );
};

const InteractiveRender = () => {
  const [windowMenuOpened, setWindowMenuOpened] = useState(false);
  const [panelMenuOpened, setPanelMenuOpened] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [targetWindowId, setTargetWindowId] = useState<string | null>(null);
  const windows = useDesktopStore(state => state.windows);
  const openWindow = useDesktopStore(state => state.openWindow);
  const minimizeWindow = useDesktopStore(state => state.minimizeWindow);
  const maximizeWindow = useDesktopStore(state => state.maximizeWindow);
  const restoreWindow = useDesktopStore(state => state.restoreWindow);
  const closeWindow = useDesktopStore(state => state.closeWindow);
  const taskbarBg = useSettingsStore(state => state.theme.taskbar);

  const targetWindowState = targetWindowId
    ? (windows.find(w => w.id === targetWindowId)?.state ?? null)
    : null;

  useEffect(() => {
    useDesktopStore.setState({ windows: [] });
    STORY_WINDOWS.forEach(w => openWindow(w));
  }, [openWindow]);

  const openMenu = (e: React.MouseEvent, windowId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPosition({ x: e.clientX, y: e.clientY - 8 });
    if (windowId) {
      setTargetWindowId(windowId);
      setWindowMenuOpened(true);
    } else {
      setPanelMenuOpened(true);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        background: 'var(--mantine-color-body)',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 48,
          background: taskbarBg,
          borderTop: '1px solid var(--mantine-color-default-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: 4,
        }}
        onContextMenu={e => openMenu(e)}
      >
        {windows.map(w => (
          <TaskbarButton key={w.id} window={w} onContextMenu={e => openMenu(e, w.id)} />
        ))}
      </div>
      <TaskbarContextMenu
        windowMenuOpened={windowMenuOpened}
        panelMenuOpened={panelMenuOpened}
        menuPosition={menuPosition}
        targetWindowId={targetWindowId}
        targetWindowState={targetWindowState}
        onCloseWindow={id => {
          closeWindow(id);
          setWindowMenuOpened(false);
        }}
        onMinimizeWindow={id => {
          minimizeWindow(id);
          setWindowMenuOpened(false);
        }}
        onMaximizeWindow={id => {
          maximizeWindow(id);
          setWindowMenuOpened(false);
        }}
        onRestoreWindow={id => {
          restoreWindow(id);
          setWindowMenuOpened(false);
        }}
        onWindowMenuClose={() => setWindowMenuOpened(false)}
        onPanelMenuClose={() => setPanelMenuOpened(false)}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveRender />,
};
