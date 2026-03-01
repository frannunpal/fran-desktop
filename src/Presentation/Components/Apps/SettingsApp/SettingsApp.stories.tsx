import type { Meta, StoryObj } from '@storybook/react';
import SettingsApp from './SettingsApp';

const meta: Meta<typeof SettingsApp> = {
  title: 'Apps/SettingsApp',
  component: SettingsApp,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SettingsApp>;

export const Default: Story = {
  decorators: [
    Story => (
      <div
        style={{
          width: 800,
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
