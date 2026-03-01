import type { Meta, StoryObj } from '@storybook/react';
import FilePickerApp from './FilePickerApp';
import ImageViewerApp from '@/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp';
import PdfApp from '@/Presentation/Components/Apps/PdfApp/PdfApp';
import { createMockWindowEntity } from '@/Shared/Testing/Utils/makeWindowEntity';

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
      height: 400,
      position: 'relative',
    }}
  >
    <Story />
  </div>
);

export const Default: Story = {
  decorators: [containerDecorator],
};

export const ImagesOnly: Story = {
  render: () => (
    <ImageViewerApp
      window={createMockWindowEntity({
        id: 'win-image-viewer',
        title: 'Image Viewer',
        content: 'image-viewer',
        contentData: { src: 'Images/wallpaper.jpg' },
      })}
    />
  ),
};

export const PdfOnly: Story = {
  render: () => (
    <PdfApp
      window={createMockWindowEntity({
        id: 'win-pdf-viewer',
        title: 'PDF Viewer',
        content: 'pdf',
        contentData: { src: 'Desktop/sample.pdf' },
      })}
    />
  ),
};
