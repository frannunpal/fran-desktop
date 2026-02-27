import type { Meta, StoryObj } from '@storybook/react';
import '@mantine/dates/styles.css';
import CalendarApp from './CalendarApp';

const meta: Meta<typeof CalendarApp> = {
  title: 'Apps/CalendarApp',
  component: CalendarApp,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof CalendarApp>;

export const Default: Story = {};

export const InsideWindow: Story = {
  decorators: [
    Story => (
      <div
        style={{
          width: 340,
          height: 380,
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
