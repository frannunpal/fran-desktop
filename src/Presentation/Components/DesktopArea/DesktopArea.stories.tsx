import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import DesktopArea from './DesktopArea';

const meta: Meta<typeof DesktopArea> = {
  title: 'Presentation/DesktopArea',
  component: DesktopArea,
  parameters: { layout: 'fullscreen' },
  args: {
    onContextMenu: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DesktopArea>;

export const Empty: Story = {};

export const WithChildren: Story = {
  args: {
    children: (
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 40,
          padding: '8px 12px',
          background: 'rgba(255,255,255,0.15)',
          borderRadius: 8,
          color: '#fff',
          fontSize: 13,
        }}
      >
        Desktop icon placeholder
      </div>
    ),
  },
};
