import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@mantine/core';
import ContextMenu from './ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'Common components/ContextMenu',
  component: ContextMenu,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const OpenAtCenter: Story = {
  args: {
    opened: true,
    position: { x: 200, y: 200 },
  },
};

export const Closed: Story = {
  args: {
    opened: false,
    position: { x: 200, y: 200 },
  },
};

const InteractiveRender = () => {
  const [opened, setOpened] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div
      style={{
        width: 600,
        height: 400,
        background: '#1a1b1e',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onContextMenu={e => {
        e.preventDefault();
        setPosition({ x: e.clientX, y: e.clientY });
        setOpened(true);
      }}
    >
      <Button variant="subtle" color="gray">
        Right-click anywhere in this area
      </Button>
      <ContextMenu
        opened={opened}
        position={position}
        onClose={() => setOpened(false)}
        onOpenApp={() => {}}
        onToggleTheme={() => {}}
      />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveRender />,
};
