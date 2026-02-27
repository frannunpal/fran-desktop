import type { Meta, StoryObj } from '@storybook/react';
import DesktopIcon from './DesktopIcon';

const meta: Meta<typeof DesktopIcon> = {
  title: 'Common components/DesktopIcon',
  component: DesktopIcon,
  decorators: [
    Story => (
      <div
        style={{
          position: 'relative',
          width: 200,
          height: 200,
          background: 'var(--mantine-color-body)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DesktopIcon>;

export const Notepad: Story = {
  args: {
    icon: { id: '1', name: 'Notepad', icon: '📝', x: 20, y: 20, appId: 'notepad' },
  },
};

export const Terminal: Story = {
  args: {
    icon: { id: '2', name: 'Terminal', icon: '💻', x: 20, y: 20, appId: 'terminal' },
  },
};

export const LongName: Story = {
  args: {
    icon: { id: '3', name: 'Very Long App Name', icon: '📁', x: 20, y: 20, appId: 'files' },
  },
};
