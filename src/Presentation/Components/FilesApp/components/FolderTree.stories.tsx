import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import FolderTree from '../components/FolderTree';
import type { FSNode } from '@/Shared/Types/FileSystemTypes';

const meta: Meta<typeof FolderTree> = {
  title: 'Apps/FilesApp/FolderTree',
  component: FolderTree,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof FolderTree>;

const mockNodes: FSNode[] = [
  {
    id: 'folder-desktop',
    name: 'Desktop',
    type: 'folder',
    parentId: null,
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-documents',
    name: 'Documents',
    type: 'folder',
    parentId: null,
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-pictures',
    name: 'Pictures',
    type: 'folder',
    parentId: null,
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-work',
    name: 'Work',
    type: 'folder',
    parentId: 'folder-documents',
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-personal',
    name: 'Personal',
    type: 'folder',
    parentId: 'folder-documents',
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-projects',
    name: 'Projects',
    type: 'folder',
    parentId: 'folder-work',
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-reports',
    name: 'Reports',
    type: 'folder',
    parentId: 'folder-work',
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const Default: Story = {
  args: {
    allNodes: mockNodes,
    currentFolderId: 'folder-documents',
    onNavigate: fn(),
  },
};

export const AtRoot: Story = {
  args: {
    allNodes: mockNodes,
    currentFolderId: null,
    onNavigate: fn(),
  },
};

export const AtDesktop: Story = {
  args: {
    allNodes: mockNodes,
    currentFolderId: 'folder-desktop',
    onNavigate: fn(),
  },
};

export const Empty: Story = {
  args: {
    allNodes: [],
    currentFolderId: null,
    onNavigate: fn(),
  },
};

export const DeepNested: Story = {
  args: {
    allNodes: mockNodes,
    currentFolderId: 'folder-projects',
    onNavigate: fn(),
  },
};
