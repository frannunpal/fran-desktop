import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import Launcher from './Launcher';
import Taskbar from '@presentation/Components/Taskbar/Taskbar';
import { useSettingsStore } from '@presentation/Store/settingsStore';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';

const FC_ICONS = [
  'FcDebian',
  'FcLinux',
  'FcMacOs',
  'FcWindows',
  'FcGoogle',
  'FcSearch',
  'FcSettings',
  'FcHome',
  'FcFolder',
  'FcFile',
  'FcPicture',
  'FcPdf',
  'FcDocument',
  'FcMusic',
  'FcVideo',
  'FcDownload',
  'FcUpload',
  'FcClock',
  'FcCalendar',
  'FcMail',
  'FcPhone',
  'FcContacts',
  'FcCalculator',
  'FcTerminal',
  'FcCommandLine',
  'FcCode',
  'FcEdit',
  'FcTrash',
  'FcRefresh',
];

const meta: Meta<typeof Launcher> = {
  title: 'Common components/Launcher',
  component: Launcher,
  argTypes: {
    fcIcon: { control: 'select', options: FC_ICONS },
  },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story, { args }) => {
      useEffect(() => {
        useDesktopStore.setState({ windows: [], icons: [], notifications: [] });
        useSettingsStore.getState().setLauncherIcon(args.fcIcon ?? 'FcDebian');
      }, [args.fcIcon]);
      return (
        <WindowButtonRegistryProvider>
          <div
            style={{
              height: '100vh',
              background: 'var(--mantine-color-body)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ flex: 1 }} />
            <Story />
            <Taskbar />
          </div>
        </WindowButtonRegistryProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Launcher>;

export const Default: Story = {
  args: { fcIcon: 'FcDebian' },
};
