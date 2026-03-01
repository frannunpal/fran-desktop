import type { Meta, StoryObj } from '@storybook/react';
import PdfApp from './PdfApp';
import { createMockWindowEntity } from '@/Shared/Testing/Utils/makeWindowEntity';

const meta: Meta<typeof PdfApp> = {
  title: 'Apps/PdfApp',
  component: PdfApp,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof PdfApp>;

export const Default: Story = {
  render: () => (
    <PdfApp
      window={createMockWindowEntity({
        title: 'PDF Viewer',
        content: 'pdf',
        contentData: { src: 'Desktop/sample.pdf' },
      })}
    />
  ),
};
