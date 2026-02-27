import type { Meta, StoryObj } from '@storybook/react';
import CreateItemApp from './CreateItemApp';

const meta: Meta<typeof CreateItemApp> = {
  title: 'Shared/CreateItemApp',
  component: CreateItemApp,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof CreateItemApp>;

export const NewFolder: Story = {
  args: {
    mode: 'folder',
    parentId: 'folder-desktop',
    currentPath: '/home/Desktop',
  },
};

export const NewFile: Story = {
  args: {
    mode: 'file',
    parentId: 'folder-desktop',
    currentPath: '/home/Desktop',
  },
};
