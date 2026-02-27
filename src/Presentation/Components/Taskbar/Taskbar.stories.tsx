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
    Story => {
      useEffect(() => {
        useDesktopStore.setState({ windows: [], icons: [] });
      }, []);
      return (
        <WindowButtonRegistryProvider>
          <div style={{ height: '100vh', background: 'var(--mantine-color-body)' }}>
            <Story />
          </div>
        </WindowButtonRegistryProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Taskbar>;

export const Empty: Story = {};

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
