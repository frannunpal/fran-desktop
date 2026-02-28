import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import FilePickerApp from './FilePickerApp';
import ImageViewerApp from '@/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp';
import { buildImageViewerMenuBar } from '@/Presentation/Components/Apps/ImageViewerApp/buildImageViewerMenuBar';
import PdfApp from '@/Presentation/Components/Apps/PdfApp/PdfApp';
import { buildPdfViewerMenuBar } from '@/Presentation/Components/Apps/PdfApp/buildPdfViewerMenuBar';
import { useDesktopStore } from '@presentation/Store/desktopStore';
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

const containerDecorator = (Story: React.ComponentType) => (
  <div
    style={{
      width: 600,
      height: 420,
      border: '1px solid rgba(128,128,128,0.2)',
      borderRadius: 8,
      overflow: 'hidden',
      background: 'var(--mantine-color-body)',
    }}
  >
    <Story />
  </div>
);

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

const documentsFolder: FolderNode = {
  id: 'folder-documents',
  name: 'Documents',
  type: 'folder',
  parentId: null,
  children: ['file-cv'],
  createdAt: new Date(),
  updatedAt: new Date(),
};
const cvPdf: FileNode = {
  id: 'file-cv',
  name: 'CV_2026_English.pdf',
  type: 'file',
  parentId: 'folder-documents',
  content: '',
  mimeType: 'application/pdf',
  url: `${import.meta.env.BASE_URL}Desktop/CV_2026_English.pdf`,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/* ── Stories ──────────────────────────────────────────────────────────── */

/** Shows all files — no mime type restriction. */
export const Default: Story = {
  decorators: [containerDecorator],
};

/** ImageViewerApp with wallpaper.jpg open and the file picker already open,
 *  showing both wallpapers in the Images folder. */
export const ImagesOnly: Story = {
  render: () => {
    const win = makeWindow({
      id: 'win-image-viewer',
      title: 'Image Viewer',
      fcIcon: 'FcPicture',
      width: 700,
      height: 520,
      x: 0,
      y: 0,
    });

    const Wrapper = () => {
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
          <ImageViewerApp
            src={`${import.meta.env.BASE_URL}Images/wallpaper.jpg`}
            windowId={win.id}
            pickerOpen={true}
            onPickerClose={() => {}}
          />
        </AppWithPickerOpen>
      );
    };

    return <Wrapper />;
  },
};

/** PdfApp with the CV open and the file picker already open,
 *  showing the PDF files available. */
export const PdfOnly: Story = {
  render: () => {
    const win = makeWindow({
      id: 'win-pdf-viewer',
      title: 'PDF Viewer',
      fcIcon: 'FcDocument',
      width: 780,
      height: 580,
      x: 0,
      y: 0,
    });

    const Wrapper = () => {
      useEffect(() => {
        useDesktopStore.setState({
          fsNodes: [documentsFolder, cvPdf],
          windows: [win],
        });
      }, []);

      return (
        <AppWithPickerOpen
          win={win}
          menuBar={buildPdfViewerMenuBar(
            () => {},
            () => {},
          )}
        >
          <PdfApp
            src={`${import.meta.env.BASE_URL}Desktop/CV_2026_English.pdf`}
            windowId={win.id}
            pickerOpen={true}
            onPickerClose={() => {}}
          />
        </AppWithPickerOpen>
      );
    };

    return <Wrapper />;
  },
};

/** Restricts the picker to PDF files only. */
export const PdfFilter: Story = {
  decorators: [containerDecorator],
  args: {
    acceptedMimeTypes: ['application/pdf'],
  },
};

/** Accepts multiple specific mime types. */
export const ImagesAndPdf: Story = {
  decorators: [containerDecorator],
  args: {
    acceptedMimeTypes: ['image/*', 'application/pdf'],
  },
};
