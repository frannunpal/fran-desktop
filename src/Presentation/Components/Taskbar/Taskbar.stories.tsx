import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import Taskbar from './Taskbar';
import { useDesktopStore } from '@presentation/Store/desktopStore';

const ResetStore = ({ mode }: { mode: 'light' | 'dark' }) => {
  useEffect(() => {
    useDesktopStore.setState({ windows: [], icons: [] });
    useDesktopStore.getState().setThemeMode(mode);
  }, [mode]);
  return null;
};

const meta: Meta<typeof Taskbar> = {
  title: 'Presentation/Taskbar',
  component: Taskbar,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof Taskbar>;

export const EmptyLight: Story = {
  decorators: [
    Story => (
      <>
        <ResetStore mode="light" />
        <div style={{ height: '100vh', background: '#f0f4f8' }}>
          <Story />
        </div>
      </>
    ),
  ],
};

export const EmptyDark: Story = {
  decorators: [
    Story => (
      <>
        <ResetStore mode="dark" />
        <div style={{ height: '100vh', background: '#1a1b1e' }}>
          <Story />
        </div>
      </>
    ),
  ],
};

export const WithWindows: Story = {
  decorators: [
    Story => {
      useEffect(() => {
        useDesktopStore.setState({ windows: [], icons: [] });
        useDesktopStore.getState().setThemeMode('dark');
        const open = useDesktopStore.getState().openWindow;
        open({ title: 'Notepad', content: 'notepad', x: 0, y: 0, width: 600, height: 400, minWidth: 200, minHeight: 150 });
        open({ title: 'Terminal', content: 'terminal', x: 0, y: 0, width: 600, height: 400, minWidth: 200, minHeight: 150 });
      }, []);
      return (
        <div style={{ height: '100vh', background: '#1a1b1e' }}>
          <Story />
        </div>
      );
    },
  ],
};
