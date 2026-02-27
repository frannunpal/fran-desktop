import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import Taskbar from './Taskbar';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';

const meta: Meta<typeof Taskbar> = {
  title: 'Common components/Taskbar',
  component: Taskbar,
  parameters: { layout: 'fullscreen' },
  decorators: [
    Story => (
      <WindowButtonRegistryProvider>
        <div style={{ height: '100vh', background: 'var(--mantine-color-body)' }}>
          <Story />
        </div>
      </WindowButtonRegistryProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Taskbar>;

export const Empty: Story = {
  decorators: [
    Story => {
      useEffect(() => {
        useDesktopStore.setState({ windows: [], icons: [], notifications: [] });
      }, []);
      return <Story />;
    },
  ],
};

export const WithNotifications: Story = {
  decorators: [
    Story => {
      useEffect(() => {
        useDesktopStore.setState({ windows: [], icons: [], notifications: [] });
        useDesktopStore.getState().addNotification({
          id: 'app-update',
          title: 'New version available!',
          message: 'Close this notification to install it.',
          onClose: () => window.location.reload(),
          fcIcon: 'FcEngineering',
        });
      }, []);
      return <Story />;
    },
  ],
};

export const WithNotificationsAndWindows: Story = {
  decorators: [
    Story => {
      useEffect(() => {
        useDesktopStore.setState({ windows: [], icons: [], notifications: [] });
        const open = useDesktopStore.getState().openWindow;
        open({
          title: 'Notepad',
          content: 'notepad',
          icon: '📝',
          fcIcon: 'FcEditImage',
          x: 0,
          y: 0,
          width: 600,
          height: 400,
          minWidth: 200,
          minHeight: 150,
        });
        useDesktopStore.getState().addNotification({
          id: 'app-update',
          title: 'New version available!',
          message: 'Close this notification to install it.',
          onClose: () => window.location.reload(),
          fcIcon: 'FcEngineering',
        });
      }, []);
      return <Story />;
    },
  ],
};

export const WithWindows: Story = {
  decorators: [
    Story => {
      useEffect(() => {
        useDesktopStore.setState({ windows: [], icons: [] });
        const open = useDesktopStore.getState().openWindow;
        open({
          title: 'Notepad',
          content: 'notepad',
          icon: '📝',
          fcIcon: 'FcEditImage',
          x: 0,
          y: 0,
          width: 600,
          height: 400,
          minWidth: 200,
          minHeight: 150,
        });
        open({
          title: 'Terminal',
          content: 'terminal',
          icon: '💻',
          fcIcon: 'FcCommandLine',
          x: 0,
          y: 0,
          width: 600,
          height: 400,
          minWidth: 200,
          minHeight: 150,
        });
        open({
          title: 'Files',
          content: 'files',
          icon: '📁',
          fcIcon: 'FcOpenedFolder',
          x: 0,
          y: 0,
          width: 600,
          height: 400,
          minWidth: 200,
          minHeight: 150,
        });
      }, []);
      return <Story />;
    },
  ],
};
