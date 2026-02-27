import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import CreateItemContextMenu from './CreateItemContextMenu';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import type { FSNode } from '@/Shared/Types/FileSystemTypes';

const PARENT_ID = 'folder-desktop';

const mockFile: FSNode = {
  id: 'file-1',
  name: 'my-document.txt',
  type: 'file',
  parentId: PARENT_ID,
  content: '',
  mimeType: 'text/plain',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFolder: FSNode = {
  id: 'folder-1',
  name: 'My Projects',
  type: 'folder',
  parentId: PARENT_ID,
  children: [],
  iconName: undefined,
  iconColor: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

interface StoreSetupProps {
  contextMenu?: Partial<{ x: number; y: number; owner: string; targetNodeId?: string }>;
  fsNodes?: FSNode[];
  clipboard?: { content: FSNode[]; action: 'copy' | 'cut' | null };
}

const StoreSetup = ({ contextMenu, fsNodes, clipboard }: StoreSetupProps) => {
  useEffect(() => {
    useDesktopStore.setState({
      contextMenu: { x: 160, y: 120, owner: 'desktop', ...contextMenu },
      fsNodes: fsNodes ?? [],
      clipboard: clipboard ?? { content: [], action: null },
    });
  }, []);
  return null;
};

const meta: Meta<typeof CreateItemContextMenu> = {
  title: 'Common components/CreateItemContextMenu',
  component: CreateItemContextMenu,
  parameters: { layout: 'centered' },
  decorators: [
    Story => (
      <MantineProvider>
        <div style={{ width: 400, height: 300, background: '#f5f5f5', borderRadius: 8, position: 'relative' }}>
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CreateItemContextMenu>;

// Empty space right-click: shows Create folder / Create new file
export const CreateMode: Story = {
  render: () => (
    <>
      <StoreSetup />
      <CreateItemContextMenu owner="desktop" parentId={PARENT_ID} currentPath="/home/Desktop" />
    </>
  ),
};

// Empty space right-click with clipboard content: shows Paste option
export const CreateModeWithPaste: Story = {
  render: () => (
    <>
      <StoreSetup clipboard={{ content: [mockFile], action: 'copy' }} fsNodes={[mockFile]} />
      <CreateItemContextMenu owner="desktop" parentId={PARENT_ID} currentPath="/home/Desktop" />
    </>
  ),
};

// Right-click on a file: shows file name + Cut / Copy / Delete
export const TargetFile: Story = {
  render: () => (
    <>
      <StoreSetup
        contextMenu={{ targetNodeId: mockFile.id }}
        fsNodes={[mockFile]}
      />
      <CreateItemContextMenu owner="desktop" parentId={PARENT_ID} currentPath="/home/Desktop" />
    </>
  ),
};

// Right-click on a folder: shows folder name + Cut / Copy / Delete
export const TargetFolder: Story = {
  render: () => (
    <>
      <StoreSetup
        contextMenu={{ targetNodeId: mockFolder.id }}
        fsNodes={[mockFolder]}
      />
      <CreateItemContextMenu owner="desktop" parentId={PARENT_ID} currentPath="/home/Desktop" />
    </>
  ),
};
