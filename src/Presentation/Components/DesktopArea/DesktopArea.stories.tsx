import type { Meta, StoryObj } from '@storybook/react';
import DesktopArea from './DesktopArea';
import DesktopIcon from '../DesktopIcon/DesktopIcon';
import { APPS } from '@/Shared/Constants/apps';

const meta: Meta<typeof DesktopArea> = {
  title: 'Common components/DesktopArea',
  component: DesktopArea,
  parameters: { layout: 'fullscreen' },
};

const appIds = APPS.map(a => a.id);

export default meta;
type Story = StoryObj<typeof DesktopArea>;

export const Empty: Story = {};

export const WithChildren: StoryObj<{ appId: string }> = {
  argTypes: {
    appId: { control: 'select', options: appIds },
  },
  args: { appId: 'notepad' },
  render: ({ appId }) => {
    const app = APPS.find(a => a.id === appId)!;
    return (
      <DesktopArea>
        <DesktopIcon
          icon={{ id: '1', name: app.name, icon: app.icon, x: 20, y: 20, appId }}
          onDoubleClick={() => {}}
          onContextMenu={() => {}}
        />
      </DesktopArea>
    );
  },
};
