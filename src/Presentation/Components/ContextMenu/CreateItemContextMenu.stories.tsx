import type { Meta, StoryObj } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import CreateItemContextMenu from './CreateItemContextMenu';

const meta: Meta<typeof CreateItemContextMenu> = {
  title: 'Common components/CreateItemContextMenu',
  component: CreateItemContextMenu,
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <MantineProvider>
        <div
          style={{
            width: 400,
            height: 300,
            background: '#f5f5f5',
            borderRadius: 8,
            position: 'relative',
          }}
        >
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CreateItemContextMenu>;

export const CreateMode: Story = {
  args: {
    owner: 'desktop',
    parentId: 'folder-desktop',
    currentPath: '/home/Desktop',
  },
  render: () => {
    return (
      <CreateItemContextMenu
        owner="desktop"
        parentId="folder-desktop"
        currentPath="/home/Desktop"
      />
    );
  },
};

export const CreateModeWithPaste: Story = {
  args: {
    owner: 'desktop',
    parentId: 'folder-desktop',
    currentPath: '/home/Desktop',
  },
  render: () => {
    return (
      <CreateItemContextMenu
        owner="desktop"
        parentId="folder-desktop"
        currentPath="/home/Desktop"
      />
    );
  },
};
