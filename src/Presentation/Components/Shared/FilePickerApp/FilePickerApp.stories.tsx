import type { Meta, StoryObj } from '@storybook/react';
import FilePickerApp from './FilePickerApp';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';
import AppWithPickerOpen from '@/Shared/Testing/Utils/AppWithPickerOpen';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import type { FileNode } from '@/Shared/Interfaces/FileNode';

const meta: Meta<typeof FilePickerApp> = {
  title: 'Common components/FilePicker',
  component: FilePickerApp,
  parameters: { layout: 'fullscreen' },
  args: {
    onConfirm: () => {},
    onCancel: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof FilePickerApp>;

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

const desktopFolder: FolderNode = {
  id: 'folder-desktop',
  name: 'Desktop',
  type: 'folder',
  parentId: null,
  children: ['file-cv'],
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

const cvPdf: FileNode = {
  id: 'file-cv',
  name: 'CV_2026_English.pdf',
  type: 'file',
  parentId: 'folder-desktop',
  content: '',
  mimeType: 'application/pdf',
  url: `${import.meta.env.BASE_URL}Desktop/CV_2026_English.pdf`,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fsNodes = [imagesFolder, desktopFolder, wallpaper1, wallpaper2, cvPdf];

interface FilePickerStoryProps {
  acceptedMimeTypes?: string[];
  windowTitle: string;
  windowFcIcon: string;
}

const FilePickerStory = ({
  acceptedMimeTypes,
  windowTitle,
  windowFcIcon,
}: FilePickerStoryProps) => {
  return (
    <AppWithPickerOpen
      win={makeWindow({
        id: 'win-file-picker',
        title: windowTitle,
        content: 'files',
        fcIcon: windowFcIcon,
        width: 600,
        height: 400,
        x: 0,
        y: 0,
      })}
      fsNodes={fsNodes}
    >
      <FilePickerApp
        acceptedMimeTypes={acceptedMimeTypes}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    </AppWithPickerOpen>
  );
};

/* ── Stories ─────────────────────────────────────────────────────────── */

export const Default: Story = {
  render: () => <FilePickerStory windowTitle="Open File" windowFcIcon="FcFolder" />,
};

export const ImagesOnly: Story = {
  render: () => (
    <FilePickerStory
      acceptedMimeTypes={['image/*']}
      windowTitle="Open Image"
      windowFcIcon="FcPicture"
    />
  ),
};

export const PdfOnly: Story = {
  render: () => (
    <FilePickerStory
      acceptedMimeTypes={['application/pdf']}
      windowTitle="Open PDF"
      windowFcIcon="FcPdf"
    />
  ),
};
