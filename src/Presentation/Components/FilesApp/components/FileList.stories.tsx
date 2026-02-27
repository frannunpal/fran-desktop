import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import FileList from '../components/FileList';
import type { FSNode } from '@/Shared/Types/FileSystemTypes';

const meta: Meta<typeof FileList> = {
  title: 'Apps/FilesApp/FileList',
  component: FileList,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof FileList>;

const mockNodes: FSNode[] = [
  {
    id: 'folder-1',
    name: 'Documents',
    type: 'folder',
    parentId: 'root',
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-2',
    name: 'Pictures',
    type: 'folder',
    parentId: 'root',
    iconName: 'VscImages',
    iconColor: '#9b59b6',
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'file-1',
    name: 'resume.pdf',
    type: 'file',
    parentId: 'root',
    content: '',
    mimeType: 'application/pdf',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'file-2',
    name: 'notes.txt',
    type: 'file',
    parentId: 'root',
    content: 'Hello world',
    mimeType: 'text/plain',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'file-3',
    name: 'readme.md',
    type: 'file',
    parentId: 'root',
    content: '# Readme',
    mimeType: 'text/markdown',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const Default: Story = {
  args: {
    nodes: mockNodes,
    onNavigate: fn(),
    onOpenFile: fn(),
    onNodeContextMenu: fn(),
  },
};

export const EmptyFolder: Story = {
  args: {
    nodes: [],
    onNavigate: fn(),
    onOpenFile: fn(),
    onNodeContextMenu: fn(),
  },
};

export const OnlyFolders: Story = {
  args: {
    nodes: mockNodes.filter(n => n.type === 'folder'),
    onNavigate: fn(),
    onOpenFile: fn(),
    onNodeContextMenu: fn(),
  },
};

export const OnlyFiles: Story = {
  args: {
    nodes: mockNodes.filter(n => n.type === 'file'),
    onNavigate: fn(),
    onOpenFile: fn(),
    onNodeContextMenu: fn(),
  },
};
