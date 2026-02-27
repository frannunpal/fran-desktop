import type { Meta, StoryObj } from '@storybook/react';
import FileIcon from '../components/FileIcon';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';

const meta: Meta<typeof FileIcon> = {
  title: 'Apps/FilesApp/FileIcon',
  component: FileIcon,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof FileIcon>;

const mockFolderNode: FolderNode = {
  id: 'folder-1',
  name: 'TestFolder',
  type: 'folder',
  parentId: null,
  children: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFolderNodeWithIcon: FolderNode = {
  ...mockFolderNode,
  iconName: 'VscHome',
  iconColor: '#ff6b6b',
};

export const Folder: Story = {
  args: {
    type: 'folder',
    name: 'MyFolder',
    folderNode: mockFolderNode,
  },
};

export const FolderWithCustomIcon: Story = {
  args: {
    type: 'folder',
    name: 'MyFolder',
    folderNode: mockFolderNodeWithIcon,
  },
};

export const FilePdf: Story = {
  args: {
    type: 'file',
    name: 'document.pdf',
  },
};

export const FileMarkdown: Story = {
  args: {
    type: 'file',
    name: 'readme.md',
  },
};

export const FileText: Story = {
  args: {
    type: 'file',
    name: 'notes.txt',
  },
};

export const FileImage: Story = {
  args: {
    type: 'file',
    name: 'photo.png',
  },
};

export const FileCode: Story = {
  args: {
    type: 'file',
    name: 'App.tsx',
  },
};

export const FileJson: Story = {
  args: {
    type: 'file',
    name: 'config.json',
  },
};

export const FileUnknown: Story = {
  args: {
    type: 'file',
    name: 'unknown.xyz',
  },
};

export const LargeSize: Story = {
  args: {
    type: 'file',
    name: 'document.pdf',
    size: 48,
  },
};
