import type { Meta, StoryObj } from '@storybook/react';
import PdfApp from './PdfApp';

const meta: Meta<typeof PdfApp> = {
  title: 'Apps/PdfApp',
  component: PdfApp,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof PdfApp>;

export const Default: Story = {
  decorators: [
    Story => (
      <div
        style={{
          width: 780,
          height: 580,
          border: '1px solid rgba(128,128,128,0.2)',
          borderRadius: 8,
          overflow: 'hidden',
          background: 'var(--mantine-color-body)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
