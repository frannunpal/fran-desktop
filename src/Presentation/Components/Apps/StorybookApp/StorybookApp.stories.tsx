import type { Meta, StoryObj } from '@storybook/react';
import StorybookApp from './StorybookApp';

const meta: Meta<typeof StorybookApp> = {
  title: 'Apps/StorybookApp',
  component: StorybookApp,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof StorybookApp>;

export const Default: Story = {
  decorators: [
    Story => (
      <div
        style={{
          width: 1100,
          height: 700,
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
