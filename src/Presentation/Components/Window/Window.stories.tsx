import type { Meta, StoryObj } from '@storybook/react';
import Window from './Window';
import CalendarApp from '@presentation/Components/CalendarApp/CalendarApp';

// Storybook needs a real store for Window — provide a minimal mock via decorators
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';
import { useEffect } from 'react';
import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';

const StoreSeeder = ({ windows }: { windows: WindowEntity[] }) => {
  useEffect(() => {
    useDesktopStore.setState({ windows });
  }, [windows]);
  return null;
};

const meta: Meta<typeof Window> = {
  title: 'Common components/Window',
  component: Window,
  decorators: [
    (Story, ctx) => {
      const wins: WindowEntity[] = Array.isArray(ctx.parameters.windows)
        ? ctx.parameters.windows
        : [ctx.args.window as WindowEntity];
      return (
        <WindowButtonRegistryProvider>
          <StoreSeeder windows={wins} />
          <div
            style={{
              position: 'relative',
              width: '100vw',
              height: '100vh',
              background: 'var(--mantine-color-body)',
            }}
          >
            <Story />
          </div>
        </WindowButtonRegistryProvider>
      );
    },
  ],
  args: {
    window: makeWindow({
      id: 'win-story',
      title: 'My Window',
      icon: '📝',
      fcIcon: 'FcEditImage',
      x: 60,
      y: 60,
      width: 600,
      height: 400,
      minWidth: 300,
      minHeight: 200,
    }),
  },
};

export default meta;
type Story = StoryObj<typeof Window>;

export const Normal: Story = {};

export const Maximized: Story = {
  args: { window: makeWindow({ state: 'maximized' }) },
};

export const NarrowTitle: Story = {
  args: {
    window: makeWindow({
      title: 'A very long window title that should be truncated in the title bar',
    }),
  },
};

export const NoMaximize: Story = {
  args: { window: makeWindow({ canMaximize: false }) },
};

// AlwaysOnTop: rendered above all normal windows — shown with a normal window behind it
export const AlwaysOnTop: Story = {
  args: {
    window: makeWindow({
      id: 'win-always-on-top',
      title: 'Create Folder',
      icon: '📁',
      fcIcon: 'FcNewFolder',
      alwaysOnTop: true,
      canMaximize: false,
      width: 400,
      height: 300,
      minWidth: 350,
      minHeight: 250,
      zIndex: 10001,
      x: 200,
      y: 150,
    }),
  },
  parameters: {
    windows: [
      makeWindow({
        id: 'win-behind',
        title: 'Background Window',
        icon: '📝',
        zIndex: 1,
        x: 60,
        y: 60,
        width: 600,
        height: 400,
        minWidth: 300,
        minHeight: 200,
      }),
      makeWindow({
        id: 'win-always-on-top',
        title: 'Create Folder',
        icon: '📁',
        fcIcon: 'FcNewFolder',
        alwaysOnTop: true,
        canMaximize: false,
        width: 400,
        height: 300,
        minWidth: 350,
        minHeight: 250,
        zIndex: 10001,
        x: 200,
        y: 150,
      }),
    ],
  },
};

// Unfocused: shows the focus overlay that appears when another window has higher zIndex
export const Unfocused: Story = {
  args: {
    window: makeWindow({
      id: 'win-unfocused',
      title: 'Unfocused Window',
      icon: '📝',
      zIndex: 1,
      x: 60,
      y: 60,
      width: 600,
      height: 400,
      minWidth: 300,
      minHeight: 200,
    }),
  },
  parameters: {
    windows: [
      makeWindow({
        id: 'win-unfocused',
        title: 'Unfocused Window',
        icon: '📝',
        zIndex: 1,
        x: 60,
        y: 60,
        width: 600,
        height: 400,
        minWidth: 300,
        minHeight: 200,
      }),
      makeWindow({
        id: 'win-focused',
        title: 'Focused Window',
        icon: '📝',
        zIndex: 2,
        x: 120,
        y: 120,
        width: 600,
        height: 400,
        minWidth: 300,
        minHeight: 200,
      }),
    ],
  },
};

export const CalendarWindow: Story = {
  args: {
    window: makeWindow({
      title: 'Calendar',
      content: 'calendar',
      icon: '📅',
      fcIcon: 'FcCalendar',
      canMaximize: false,
      width: 340,
      height: 380,
      minWidth: 320,
      minHeight: 360,
    }),
  },
  render: args => (
    <Window {...args}>
      <CalendarApp />
    </Window>
  ),
};
