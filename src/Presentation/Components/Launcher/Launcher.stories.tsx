import type { Meta, StoryObj } from '@storybook/react';
import Launcher from './Launcher';

const meta: Meta<typeof Launcher> = {
  title: 'Common components/Launcher',
  component: Launcher,
  decorators: [
    Story => (
      <div
        style={{
          position: 'relative',
          height: '100vh',
          background: 'var(--mantine-color-body)',
          display: 'flex',
          alignItems: 'flex-end',
          padding: 8,
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Launcher>;

export const Default: Story = {};
