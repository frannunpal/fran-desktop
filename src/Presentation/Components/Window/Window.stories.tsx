import type { Meta, StoryObj } from '@storybook/react';
import Window from './Window';
import type { WindowEntity } from '@domain/Entities/Window';
import CalendarApp from '@presentation/Components/CalendarApp/CalendarApp';

// Storybook needs a real store for Window — provide a minimal mock via decorators
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { useEffect } from 'react';

const makeWindow = (overrides: Partial<WindowEntity> = {}): WindowEntity => ({
  id: 'win-story',
  title: 'My Window',
  content: 'notepad',
  icon: '📝',
  fcIcon: 'FcEditImage',
  x: 60,
  y: 60,
  width: 600,
  height: 400,
  minWidth: 300,
  minHeight: 200,
  isOpen: true,
  state: 'normal',
  zIndex: 1,
  ...overrides,
});

const StoreSeeder = ({ win }: { win: WindowEntity }) => {
  useEffect(() => {
    useDesktopStore.setState({ windows: [win] });
  }, [win]);
  return null;
};

const meta: Meta<typeof Window> = {
  title: 'Presentation/Window',
  component: Window,
  decorators: [
    (Story, ctx) => (
      <>
        <StoreSeeder win={ctx.args.window as WindowEntity} />
        <div
          style={{ position: 'relative', width: '100vw', height: '100vh', background: 'var(--mantine-color-body)' }}
        >
          <Story />
        </div>
      </>
    ),
  ],
  args: {
    window: makeWindow(),
  },
};

export default meta;
type Story = StoryObj<typeof Window>;

export const Normal: Story = {
  args: { window: makeWindow() },
};

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
