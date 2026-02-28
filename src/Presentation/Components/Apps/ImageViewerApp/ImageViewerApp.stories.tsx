import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import ImageViewerApp from './ImageViewerApp';
import { buildImageViewerMenuBar } from './buildImageViewerMenuBar';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';
import AppWithPickerOpen from '@/Shared/Testing/Utils/AppWithPickerOpen';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import type { FileNode } from '@/Shared/Interfaces/FileNode';

const meta: Meta<typeof ImageViewerApp> = {
  title: 'Apps/ImageViewerApp',
  component: ImageViewerApp,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    src: {
      control: 'select',
      options: [
        `${import.meta.env.BASE_URL}Images/wallpaper.jpg`,
        `${import.meta.env.BASE_URL}Images/wallpaper2.jpg`,
      ],
    },
  },
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

/* ── Window wrapper ───────────────────────────────────────────────────── */

const win = makeWindow({
  id: 'win-image-viewer',
  title: 'Image Viewer',
  fcIcon: 'FcPicture',
  width: 700,
  height: 520,
  x: 0,
  y: 0,
});

const ImageViewerInWindow = ({ src, pickerOpen = false }: { src?: string; pickerOpen?: boolean }) => {
  useEffect(() => {
    useDesktopStore.setState({
      fsNodes: [imagesFolder, wallpaper1, wallpaper2],
      windows: [win],
    });
  }, []);

  return (
    <AppWithPickerOpen
      win={win}
      menuBar={buildImageViewerMenuBar(
        () => {},
        () => {},
      )}
    >
      <ImageViewerApp src={src} windowId={win.id} pickerOpen={pickerOpen} onPickerClose={() => {}} />
    </AppWithPickerOpen>
  );
};

/* ── Stories ──────────────────────────────────────────────────────────── */

export const WithImage: Story = {
  render: () => (
    <ImageViewerInWindow src={`${import.meta.env.BASE_URL}Images/wallpaper.jpg`} />
  ),
};

export const NoImage: Story = {
  render: () => <ImageViewerInWindow />,
};

export const SmallWindow: Story = {
  render: () => {
    const smallWin = makeWindow({
      id: 'win-image-viewer-small',
      title: 'Image Viewer',
      fcIcon: 'FcPicture',
      width: 300,
      height: 200,
      x: 0,
      y: 0,
    });

    const Wrapper = () => {
      useEffect(() => {
        useDesktopStore.setState({
          fsNodes: [imagesFolder, wallpaper1, wallpaper2],
          windows: [smallWin],
        });
      }, []);

      return (
        <AppWithPickerOpen
          win={smallWin}
          menuBar={buildImageViewerMenuBar(
            () => {},
            () => {},
          )}
        >
          <ImageViewerApp
            src={`${import.meta.env.BASE_URL}Images/wallpaper.jpg`}
            windowId={smallWin.id}
            pickerOpen={false}
            onPickerClose={() => {}}
          />
        </AppWithPickerOpen>
      );
    };

    return <Wrapper />;
  },
};

export const WithPickerOpen: Story = {
  render: () => (
    <ImageViewerInWindow
      src={`${import.meta.env.BASE_URL}Images/wallpaper.jpg`}
      pickerOpen={true}
    />
  ),
};
