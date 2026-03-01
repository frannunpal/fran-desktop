import type { Meta, StoryObj } from '@storybook/react';
import ImageViewerApp from './ImageViewerApp';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';
import AppWithPickerOpen from '@/Shared/Testing/Utils/AppWithPickerOpen';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import type { FileNode } from '@/Shared/Interfaces/FileNode';

const meta: Meta<typeof ImageViewerApp> = {
  title: 'Apps/ImageViewerApp',
  component: ImageViewerApp,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof ImageViewerApp>;

/* ── Shared nodes ─────────────────────────────────────────────────────── */

const imagesFolder: FolderNode = {
  id: 'folder-images',
  name: 'Images',
  type: 'folder',
  parentId: null,
  children: ['file-wallpaper', 'file-wallpaper2'],
  createdAt: new Date(),
  updatedAt: new Date(),
};
const wallpaper1: FileNode = {
  id: 'file-wallpaper',
  name: 'wallpaper.jpg',
  type: 'file',
  parentId: 'folder-images',
  content: '',
  mimeType: 'image/jpeg',
  url: `${import.meta.env.BASE_URL}Images/wallpaper.jpg`,
  createdAt: new Date(),
  updatedAt: new Date(),
};
const wallpaper2: FileNode = {
  id: 'file-wallpaper2',
  name: 'wallpaper2.jpg',
  type: 'file',
  parentId: 'folder-images',
  content: '',
  mimeType: 'image/jpeg',
  url: `${import.meta.env.BASE_URL}Images/wallpaper2.jpg`,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fsNodes = [imagesFolder, wallpaper1, wallpaper2];

/* ── Stories ──────────────────────────────────────────────────────────── */

export const WithImage: Story = {
  render: () => (
    <AppWithPickerOpen
      win={makeWindow({
        id: 'win-image-viewer',
        title: 'Image Viewer',
        content: 'image-viewer',
        fcIcon: 'FcPicture',
        width: 700,
        height: 520,
        x: 0,
        y: 0,
        contentData: { src: `${import.meta.env.BASE_URL}Images/wallpaper.jpg` },
      })}
      fsNodes={fsNodes}
    />
  ),
};

export const NoImage: Story = {
  render: () => (
    <AppWithPickerOpen
      win={makeWindow({
        id: 'win-image-viewer-empty',
        title: 'Image Viewer',
        content: 'image-viewer',
        fcIcon: 'FcPicture',
        width: 700,
        height: 520,
        x: 0,
        y: 0,
      })}
      fsNodes={fsNodes}
    />
  ),
};

export const SmallWindow: Story = {
  render: () => (
    <AppWithPickerOpen
      win={makeWindow({
        id: 'win-image-viewer-small',
        title: 'Image Viewer',
        content: 'image-viewer',
        fcIcon: 'FcPicture',
        width: 300,
        height: 200,
        x: 0,
        y: 0,
        contentData: { src: `${import.meta.env.BASE_URL}Images/wallpaper.jpg` },
      })}
      fsNodes={fsNodes}
    />
  ),
};
