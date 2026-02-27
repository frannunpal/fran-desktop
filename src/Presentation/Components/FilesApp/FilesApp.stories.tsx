import type { Meta, StoryObj } from '@storybook/react';
import FilesApp from './FilesApp';

const meta: Meta<typeof FilesApp> = {
  title: 'Apps/FilesApp',
  component: FilesApp,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof FilesApp>;

export const Default: Story = {
  decorators: [
    Story => (
      <div
        style={{
          width: 700,
          height: 480,
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
