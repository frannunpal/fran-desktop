import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useState } from 'react';
import TaskbarContextMenu from './TaskbarContextMenu';

const meta: Meta<typeof TaskbarContextMenu> = {
  title: 'Presentation/TaskbarContextMenu',
  component: TaskbarContextMenu,
  parameters: { layout: 'fullscreen' },
  args: {
    menuPosition: { x: 200, y: 350 },
    targetWindowId: 'win-1',
    onCloseWindow: () => {},
    onWindowMenuClose: () => {},
    onPanelMenuClose: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof TaskbarContextMenu>;

export const WindowMenu: Story = {
  args: {
    windowMenuOpened: true,
    panelMenuOpened: false,
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

const InteractiveRender = () => {
  const [windowMenuOpened, setWindowMenuOpened] = useState(false);
  const [panelMenuOpened, setPanelMenuOpened] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const openMenu = (e: React.MouseEvent, isWindow: boolean) => {
    e.preventDefault();
    if (isWindow) e.stopPropagation();
    setMenuPosition({ x: e.clientX, y: e.clientY - 8 });
    if (isWindow) {
      setWindowMenuOpened(true);
    } else {
      setPanelMenuOpened(true);
    }
  };

  return (
    <div
      style={{ height: '100vh', background: '#1a1b1e', display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        style={{
          width: '100%',
          height: 48,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          gap: 4,
        }}
        onContextMenu={e => openMenu(e, false)}
      >
        {['Notepad', 'Terminal'].map(name => (
          <button
            key={name}
            style={{
              height: 36,
              padding: '0 12px',
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 13,
            }}
            onContextMenu={e => openMenu(e, true)}
          >
            {name}
          </button>
        ))}
      </div>
      <TaskbarContextMenu
        windowMenuOpened={windowMenuOpened}
        panelMenuOpened={panelMenuOpened}
        menuPosition={menuPosition}
        targetWindowId="win-1"
        onCloseWindow={fn()}
        onWindowMenuClose={() => setWindowMenuOpened(false)}
        onPanelMenuClose={() => setPanelMenuOpened(false)}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveRender />,
};
