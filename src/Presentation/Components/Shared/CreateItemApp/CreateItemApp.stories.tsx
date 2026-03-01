import type { Meta, StoryObj } from '@storybook/react';
import CreateItemApp from './CreateItemApp';
import { createMockWindowEntity } from '@/Shared/Testing/Utils/makeWindowEntity';

const meta: Meta<typeof CreateItemApp> = {
  title: 'Shared/CreateItemApp',
  component: CreateItemApp,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof CreateItemApp>;

export const NewFolder: Story = {
  render: () => (
    <CreateItemApp
      window={createMockWindowEntity({
        content: 'createItem',
        contentData: { mode: 'folder', parentId: 'folder-desktop', currentPath: '/home/Desktop' },
      })}
    />
  ),
};

export const NewFile: Story = {
  render: () => (
    <CreateItemApp
      window={createMockWindowEntity({
        content: 'createItem',
        contentData: { mode: 'file', parentId: 'folder-desktop', currentPath: '/home/Desktop' },
      })}
    />
  ),
};
