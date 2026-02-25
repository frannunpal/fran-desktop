import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import Launcher from './Launcher';
import { useDesktopStore } from '@presentation/Store/desktopStore';

const meta: Meta<typeof Launcher> = {
  title: 'Presentation/Launcher',
  component: Launcher,
  decorators: [
    Story => {
      useEffect(() => {
        useDesktopStore.getState().setThemeMode('dark');
      }, []);
      return (
        <div style={{ position: 'relative', height: '100vh', background: '#1a1b1e', display: 'flex', alignItems: 'flex-end', padding: 8 }}>
          <Story />
        </div>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Launcher>;

export const Default: Story = {};
